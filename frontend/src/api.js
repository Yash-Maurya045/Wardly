const API = 'http://localhost:8000/api';

function authHeaders(token) {
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

export async function fetchHealth() {
  const r = await fetch(`${API}/health`);
  return r.json();
}

export async function login(email, password) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!r.ok) throw new Error('Login failed');
  return r.json();
}

export async function register(data) {
  const r = await fetch(`${API}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Registration failed'); }
  return r.json();
}

export async function fetchMe(token) {
  const r = await fetch(`${API}/auth/me`, { headers: authHeaders(token) });
  return r.json();
}

// Admin User Management
export async function fetchUsers(token, role) {
  const qs = role ? `?role=${role}` : '';
  const r = await fetch(`${API}/admin/users${qs}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error('Failed to fetch users');
  return r.json();
}

export async function createUser(data, token) {
  const r = await fetch(`${API}/admin/users`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(data)
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Failed to create user'); }
  return r.json();
}

export async function updateUser(userId, data, token) {
  const r = await fetch(`${API}/admin/users/${userId}`, {
    method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to update user');
  return r.json();
}

export async function deleteUser(userId, token) {
  const r = await fetch(`${API}/admin/users/${userId}`, {
    method: 'DELETE', headers: authHeaders(token)
  });
  if (!r.ok) throw new Error('Failed to deactivate user');
  return r.json();
}

// Wards
export async function fetchNeglectMap() {
  const r = await fetch(`${API}/wards/neglect-map`);
  return r.json();
}

export async function fetchWardsList() {
  const r = await fetch(`${API}/wards/list`);
  return r.json();
}

// Complaints
export async function fetchComplaints(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/complaints?${qs}`);
  return r.json();
}

export async function submitComplaint(data) {
  const r = await fetch(`${API}/complaints`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function trackComplaint(complaintId) {
  const r = await fetch(`${API}/complaints/track/${complaintId}`);
  if (!r.ok) throw new Error('Complaint not found');
  return r.json();
}

export async function rateComplaint(complaintId, rating, comment, token) {
  const r = await fetch(`${API}/complaints/${complaintId}/rate`, {
    method: 'POST', headers: authHeaders(token),
    body: JSON.stringify({ rating, comment })
  });
  return r.json();
}

export async function updateComplaint(complaintId, data, token) {
  const r = await fetch(`${API}/complaints/${complaintId}`, {
    method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error((await r.json()).detail || 'Could not update complaint');
  return r.json();
}

export async function deleteComplaint(complaintId, token) {
  const r = await fetch(`${API}/complaints/${complaintId}`, {
    method: 'DELETE', headers: authHeaders(token)
  });
  if (!r.ok) throw new Error((await r.json()).detail || 'Could not delete complaint');
  return r.json();
}

// AI
export async function predictComplaint(text) {
  const r = await fetch(`${API}/ai/predict`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return r.json();
}

// Analytics
export async function fetchKPIs() {
  const r = await fetch(`${API}/analytics/kpis`);
  return r.json();
}

export async function fetchCategoryDistribution() {
  const r = await fetch(`${API}/analytics/category-distribution`);
  return r.json();
}

export async function fetchTemporalTrends() {
  const r = await fetch(`${API}/analytics/temporal-trends`);
  return r.json();
}

export async function fetchWardComparison() {
  const r = await fetch(`${API}/analytics/ward-comparison`);
  return r.json();
}

export async function fetchUrgencyBreakdown() {
  const r = await fetch(`${API}/analytics/urgency-breakdown`);
  return r.json();
}

export async function fetchResolutionPerformance() {
  const r = await fetch(`${API}/analytics/resolution-performance`);
  return r.json();
}

export async function fetchHourlyHeatmap() {
  const r = await fetch(`${API}/analytics/hourly-heatmap`);
  return r.json();
}

export async function fetchPovertyCorrelation() {
  const r = await fetch(`${API}/analytics/poverty-correlation`);
  return r.json();
}

export async function fetchClusteringAnalysis() {
  const r = await fetch(`${API}/analytics/clustering`);
  return r.json();
}

export async function fetchDbBenchmark() {
  const r = await fetch(`${API}/analytics/db-benchmark`);
  return r.json();
}

export async function fetchHotspots() {
  const r = await fetch(`${API}/analytics/hotspots`);
  return r.json();
}

export async function fetchFairnessAudit() {
  const r = await fetch(`${API}/audit/fairness`);
  return r.json();
}

export async function fetchAssociationRules(limit = 25) {
  const r = await fetch(`${API}/analytics/association-rules?limit=${limit}`);
  return r.json();
}

export async function fetchExecutiveMemo(ward_id) {
  const r = await fetch(`${API}/ai/executive-memo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ward_id })
  });
  return r.json();
}

export async function fetchCitizenLetter(category, urgency, description) {
  const r = await fetch(`${API}/ai/citizen-letter`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, urgency, description })
  });
  return r.json();
}

// Multi-Domain Datasets
export async function fetchInfrastructureAnalytics() {
  const r = await fetch(`${API}/analytics/infrastructure`);
  return r.json();
}

export async function fetchEnvironmentalAnalytics() {
  const r = await fetch(`${API}/analytics/environmental`);
  return r.json();
}

export async function fetchFleetAnalytics() {
  const r = await fetch(`${API}/analytics/fleet`);
  return r.json();
}

