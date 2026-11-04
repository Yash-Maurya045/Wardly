# Wardly: Civic Audit & Complaint Intelligence Platform

> **"Uncovering the Unheard: Auditing Municipal Neglect through Evidence-Based AI"**

Wardly is an end-to-end municipal governance and complaint intelligence engine that bridges citizen reporting, municipal workflow management, and automated equity auditing.

---

## 🏛️ Core Concept: The Neglect Index (NI)
Wealthier and digitally active wards historically over-report complaints, whereas under-resourced wards under-report despite having greater physical infrastructure deficits.

Traditional 311 systems misallocate resources to "squeaky wheels". **Wardly computes a dynamic Neglect Index per ward:**
$$\text{Expected Complaints} = \text{Need Proxy (Infrastructure, Road Density, Population, Ward Age)} \times \text{Citywide Average Complaint Rate}$$
$$\text{Neglect Index (NI)} = \frac{\text{Expected Complaints} - \text{Actual Complaints}}{\text{Expected Complaints}}$$
- **$NI > 0.40$**: Silent / Neglected Ward flag requiring proactive municipal inspection.
- **$NI < -0.20$**: Saturated / Hyper-reporting Ward.

---

## 📦 Project Architecture
Wardly is composed of 4 key sub-systems:

```
wardly/
├── backend/          # FastAPI 0.115+, SQLAlchemy 2.0+, SQLite (local) / PostgreSQL (cloud)
│   ├── app/          # API routers: auth, complaints, wards, analytics, audit
│   └── tests/        # Pytest test suite for APIs, Auth, and Neglect Calculations
├── frontend/         # React 18 + Vite + Anime.js v4 + Leaflet + Plotly
│   ├── src/          # Interactive Ward Grid, Living Map, Citizen Portal, Officer Queue
├── data/             # Star Schema Warehouse, Parquet lakes, DuckDB OLAP
│   ├── warehouse.py  # Fact & Dimension schema, Roll-ups, Drill-downs, Apriori mining
│   └── synth.py      # Indian multilingual complaint generator (English, Hinglish, Punjabi-Latin)
├── ml/               # AI & Audit Pipeline
│   ├── classify.py   # Category & Urgency classification
│   ├── cluster.py    # Incident deduplication with FAISS & sentence embeddings
│   └── audit.py      # Linguistic & Demographic fairness bias audit
└── docs/             # Full development records and academic reports
```

---

## 🚀 Quickstart
### Prerequisites
- Python 3.11 or 3.12
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd wardly/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd wardly/frontend
npm install
npm run dev
```

---

## 📑 Academic Subject Coverage
1. **Technical Training-II (`25CAP-707`):** FastAPI REST APIs, JWT Auth, Role-based Access (Citizen, Officer, Admin), React 18 + Anime.js v4.
2. **DATA MINING AND WAREHOUSING (`25CAH-741`):** Star schema (`fact_complaint`, `dim_ward`, `dim_category`, `dim_time`), DuckDB OLAP, Apriori association, K-Means hotspotting, Decision Tree resolution modeling.
3. **Generative AI (`25CAH-742`):** Multilingual vernacular NLP triage, Google Gemini Studio for Executive Memos & Trilingual Receipts, demographic bias auditor.
4. **Cloud Computing for Data Science (`25CAH-745`):** Columnar DuckDB vs Row SQLite, Parquet data lake storage, Dockerized micro-services, Universal Automated ETL Engine.
5. **Data Visualization & Lab (`25CAT-743` / `25CAP-744`):** Interactive Leaflet Living Map, Bricolage Grotesque design system, colorblind-safe dual-chroma scale (Pulse `#2F4BFF` vs Ember `#FF9F1C`), Anime.js v4 kinetic micro-interactions.
