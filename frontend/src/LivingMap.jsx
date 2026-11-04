/* eslint-disable react-hooks/exhaustive-deps -- Leaflet map lifecycle is intentionally managed with stable refs. */
import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  fetchSpatialCatalog, 
  fetchSpatialLayers, 
  fetchExecutiveMemo 
} from './api';
import { 
  Layers,
  MapPin,
  Flame,
  Radio,
  Crosshair,
  Sparkles,
  Search,
  RefreshCw,
  Globe,
  ShieldAlert,
  Building,
  FileText,
  Compass,
  X
} from 'lucide-react';

// Tile provider configurations for dynamic landscape switching
const TILE_LANDSCAPES = {
  cyberDark: {
    id: 'cyberDark',
    name: 'Cyber Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: 'abcd'
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
    maxZoom: 18,
    subdomains: 'abc'
  },
  voyager: {
    id: 'voyager',
    name: 'Clean Streets',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: 'abcd'
  },
  topo: {
    id: 'topo',
    name: 'Topo Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    subdomains: 'abc'
  },
  osm: {
    id: 'osm',
    name: 'Classic OSM',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    subdomains: 'abc'
  }
};

// Haversine distance in meters
function computeHaversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LivingMap({ onSelectWard }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Layer Groups
  const polygonsLayerRef = useRef(null);
  const complaintsLayerRef = useRef(null);
  const hotspotsLayerRef = useRef(null);
  const sensorsLayerRef = useRef(null);
  const probeLayerRef = useRef(null);

  // Spatial Datasets State
  const [catalog, setCatalog] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('chandigarh');
  const [spatialData, setSpatialData] = useState({
    wards: [],
    complaints: [],
    hotspots: [],
    sensors: []
  });
  const [loading, setLoading] = useState(false);

  // Landscape Tile Style State
  const [activeLandscape, setActiveLandscape] = useState('cyberDark');

  // Layer Toggles
  const [showPolygons, setShowPolygons] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [silentWardsOnly, setSilentWardsOnly] = useState(false);

  // Inspection Probe Tool
  const [probeActive, setProbeActive] = useState(false);
  const [probeRadius, setProbeRadius] = useState(1500); // 1.5 km default
  const [probeCenter, setProbeCenter] = useState(null);
  const [probeStats, setProbeStats] = useState(null);

  // Filter State
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterUrgency, setFilterUrgency] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Dossier State
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [memo, setMemo] = useState(null);
  const [loadingMemo, setLoadingMemo] = useState(false);

  // 1. Load Spatial Catalog on mount
  useEffect(() => {
    async function initCatalog() {
      try {
        const cat = await fetchSpatialCatalog();
        setCatalog(cat);
      } catch (err) {
        console.warn('Using default spatial catalog fallback:', err);
        setCatalog([
          { id: 'chandigarh', name: 'Chandigarh Master', badge: 'Active Baseline' },
          { id: 'delhi', name: 'Delhi MCD Metro', badge: '12 Zones' },
          { id: 'mumbai', name: 'BMC Mumbai Coastal', badge: '10 Wards' },
          { id: 'bengaluru', name: 'BBMP Silicon Belt', badge: '12 Zones' },
          { id: 'antique', name: 'Historical Heritage Ledger', badge: '1898-2010' },
          { id: 'sensors', name: 'IoT Sensor Grid', badge: 'Real-Time' }
        ]);
      }
    }
    initCatalog();
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialProvider = TILE_LANDSCAPES.cyberDark;
    const map = L.map(mapContainerRef.current, {
      center: [30.7333, 76.7794],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom Control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Attribution bottom-right
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    // Initial Tile Layer
    tileLayerRef.current = L.tileLayer(initialProvider.url, {
      maxZoom: initialProvider.maxZoom,
      subdomains: initialProvider.subdomains,
      attribution: initialProvider.attribution
    }).addTo(map);

    // Instantiate Layer Groups in correct rendering order
    polygonsLayerRef.current = L.layerGroup().addTo(map);
    complaintsLayerRef.current = L.layerGroup().addTo(map);
    hotspotsLayerRef.current = L.layerGroup().addTo(map);
    sensorsLayerRef.current = L.layerGroup().addTo(map);
    probeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Handle map click for Inspection Probe
    map.on('click', (e) => {
      if (probeActiveRef.current) {
        setProbeCenter([e.latlng.lat, e.latlng.lng]);
      }
    });

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Stable ref for probeActive inside leaflet event handlers
  const probeActiveRef = useRef(probeActive);
  useEffect(() => {
    probeActiveRef.current = probeActive;
  }, [probeActive]);

  // 3. Switch Tile Landscape dynamically without remounting
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = TILE_LANDSCAPES[activeLandscape] || TILE_LANDSCAPES.cyberDark;

    tileLayerRef.current.setUrl(provider.url);
    tileLayerRef.current.options.maxZoom = provider.maxZoom;
    tileLayerRef.current.options.subdomains = provider.subdomains;
    tileLayerRef.current.options.attribution = provider.attribution;
  }, [activeLandscape]);

  // 4. Fetch Spatial Data when Dataset selection changes
  const loadDataset = async (datasetId) => {
    setLoading(true);
    setSelectedDossier(null);
    setMemo(null);
    setProbeCenter(null);
    setProbeStats(null);

    try {
      const data = await fetchSpatialLayers(datasetId);
      setSpatialData({
        wards: data.wards || [],
        complaints: data.complaints || [],
        hotspots: data.hotspots || [],
        sensors: data.sensors || []
      });

      // Fly to dataset center
      if (mapInstanceRef.current && data.center) {
        mapInstanceRef.current.flyTo(data.center, data.zoom || 12, {
          duration: 1.6,
          easeLinearity: 0.25
        });
      }
    } catch (err) {
      console.error(`Failed to load spatial layers for ${datasetId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataset(selectedDatasetId);
  }, [selectedDatasetId]);

  // 5. Filter Complaints dynamically
  const filteredComplaints = useMemo(() => {
    return spatialData.complaints.filter(c => {
      if (filterCategory !== 'All' && c.category !== filterCategory) return false;
      if (filterUrgency !== 'All' && c.urgency !== filterUrgency) return false;
      if (filterStatus !== 'All' && c.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${c.complaint_id} ${c.description || ''} ${c.ward_name || ''} ${c.category || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [spatialData.complaints, filterCategory, filterUrgency, filterStatus, searchQuery]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    const set = new Set();
    spatialData.complaints.forEach(c => { if (c.category) set.add(c.category); });
    return Array.from(set).sort();
  }, [spatialData.complaints]);

  // 6. Render Ward Boundary Polygons
  useEffect(() => {
    if (!polygonsLayerRef.current) return;
    polygonsLayerRef.current.clearLayers();

    if (!showPolygons) return;

    const wardsToRender = silentWardsOnly 
      ? spatialData.wards.filter(w => w.is_silent_ward) 
      : spatialData.wards;

    wardsToRender.forEach(w => {
      const ni = Number(w.neglect_index || 0);
      const isSilent = Boolean(w.is_silent_ward);

      let color = '#10B981';
      if (isSilent || ni > 0.55) {
        color = '#EF4444';
      } else if (ni > 0.35) {
        color = '#F59E0B';
      }

      if (w.polygon && Array.isArray(w.polygon) && w.polygon.length > 2) {
        const polygon = L.polygon(w.polygon, {
          color: color,
          weight: isSilent ? 2.5 : 1.5,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: isSilent ? 0.28 : 0.16,
          dashArray: isSilent ? '5, 5' : null
        });

        polygon.on('mouseover', () => {
          polygon.setStyle({
            weight: 3.5,
            fillOpacity: 0.45
          });
        });

        polygon.on('mouseout', () => {
          polygon.setStyle({
            weight: isSilent ? 2.5 : 1.5,
            fillOpacity: isSilent ? 0.28 : 0.16
          });
        });

        polygon.on('click', () => {
          setSelectedDossier({ type: 'ward', data: w });
          setMemo(null);
          if (onSelectWard) onSelectWard(w);
        });

        polygon.bindTooltip(`
          <div style="font-family: inherit; font-size: 11px; font-weight: 700; color: #F8FAFC;">
            <span>${w.ward_name}</span>
            <span style="margin-left: 6px; padding: 2px 6px; border-radius: 4px; background: ${color}33; color: ${color}; border: 1px solid ${color}66;">
              NI: ${ni.toFixed(2)}
            </span>
          </div>
        `, { sticky: true, className: 'leaflet-custom-tooltip' });

        polygonsLayerRef.current.addLayer(polygon);
      }
    });
  }, [spatialData.wards, showPolygons, silentWardsOnly]);

  // 7. Render Complaints Layer
  useEffect(() => {
    if (!complaintsLayerRef.current) return;
    complaintsLayerRef.current.clearLayers();

    if (!showComplaints) return;

    filteredComplaints.forEach(c => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      let color = '#38BDF8'; // Low
      if (c.status === 'Resolved' || c.status === 'Archived Unresolved') {
        color = c.status === 'Resolved' ? '#10B981' : '#94A3B8';
      } else if (c.urgency === 'High' || c.urgency === 'Emergency') {
        color = '#EF4444';
      } else if (c.urgency === 'Medium') {
        color = '#F59E0B';
      }

      const marker = L.circleMarker([lat, lng], {
        radius: c.urgency === 'High' ? 6 : 4.5,
        color: color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: c.urgency === 'High' ? 2 : 1
      });

      marker.on('click', () => {
        setSelectedDossier({ type: 'complaint', data: c });
        setMemo(null);
      });

      complaintsLayerRef.current.addLayer(marker);
    });
  }, [filteredComplaints, showComplaints]);

  // 8. Render Hotspots Layer
  useEffect(() => {
    if (!hotspotsLayerRef.current) return;
    hotspotsLayerRef.current.clearLayers();

    if (!showHotspots) return;

    spatialData.hotspots.forEach(h => {
      const lat = parseFloat(h.latitude);
      const lng = parseFloat(h.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const halo = L.circleMarker([lat, lng], {
        radius: 22,
        color: '#A855F7',
        fillColor: '#A855F7',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4'
      });

      const core = L.circleMarker([lat, lng], {
        radius: 6,
        color: '#FFFFFF',
        fillColor: '#9333EA',
        fillOpacity: 1,
        weight: 2
      });

      halo.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px;">
          <strong style="color: #D8B4FE;">${h.label || `Hotspot Cluster #${h.hotspot_id}`}</strong>
          <div style="color: #94A3B8; font-size: 10px; margin-top: 2px;">Radius: ${h.radius_m || 800}m &bull; ${h.severity || 'High Risk'}</div>
        </div>
      `, { className: 'leaflet-custom-tooltip' });

      hotspotsLayerRef.current.addLayer(halo);
      hotspotsLayerRef.current.addLayer(core);
    });
  }, [spatialData.hotspots, showHotspots]);

  // 9. Render IoT Sensors Layer
  useEffect(() => {
    if (!sensorsLayerRef.current) return;
    sensorsLayerRef.current.clearLayers();

    if (!showSensors) return;

    spatialData.sensors.forEach(s => {
      const lat = parseFloat(s.latitude);
      const lng = parseFloat(s.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const isWarning = s.status && (s.status.toLowerCase().includes('poor') || s.status.toLowerCase().includes('alert') || s.status.toLowerCase().includes('hazard') || s.status.toLowerCase().includes('critical'));

      const sensorMarker = L.circleMarker([lat, lng], {
        radius: 8,
        color: isWarning ? '#F43F5E' : '#06B6D4',
        fillColor: isWarning ? '#FB7185' : '#22D3EE',
        fillOpacity: 0.9,
        weight: 2
      });

      sensorMarker.on('click', () => {
        setSelectedDossier({ type: 'sensor', data: s });
      });

      sensorMarker.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; min-width: 150px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <strong style="color: #E2E8F0;">${s.name}</strong>
            <span style="font-size: 9px; padding: 1px 4px; border-radius: 3px; background: ${isWarning ? 'rgba(244,63,94,0.2)' : 'rgba(6,182,212,0.2)'}; color: ${isWarning ? '#FDA4AF' : '#67E8F9'};">
              ${s.type}
            </span>
          </div>
          <div style="font-size: 10px; color: #94A3B8; margin-top: 3px;">${s.metric}</div>
          <div style="font-size: 9px; color: ${isWarning ? '#F87171' : '#34D399'}; font-weight: 700; margin-top: 2px;">
            Status: ${s.status}
          </div>
        </div>
      `, { className: 'leaflet-custom-tooltip' });

      sensorsLayerRef.current.addLayer(sensorMarker);
    });
  }, [spatialData.sensors, showSensors]);

  // 10. Render Radial Inspection Probe Scanner
  useEffect(() => {
    if (!probeLayerRef.current) return;
    probeLayerRef.current.clearLayers();

    if (!probeActive || !probeCenter) {
      setProbeStats(null);
      return;
    }

    const [plat, plng] = probeCenter;

    const circle = L.circle([plat, plng], {
      radius: probeRadius,
      color: '#38BDF8',
      fillColor: '#0284C7',
      fillOpacity: 0.16,
      weight: 2,
      dashArray: '6, 6'
    });

    const focal = L.circleMarker([plat, plng], {
      radius: 6,
      color: '#FFFFFF',
      fillColor: '#0EA5E9',
      fillOpacity: 1,
      weight: 2
    });

    probeLayerRef.current.addLayer(circle);
    probeLayerRef.current.addLayer(focal);

    let intercepted = 0;
    let highUrgency = 0;
    let pendingCount = 0;
    const interceptedComplaints = [];

    spatialData.complaints.forEach(c => {
      const clat = parseFloat(c.latitude);
      const clng = parseFloat(c.longitude);
      if (isNaN(clat) || isNaN(clng)) return;

      const dist = computeHaversineMeters(plat, plng, clat, clng);
      if (dist <= probeRadius) {
        intercepted++;
        if (c.urgency === 'High' || c.urgency === 'Emergency') highUrgency++;
        if (c.status === 'Pending') pendingCount++;
        if (interceptedComplaints.length < 5) interceptedComplaints.push(c);
      }
    });

    const localRiskScore = intercepted > 0 
      ? Math.min(1.0, ((highUrgency * 1.5 + pendingCount) / (intercepted * 1.2))).toFixed(2)
      : '0.00';

    setProbeStats({
      centerLat: plat,
      centerLng: plng,
      radiusM: probeRadius,
      totalIntercepted: intercepted,
      highUrgency,
      pendingCount,
      localRiskScore,
      sample: interceptedComplaints
    });
  }, [probeActive, probeCenter, probeRadius, spatialData.complaints]);

  // Generate Commissioner Directive Memo
  const handleGenerateMemo = async (wardId) => {
    setLoadingMemo(true);
    try {
      const res = await fetchExecutiveMemo(wardId);
      setMemo(res);
    } catch (err) {
      console.error('Memo generation error:', err);
      setMemo({
        executive_summary: "Prioritize emergency trench restoration and immediate sewer backflow relief across the jurisdiction within 48 hours."
      });
    } finally {
      setLoadingMemo(false);
    }
  };

  return (
    <div className="spatial-intelligence-station" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── TOP CONTROL COCKPIT ── */}
      <div 
        className="glass" 
        style={{ 
          padding: '16px 20px', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* ROW 1: City / Dataset Lens Selector + Landscape Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Dataset Lens Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Compass size={13} color="#A855F7" />
              <span>City Lens:</span>
            </span>
            {catalog.map(ds => {
              const isActive = selectedDatasetId === ds.id;
              return (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDatasetId(ds.id)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>{ds.name.split(' (')[0]}</span>
                  {ds.badge && (
                    <span 
                      style={{ 
                        fontSize: '0.62rem', 
                        padding: '1px 5px', 
                        borderRadius: 4, 
                        background: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
                        color: isActive ? '#FFFFFF' : '#94A3B8'
                      }}
                    >
                      {ds.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Map Landscape Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Globe size={13} color="#38BDF8" />
              <span>Landscape:</span>
            </span>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              {Object.values(TILE_LANDSCAPES).map(land => {
                const isSelected = activeLandscape === land.id;
                return (
                  <button
                    key={land.id}
                    onClick={() => setActiveLandscape(land.id)}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.22)' : 'transparent',
                      border: isSelected ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                      color: isSelected ? '#38BDF8' : '#94A3B8',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 800 : 600,
                      padding: '4px 9px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {land.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 2: Spatial Overlays & Operational Toolbelt */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          {/* Layer Visibility Toggles */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Overlays:
            </span>
            <button
              onClick={() => setShowPolygons(!showPolygons)}
              className={`btn ${showPolygons ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Layers size={13} />
              <span>Jurisdiction Polygons ({spatialData.wards.length})</span>
            </button>
            <button
              onClick={() => setShowComplaints(!showComplaints)}
              className={`btn ${showComplaints ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <MapPin size={13} />
              <span>Complaints ({filteredComplaints.length})</span>
            </button>
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`btn ${showHotspots ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Flame size={13} />
              <span>Centroid Hotspots ({spatialData.hotspots.length})</span>
            </button>
            <button
              onClick={() => setShowSensors(!showSensors)}
              className={`btn ${showSensors ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Radio size={13} />
              <span>IoT Telemetry ({spatialData.sensors.length})</span>
            </button>
          </div>

          {/* Quick Operations: Radial Probe + Silent Filter + Refresh */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => {
                setProbeActive(!probeActive);
                if (probeActive) {
                  setProbeCenter(null);
                  setProbeStats(null);
                }
              }}
              className={`btn ${probeActive ? 'btn-primary' : 'btn-ghost'}`}
              style={{ 
                padding: '5px 12px', 
                fontSize: '0.75rem',
                borderColor: probeActive ? '#0EA5E9' : 'rgba(255,255,255,0.12)',
                background: probeActive ? 'rgba(14, 165, 233, 0.22)' : undefined,
                color: probeActive ? '#38BDF8' : undefined
              }}
              title="Click on map to measure radial complaint density"
            >
              <Crosshair size={13} />
              <span>{probeActive ? 'Probe Active (Click Map)' : 'Radial Probe'}</span>
            </button>

            <button
              onClick={() => setSilentWardsOnly(!silentWardsOnly)}
              className={`btn ${silentWardsOnly ? 'btn-primary' : 'btn-ghost'}`}
              style={{ 
                padding: '5px 10px', 
                fontSize: '0.75rem',
                borderColor: silentWardsOnly ? '#EF4444' : 'rgba(255,255,255,0.12)'
              }}
            >
              <ShieldAlert size={13} />
              <span>Silent Wards Only</span>
            </button>

            <button
              onClick={() => loadDataset(selectedDatasetId)}
              disabled={loading}
              className="btn btn-ghost"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
              title="Sync dataset"
            >
              <RefreshCw size={13} className={loading ? 'anim-icon-pulse' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* ROW 3: Complaints Filter & Search */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search complaint ID, text, or area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-textarea"
              style={{ height: 35, paddingLeft: 30, fontSize: '0.76rem' }}
            />
          </div>

          <select
            className="form-textarea"
            style={{ height: 35, fontSize: '0.76rem' }}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories ({categoriesList.length})</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="form-textarea"
            style={{ height: 35, fontSize: '0.76rem' }}
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
          >
            <option value="All">All Urgencies</option>
            <option value="High">High Urgency</option>
            <option value="Medium">Medium Urgency</option>
            <option value="Low">Low Urgency</option>
          </select>

          <select
            className="form-textarea"
            style={{ height: 35, fontSize: '0.76rem' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Archived Unresolved">Archived Unresolved</option>
          </select>
        </div>

        {/* ROW 4: Radial Scanner Controls Bar (Visible only when probe is active) */}
        {probeActive && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.28)',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.76rem',
              color: '#BAE6FD',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Crosshair size={14} color="#38BDF8" />
              <span>Inspection Radius: <strong>{(probeRadius / 1000).toFixed(1)} km</strong></span>
              <input 
                type="range"
                min="500"
                max="5000"
                step="250"
                value={probeRadius}
                onChange={e => setProbeRadius(Number(e.target.value))}
                style={{ width: 140, accentColor: '#0EA5E9' }}
              />
            </div>

            {probeStats ? (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span>Intercepted: <strong>{probeStats.totalIntercepted}</strong></span>
                <span>Critical: <strong style={{ color: '#F87171' }}>{probeStats.highUrgency}</strong></span>
                <span>Pending: <strong>{probeStats.pendingCount}</strong></span>
                <span>Local Risk: <strong style={{ color: probeStats.localRiskScore > 0.4 ? '#F87171' : '#34D399' }}>{probeStats.localRiskScore}</strong></span>
              </div>
            ) : (
              <div style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                Click anywhere on the map to deploy inspection focal ring.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MAP CONTAINER & SLIDE-OUT DOSSIER STAGE ── */}
      <div 
        className="glass" 
        style={{ 
          height: '590px', 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden', 
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Legend Overlay at bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            background: 'rgba(5, 7, 15, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: '0.7rem',
            color: '#CBD5E1',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.72rem', color: '#FAF4F0', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2 }}>
            Spatial Telemetry Legend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span>High Urgency / Silent Deficit (NI &gt; 0.55)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span>Medium Urgency (NI 0.35 - 0.55)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>Normal / Nominal Status (NI &lt; 0.35)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#A855F7', display: 'inline-block', border: '1px dashed #FFFFFF' }} />
            <span>Centroid Hotspot Cluster</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} />
            <span>IoT Sensor (Air / SCADA / Waste)</span>
          </div>
        </div>

        {/* ── SLIDE-OUT SPATIAL INTELLIGENCE DOSSIER DRAWER ── */}
        {selectedDossier && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              bottom: 14,
              width: 370,
              maxWidth: 'calc(100% - 28px)',
              zIndex: 1001,
              background: 'rgba(9, 13, 26, 0.94)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 12,
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Dossier Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {selectedDossier.type === 'ward' && <Building size={16} color="#A855F7" />}
                {selectedDossier.type === 'complaint' && <MapPin size={16} color="#38BDF8" />}
                {selectedDossier.type === 'sensor' && <Radio size={16} color="#22D3EE" />}
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#FAF4F0' }}>
                  {selectedDossier.type === 'ward' && 'Municipal Zone Intelligence'}
                  {selectedDossier.type === 'complaint' && 'Grievance Dossier'}
                  {selectedDossier.type === 'sensor' && 'IoT Telemetry Node'}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDossier(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#94A3B8',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Dossier Body (Scrollable) */}
            <div style={{ padding: 16, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selectedDossier.type === 'ward' && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF' }}>
                          {selectedDossier.data.ward_name}
                        </h3>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 3 }}>
                          Centroid: {Number(selectedDossier.data.latitude).toFixed(4)}°N, {Number(selectedDossier.data.longitude).toFixed(4)}°E
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: selectedDossier.data.is_silent_ward ? '#F87171' : '#38BDF8' }}>
                          {Number(selectedDossier.data.neglect_index).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.64rem', color: '#94A3B8', textTransform: 'uppercase' }}>Neglect Index</div>
                      </div>
                    </div>
                  </div>

                  {/* Neglect Index Formula Breakdown */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      padding: 12
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A855F7', textTransform: 'uppercase', marginBottom: 8 }}>
                      Neglect Index Mathematical Decomposition
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Reporting Deficit (40%):</span>
                        <strong style={{ color: '#E2E8F0' }}>{Math.round((selectedDossier.data.expected_complaints || 100) - (selectedDossier.data.actual_complaints || 50))} diff</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>SLA Breach Rate (35%):</span>
                        <strong style={{ color: '#F59E0B' }}>{((selectedDossier.data.breach_rate || 0.2) * 100).toFixed(0)}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Escalation Rate (25%):</span>
                        <strong style={{ color: '#F87171' }}>{((selectedDossier.data.escalation_rate || 0.15) * 100).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Demographic & Infrastructure Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Actual Complaints</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FAF4F0' }}>
                        {selectedDossier.data.actual_complaints?.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Expected Volume</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FAF4F0' }}>
                        {Math.round(selectedDossier.data.expected_complaints || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Population Density</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FAF4F0' }}>
                        {selectedDossier.data.population?.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Drainage Age</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FAF4F0' }}>
                        {selectedDossier.data.drainage_age_yrs || 24} yrs
                      </div>
                    </div>
                  </div>

                  {/* Action Directive Button */}
                  <button
                    onClick={() => handleGenerateMemo(selectedDossier.data.ward_id)}
                    disabled={loadingMemo}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      justifyContent: 'center',
                      gap: 8,
                      borderRadius: 8
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{loadingMemo ? 'Synthesizing Action Directive...' : 'Generate Commissioner Directive'}</span>
                  </button>

                  {/* Memo Display */}
                  {memo && (
                    <div
                      style={{
                        background: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: '0.78rem',
                        lineHeight: 1.55,
                        color: '#E2E8F0'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#D8B4FE', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={13} />
                        <span>AI Commissioner Executive Directive</span>
                      </div>
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {memo.memo_text || memo.executive_summary || JSON.stringify(memo)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedDossier.type === 'complaint' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      {selectedDossier.data.complaint_id}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        padding: '2px 8px', 
                        borderRadius: 999, 
                        background: selectedDossier.data.status === 'Resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: selectedDossier.data.status === 'Resolved' ? '#34D399' : '#F87171',
                        fontWeight: 700
                      }}
                    >
                      {selectedDossier.data.status || 'Pending'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FAF4F0' }}>
                    {selectedDossier.data.category}
                  </div>

                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: 12,
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                      color: '#CBD5E1',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    "{selectedDossier.data.description || 'No detailed incident log recorded.'}"
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.74rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                      <span>Zone / Ward:</span>
                      <strong style={{ color: '#E2E8F0' }}>{selectedDossier.data.ward_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                      <span>Priority:</span>
                      <strong style={{ color: selectedDossier.data.urgency === 'High' ? '#F87171' : '#38BDF8' }}>
                        {selectedDossier.data.urgency || 'Normal'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                      <span>Coordinates:</span>
                      <strong style={{ color: '#E2E8F0' }}>
                        {Number(selectedDossier.data.latitude).toFixed(4)}, {Number(selectedDossier.data.longitude).toFixed(4)}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                      <span>Timestamp:</span>
                      <strong style={{ color: '#E2E8F0' }}>{selectedDossier.data.created_at || 'Recent Log'}</strong>
                    </div>
                  </div>
                </>
              )}

              {selectedDossier.type === 'sensor' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22D3EE', fontFamily: 'var(--font-mono)' }}>
                      {selectedDossier.data.sensor_id}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        padding: '2px 8px', 
                        borderRadius: 999, 
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: '#67E8F9',
                        fontWeight: 700
                      }}
                    >
                      {selectedDossier.data.type}
                    </span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FAF4F0' }}>
                    {selectedDossier.data.name}
                  </h3>

                  <div
                    style={{
                      background: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: 8,
                      padding: 12
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase' }}>Live Metric Telemetry</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#22D3EE', marginTop: 4 }}>
                      {selectedDossier.data.metric}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#E2E8F0', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Status:</span>
                      <strong style={{ color: '#34D399' }}>{selectedDossier.data.status}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    Coordinates: {Number(selectedDossier.data.latitude).toFixed(4)}°N, {Number(selectedDossier.data.longitude).toFixed(4)}°E
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
