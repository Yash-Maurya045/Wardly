import sys, os
import shutil
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from httpx import AsyncClient, ASGITransport
from app import main as main_module

app = main_module.app

pytestmark = pytest.mark.asyncio

@pytest.fixture(autouse=True, scope="module")
def setup_benchmark_data():
    try:
        from app.main import reset_to_benchmark
        reset_to_benchmark()
    except Exception:
        pass
    yield
    try:
        from app.main import reset_to_benchmark
        reset_to_benchmark()
    except Exception:
        pass

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_login_citizen():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "citizen@wardly.gov",
            "password": "password123"
        })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "citizen"

@pytest.mark.asyncio
async def test_auth_invalid_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "citizen@wardly.gov",
            "password": "wrongpassword123"
        })
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_citizen_cannot_update_complaint_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_response = await ac.post("/api/auth/login", json={
            "email": "citizen@wardly.gov", "password": "password123"
        })
        token = login_response.json()["access_token"]
        response = await ac.patch(
            "/api/complaints/not-a-real-id/status",
            params={"token": token}, json={"status": "Resolved"}
        )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_neglect_map_and_planted_silent_wards():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/wards/neglect-map")
    assert response.status_code == 200
    wards = response.json()
    assert len(wards) == 20
    top_3 = wards[:3]
    top_ids = {w["ward_id"] for w in top_3}
    assert 7 in top_ids or 14 in top_ids or 19 in top_ids
    assert all(w["is_silent_ward"] is True for w in top_3)
    # Verify lat/lng coordinates are present for all 20 wards
    assert all("latitude" in w and "longitude" in w for w in wards)

@pytest.mark.asyncio
async def test_ai_multilingual_inference():
    # CI must not depend on a live third-party AI service.
    from app import gemini_service
    original_triage = gemini_service.generate_complaint_triage
    gemini_service.generate_complaint_triage = lambda text: None
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/ai/predict", json={
            "text": "Sadak me 2 foot gehra gaddha ho gaya hai barish ke baad"
        })
    gemini_service.generate_complaint_triage = original_triage
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_category"] == "Roads & Potholes"

@pytest.mark.asyncio
async def test_emergency_complaints_are_high_priority():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/ai/predict", json={"text": "A gas cylinder blast has set a building on fire"})
    data = response.json()
    assert response.status_code == 200
    assert data["predicted_urgency"] == "High"
    assert data["predicted_category"] == "Emergency & Public Safety"

@pytest.mark.asyncio
async def test_citywide_kpis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/analytics/kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["total_complaints"] >= 50000
    assert data["detected_silent_wards"] >= 3

@pytest.mark.asyncio
async def test_association_rules_mining_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/analytics/association-rules?limit=10")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) > 0
    rule = rules[0]
    assert "antecedent" in rule
    assert "consequent" in rule
    assert "lift" in rule
    assert rule["lift"] >= 1.0

@pytest.mark.asyncio
async def test_create_complaint_sanitization(tmp_path, monkeypatch):
    # Keep the integration test from modifying the checked-in demo warehouse.
    test_database = tmp_path / "warehouse.duckdb"
    shutil.copy(main_module.DB_PATH, test_database)
    monkeypatch.setattr(main_module, "DB_PATH", test_database)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/complaints", json={
            "ward_id": 1,
            "category": "Roads & Potholes",
            "description": "<script>alert('xss')</script>Pothole near sector 17 bus stop",
            "urgency": "High",
            "latitude": 30.7333,
            "longitude": 76.7794
        })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "WDL-" in data["complaint_id"]

@pytest.mark.asyncio
async def test_officer_can_update_and_remove_complaint(tmp_path, monkeypatch):
    test_database = tmp_path / "warehouse.duckdb"
    shutil.copy(main_module.DB_PATH, test_database)
    monkeypatch.setattr(main_module, "DB_PATH", test_database)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_response = await ac.post("/api/auth/login", json={
            "email": "officer@wardly.gov", "password": "password123"
        })
        token = login_response.json()["access_token"]
        complaints = (await ac.get("/api/complaints?limit=1")).json()
        complaint_id = complaints[0]["complaint_id"]
        updated = await ac.patch(
            f"/api/complaints/{complaint_id}", params={"token": token},
            json={"status": "In Progress", "urgency": "High"}
        )
        removed = await ac.delete(f"/api/complaints/{complaint_id}", params={"token": token})
    assert updated.status_code == 200
    assert removed.status_code == 200

@pytest.mark.asyncio
async def test_admin_can_import_complaints_in_bulk(tmp_path, monkeypatch):
    test_database = tmp_path / "warehouse.duckdb"
    shutil.copy(main_module.DB_PATH, test_database)
    monkeypatch.setattr(main_module, "DB_PATH", test_database)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_response = await ac.post("/api/auth/login", json={"email": "admin@wardly.gov", "password": "adminpassword"})
        token = login_response.json()["access_token"]
        response = await ac.post("/api/complaints/bulk", headers={"Authorization": f"Bearer {token}"}, json={"complaints": [
            {"ward_id": 1, "category": "Solid Waste & Garbage Dumps", "description": "Waste collection missed for three days", "urgency": "Medium"},
            {"ward_id": 2, "category": "Emergency & Public Safety", "description": "Gas leak reported beside the market", "urgency": "High"}
        ]})
    assert response.status_code == 200
    assert response.json()["created_count"] == 2