export async function cleanAndImportDataset({ mode = 'replace', preset = null, file = null }) {
  const url = new URL(`${API}/data/clean-and-import`);
  url.searchParams.set('mode', mode);
  if (preset) url.searchParams.set('preset', preset);

  let options = { method: 'POST' };
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    options.body = formData;
  }

  let r;
  try {
    r = await fetch(url.toString(), options);
  } catch (netErr) {
    console.error('cleanAndImportDataset fetch network error:', netErr);
    throw new Error(`Upload connection failed: ${netErr.message || 'Server unreachable'}. Verify backend server is running.`);
  }

  if (!r.ok) {
    let errMsg = `Server returned HTTP ${r.status}`;
    try {
      const err = await r.json();
      errMsg = err.detail || err.message || errMsg;
    } catch (_) {
      try {
        const text = await r.text();
        if (text) errMsg = text.slice(0, 300);
      } catch (__) {}
    }
    throw new Error(errMsg);
  }
  return r.json();
}

export async function fetchActiveDataset() {
  const r = await fetch(`${API}/data/active-dataset`);
  if (!r.ok) throw new Error('Failed to fetch active dataset');
  return r.json();
}

export async function talkToFile({ query }) {
  const r = await fetch(`${API}/data/talk-to-file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!r.ok) {
    const err = await r.json();
    throw new Error(err.detail || 'Failed to communicate with data studio');
  }
  return r.json();
}

export async function fetchAutoMlProfile() {
  const r = await fetch(`${API}/data/auto-ml-profile`);
  if (!r.ok) throw new Error('Failed to fetch dataset profile');
  return r.json();
}

export async function fetchDatasetDescribe() {
  const r = await fetch(`${API}/data/describe`);
  if (!r.ok) throw new Error('Failed to fetch dataset description');
  return r.json();
}

export async function trainAutoMlModel(targetColumn, modelType = 'auto', testSize = 0.2) {
  const r = await fetch(`${API}/automl/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_column: targetColumn, model_type: modelType, test_size: testSize })
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail || 'Automated model training failed');
  }
  return r.json();
}

export async function cleanAndTransformDataset(payload = {}) {
  const r = await fetch(`${API}/data/clean-transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to execute data cleaning pipeline');
  }
  return r.json();
}

export function getCleanedCsvDownloadUrl() {
  return `${API}/data/export-cleaned-csv`;
}

export async function fetchSampleTemplates() {
  const r = await fetch(`${API}/data/sample-templates`);
  return r.json();
}

export async function resetBenchmarkDataset() {
  const r = await fetch(`${API}/data/reset-benchmark`, { method: 'POST' });
  if (!r.ok) throw new Error('Failed to reset benchmark dataset');
  return r.json();
}

export function getDownloadTemplateUrl(templateName) {
  return `${API}/data/download-template/${templateName}`;
}

export async function importDataset(datasetType, records) {
  const r = await fetch(`${API}/data/import`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_type: datasetType, records })
  });
  if (!r.ok) throw new Error((await r.json()).detail || 'Failed to import data');
  return r.json();
}

export async function exportDataset(dataset) {
  const r = await fetch(`${API}/data/export/${dataset}`);
  if (!r.ok) {
    const errorText = await r.text().catch(() => '');
    throw new Error(`Export failed (${r.status}): ${errorText || r.statusText}`);
  }
  return r.json();
}

export function getExportDownloadUrl(dataset, format = 'csv') {
  return `${API}/data/export/${dataset}?format=${format}`;
}

// ────────── OPEN GOVERNMENT DATA (DATA.GOV.IN) ──────────
export async function fetchOgdCatalog() {
  const r = await fetch(`${API}/ogd/catalog`);
  if (!r.ok) throw new Error('Failed to fetch OGD catalog');
  const data = await r.json();
  return Array.isArray(data) ? data : (data.datasets || []);
}

export async function fetchOgdDataset(datasetKey) {
  const r = await fetch(`${API}/ogd/dataset/${datasetKey}`);
  if (!r.ok) throw new Error('Failed to fetch OGD dataset');
  return r.json();
}

export async function fetchOgdAiInsights(datasetKey, filterState = null, metricFocus = null) {
  const r = await fetch(`${API}/ogd/ai-insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_key: datasetKey, filter_state: filterState, metric_focus: metricFocus })
  });
  if (!r.ok) throw new Error('Failed to generate OGD AI insights');
  return r.json();
}

export async function queryOgdLive(resourceId, apiKey = null, limit = 25) {
  const r = await fetch(`${API}/ogd/query-live`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource_id: resourceId, api_key: apiKey, limit })
  });
  if (!r.ok) throw new Error('Failed to query OGD gateway');
  return r.json();
}

export async function chatWithOgdData(query, datasetKey, cityFocus = 'All') {
  const r = await fetch(`${API}/ogd/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, dataset_key: datasetKey, city_focus: cityFocus })
  });
  if (!r.ok) throw new Error('Failed to communicate with Civic LLM');
  return r.json();
}

export async function fetchSystemReviews() {
  const r = await fetch(`${API}/reviews`);
  if (!r.ok) throw new Error('Failed to load system reviews');
  return r.json();
}

export async function submitSystemReview(data) {
  const r = await fetch(`${API}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Failed to submit system review');
  return r.json();
}

export async function chatWithDeveloperAi(message, history = []) {
  const r = await fetch(`${API}/developer/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  if (!r.ok) throw new Error('Failed to communicate with Wardly Developer Assistant');
  return r.json();
}

export async function fetchSpatialCatalog() {
  const r = await fetch(`${API}/spatial/catalog`);
  if (!r.ok) throw new Error('Failed to fetch spatial catalog');
  return r.json();
}

export async function fetchSpatialLayers(datasetId = 'chandigarh') {
  const r = await fetch(`${API}/spatial/layers/${datasetId}`);
  if (!r.ok) throw new Error(`Failed to fetch spatial layers for ${datasetId}`);
  return r.json();
}