@pytest.mark.asyncio
async def test_auto_ml_profile_and_cleaning_pipeline():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r_profile = await ac.get("/api/data/auto-ml-profile")
        assert r_profile.status_code == 200
        p = r_profile.json()
        assert "total_rows" in p
        assert "columns" in p
        assert len(p["columns"]) > 0

        r_clean = await ac.post("/api/data/clean-transform", json={
            "impute_missing": True,
            "drop_duplicates": True,
            "clean_column_names": True,
            "clamp_outliers": True,
            "strip_whitespace": True
        })
        assert r_clean.status_code == 200
        assert r_clean.json()["success"] is True
        assert "summary" in r_clean.json()

        r_csv = await ac.get("/api/data/export-cleaned-csv")
        assert r_csv.status_code == 200
        assert "text/csv" in r_csv.headers["content-type"]
        assert len(r_csv.text) > 50

@pytest.mark.asyncio
async def test_spatial_catalog_and_city_layers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r_cat = await ac.get("/api/spatial/catalog")
        assert r_cat.status_code == 200
        cat = r_cat.json()
        assert len(cat) >= 6
        dataset_ids = [d["id"] for d in cat]
        assert "chandigarh" in dataset_ids
        assert "delhi" in dataset_ids
        assert "mumbai" in dataset_ids
        assert "bengaluru" in dataset_ids

        # Test Chandigarh layer
        r_chd = await ac.get("/api/spatial/layers/chandigarh")
        assert r_chd.status_code == 200
        d_chd = r_chd.json()
        assert len(d_chd["wards"]) == 20
        assert len(d_chd["complaints"]) > 0

        # Test Delhi layer
        r_del = await ac.get("/api/spatial/layers/delhi")
        assert r_del.status_code == 200
        d_del = r_del.json()
        assert len(d_del["wards"]) == 12
        assert len(d_del["hotspots"]) > 0

        # Test Bengaluru layer
        r_blr = await ac.get("/api/spatial/layers/bengaluru")
        assert r_blr.status_code == 200
        d_blr = r_blr.json()
        assert len(d_blr["wards"]) == 12

@pytest.mark.asyncio
async def test_dataset_describe_and_automl_training():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r_desc = await ac.get("/api/data/describe")
        assert r_desc.status_code == 200
        desc = r_desc.json()
        assert "numeric_stats" in desc
        assert "categorical_stats" in desc

        r_train = await ac.post("/api/automl/train", json={"target_column": "urgency"})
        assert r_train.status_code == 200
        train_res = r_train.json()
        assert train_res["success"] is True
        assert train_res["task_type"] == "classification"
        assert "accuracy" in train_res["metrics"]
        assert len(train_res["feature_importances"]) > 0

@pytest.mark.asyncio
async def test_export_dataset_active_and_rows_format():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r_exp = await ac.get("/api/data/export/active")
        assert r_exp.status_code == 200
        data = r_exp.json()
        assert "rows" in data
        assert "data" in data
        assert len(data["rows"]) > 0
        assert len(data["data"]) == len(data["rows"])

@pytest.mark.asyncio
async def test_file_upload_with_mixed_floats_and_nulls():
    """Verifies that arbitrary CSV files with mixed numbers/nulls upload cleanly without TypeError."""
    csv_content = (
        "id,complaint_text,ward_name,rating,department,latitude,longitude\n"
        "101,Broken road and deep pothole on main road,Ward 1,4.5,PWD,30.733,76.779\n"
        "102,Water leakage from underground pipe,Ward 2,,Water Supply,30.741,76.782\n"
        "103,Street light flickering,Ward 3,3.0,Electricity,,\n"
        "104,Garbage overflow near market,Ward 1,5.0,Sanitation,30.735,76.775\n"
    )
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("test_city_data.csv", csv_content.encode("utf-8"), "text/csv")}
        r = await ac.post("/api/data/clean-and-import?mode=replace", files=files)
        assert r.status_code == 200
        res = r.json()
        assert res["success"] is True
        assert res["audit_report"]["initial_rows"] == 4
        assert res["domain_info"]["is_compatible"] is True

        # Test talk-to-file
        r_talk = await ac.post("/api/data/talk-to-file", json={"query": "Summarize this dataset"})
        assert r_talk.status_code == 200
        talk_data = r_talk.json()
        assert "reply" in talk_data

        # Restore benchmark state
        r_reset = await ac.post("/api/data/reset-benchmark")
        assert r_reset.status_code == 200



