import React, { useState, useEffect, useRef, useMemo } from 'react';
import WardlyLogo from './WardlyLogo';
import {
  Users,
  Shield,
  Activity,
  Sparkles,
  ArrowRight,
  Radio,
  Clock,
  Globe,
  Cpu,
  Layers,
  Sliders,
  CheckCircle2,
  Check,
  TrendingDown,
  LayoutDashboard,
  AlertTriangle,
  Droplet,
  Wind,
  Scale,
  MapPin,
  Settings,
  HelpCircle,
  Filter,
  Download,
  Code2
} from 'lucide-react';
import { animate, stagger } from 'animejs';

export default function NextGenHeroPage({ onLogin, onRegister, onSwitchToLegacy, onOpenAbout }) {
  // Authentication Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [wardId, setWardId] = useState(1);
  const [gender, setGender] = useState('Other');
  const [ageGroup, setAgeGroup] = useState('26-40');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Civic Domain Profiles (Real Municipal Telemetry)
  const profiles = useMemo(() => [
    {
      id: 'telemetry',
      label: 'Spatial Telemetry',
      metricA: { val: '50,000', label: 'Tickets', sub: '+12% MoM' },
      metricB: { val: '14.2 min', label: 'Dispatch SLA', sub: '-28% Latency' },
      metricC: { val: '98.4%', label: 'Resolution Rate', sub: 'Target: 95%' },
      activeSpend: '247 Active',
      activeRevenue: '48,210 In SLA',
      bars: [
        { label: 'Jan', val: 65, color: 'linear-gradient(180deg, #A855F7 0%, #6366F1 100%)' },
        { label: 'Feb', val: 78, color: 'linear-gradient(180deg, #C084FC 0%, #7C3AED 100%)' },
        { label: 'Mar', val: 92, color: 'linear-gradient(180deg, #E879F9 0%, #9333EA 100%)' },
        { label: 'Apr', val: 100, color: 'linear-gradient(180deg, #D946EF 0%, #7E22CE 100%)' },
        { label: 'May', val: 82, color: 'linear-gradient(180deg, #A855F7 0%, #6366F1 100%)' },
        { label: 'Jun', val: 74, color: 'linear-gradient(180deg, #C084FC 0%, #7C3AED 100%)' },
        { label: 'Jul', val: 88, color: 'linear-gradient(180deg, #E879F9 0%, #9333EA 100%)' },
        { label: 'Aug', val: 95, color: 'linear-gradient(180deg, #D946EF 0%, #6D28D9 100%)' },
        { label: 'Sep', val: 70, color: 'linear-gradient(180deg, #A855F7 0%, #6366F1 100%)' },
        { label: 'Oct', val: 84, color: 'linear-gradient(180deg, #C084FC 0%, #7C3AED 100%)' },
        { label: 'Nov', val: 90, color: 'linear-gradient(180deg, #E879F9 0%, #9333EA 100%)' },
        { label: 'Dec', val: 96, color: 'linear-gradient(180deg, #D946EF 0%, #581C87 100%)' }
      ],
      sparkline: 'M 0,35 Q 20,10 40,25 T 80,12 T 120,30 T 160,8'
    },
    {
      id: 'air',
      label: 'CAAQMS Air Radar',
      metricA: { val: '58 µg/m³', label: 'PM2.5 Avg', sub: 'Safe: < 60' },
      metricB: { val: '20 / 20', label: 'Sensors Online', sub: '100% Ingest' },
      metricC: { val: '15 min', label: 'Sync Cadence', sub: 'Real-time' },
      activeSpend: '4 Moderate',
      activeRevenue: '16 Optimal',
      bars: [
        { label: 'Sec 17', val: 62, color: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)' },
        { label: 'Ind Area', val: 96, color: 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)' },
        { label: 'Sec 22', val: 45, color: 'linear-gradient(180deg, #10B981 0%, #047857 100%)' },
        { label: 'Manimajra', val: 82, color: 'linear-gradient(180deg, #FB923C 0%, #C2410C 100%)' },
        { label: 'PGI Gate', val: 54, color: 'linear-gradient(180deg, #38BDF8 0%, #0369A1 100%)' },
        { label: 'Sec 43', val: 74, color: 'linear-gradient(180deg, #A855F7 0%, #6B21A8 100%)' },
        { label: 'Sec 35', val: 40, color: 'linear-gradient(180deg, #10B981 0%, #059669 100%)' },
        { label: 'Sec 26', val: 88, color: 'linear-gradient(180deg, #F43F5E 0%, #BE123C 100%)' },
        { label: 'Sec 19', val: 52, color: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)' },
        { label: 'Sec 08', val: 48, color: 'linear-gradient(180deg, #10B981 0%, #059669 100%)' },
        { label: 'Sec 11', val: 68, color: 'linear-gradient(180deg, #A855F7 0%, #6B21A8 100%)' },
        { label: 'Sec 45', val: 80, color: 'linear-gradient(180deg, #FB923C 0%, #C2410C 100%)' }
      ],
      sparkline: 'M 0,25 Q 20,38 40,15 T 80,32 T 120,10 T 160,20'
    },
    {
      id: 'water',
      label: 'AMRUT 2.0 Water',
      metricA: { val: '144 LPCD', label: 'Delivered Flow', sub: 'Target: 135' },
      metricB: { val: '16.8%', label: 'Non-Rev Loss', sub: 'Benchmark: <20%' },
      metricC: { val: '98.1%', label: 'Purity Pass', sub: 'ISO 10500' },
      activeSpend: '2 Alerts',
      activeRevenue: '18 Stable',
      bars: [
        { label: 'W-01', val: 90, color: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)' },
        { label: 'W-03', val: 94, color: 'linear-gradient(180deg, #38BDF8 0%, #0369A1 100%)' },
        { label: 'W-04', val: 65, color: 'linear-gradient(180deg, #FB923C 0%, #EA580C 100%)' },
        { label: 'W-07', val: 100, color: 'linear-gradient(180deg, #10B981 0%, #047857 100%)' },
        { label: 'W-08', val: 86, color: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)' },
        { label: 'W-10', val: 52, color: 'linear-gradient(180deg, #EF4444 0%, #991B1B 100%)' },
        { label: 'W-12', val: 92, color: 'linear-gradient(180deg, #818CF8 0%, #4338CA 100%)' },
        { label: 'W-14', val: 78, color: 'linear-gradient(180deg, #A855F7 0%, #7E22CE 100%)' },
        { label: 'W-16', val: 88, color: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)' },
        { label: 'W-17', val: 95, color: 'linear-gradient(180deg, #10B981 0%, #047857 100%)' },
        { label: 'W-19', val: 82, color: 'linear-gradient(180deg, #818CF8 0%, #4338CA 100%)' },
        { label: 'W-20', val: 76, color: 'linear-gradient(180deg, #A855F7 0%, #7E22CE 100%)' }
      ],
      sparkline: 'M 0,15 Q 20,30 40,10 T 80,25 T 120,8 T 160,18'
    },
    {
      id: 'equity',
      label: 'Demographic Equity',
      metricA: { val: '0.03 Delta', label: 'Parity Ratio', sub: 'Barrier: <=0.05' },
      metricB: { val: '100% Pass', label: 'Disparate Impact', sub: 'Zero Bias' },
      metricC: { val: 'Invariant', label: 'Fairness Loss', sub: 'Constrained' },
      activeSpend: 'Zero Drift',
      activeRevenue: 'Protected SLA',
      bars: [
        { label: 'Q1', val: 95, color: 'linear-gradient(180deg, #10B981 0%, #047857 100%)' },
        { label: 'Q2', val: 94, color: 'linear-gradient(180deg, #10B981 0%, #059669 100%)' },
        { label: 'Q3', val: 98, color: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)' },
        { label: 'Q4', val: 92, color: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)' },
        { label: 'Periphery', val: 88, color: 'linear-gradient(180deg, #FB923C 0%, #EA580C 100%)' },
        { label: 'Core', val: 100, color: 'linear-gradient(180deg, #10B981 0%, #047857 100%)' },
        { label: 'Commercial', val: 92, color: 'linear-gradient(180deg, #A855F7 0%, #7E22CE 100%)' },
        { label: 'Slum Colony', val: 86, color: 'linear-gradient(180deg, #F43F5E 0%, #BE123C 100%)' },
        { label: 'Rural Belt', val: 90, color: 'linear-gradient(180deg, #10B981 0%, #059669 100%)' },
        { label: 'Transit Hub', val: 94, color: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)' },
        { label: 'Industrial', val: 88, color: 'linear-gradient(180deg, #FB923C 0%, #EA580C 100%)' },
        { label: 'Heritage', val: 96, color: 'linear-gradient(180deg, #10B981 0%, #047857 100%)' }
      ],
      sparkline: 'M 0,20 Q 20,22 40,18 T 80,20 T 120,19 T 160,20'
    }
  ], []);

  // Autonomous Sequence State (Zero clicking required)
  const [profileIndex, setProfileIndex] = useState(0);
  const barContainerRef = useRef(null);

  // 1. Autonomous Timeline Cycle Engine (Cycles every 6.2s without consent or clicking)
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfileIndex(prev => (prev + 1) % profiles.length);
    }, 6200);

    return () => clearTimeout(timer);
  }, [profileIndex, profiles.length]);

  // 2. Sequential Organic Bar Growth ("each bar is having their own animation. They are slowly growing...")
  useEffect(() => {
    if (!barContainerRef.current) return;
    const barElements = barContainerRef.current.querySelectorAll('.puzzle-bar-fill');
    if (!barElements.length) return;

    barElements.forEach(el => {
      el.style.transform = 'scaleY(0)';
      el.style.opacity = '0.35';
    });

    animate(barElements, {
      scaleY: [0, 1],
      opacity: [0.35, 1],
      duration: 500,
      delay: stagger(120),
      ease: 'outBack(1.2)'
    });
  }, [profileIndex]);

  // 1-Click Demo Login
  const handleQuickDemo = async (demoEmail, demoRole) => {
    setLoading(true);
    setError('');
    try {
      await onLogin(demoEmail, 'demo123');
    } catch (err) {
      setError(err.message || 'Demo login failed');
      setShowAuthModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Auth Form Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister({
          email,
          password,
          name,
          role,
          ward_id: Number(wardId),
          gender,
          age_group: ageGroup,
          phone,
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[profileIndex];

  return (
    <div className="puzzle-hero-viewport">
      <div className="puzzle-ambient-canvas" />

      {/* ── Concentric Radar Rings (Puzzle Inspiration) ── */}
      <div className="puzzle-concentric-rings">
        <div className="puzzle-radar-circle" style={{ width: 440, height: 440 }} />
        <div className="puzzle-radar-circle" style={{ width: 680, height: 680 }} />
        <div className="puzzle-radar-circle" style={{ width: 940, height: 940 }} />
      </div>

      {/* ── Top Header Navigation (Puzzle Reference) ── */}
      <header style={{
        position: 'relative',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 36px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(11, 10, 22, 0.85)',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <WardlyLogo size={28} />
          <span style={{
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '-0.02em',
            color: '#FFFFFF'
          }}>
            wardly
          </span>
        </div>

        {/* Center Minimal Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          fontSize: '0.78rem',
          color: '#CBD5E1',
          fontWeight: 500
        }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Platform ▾</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Telemetry ▾</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Fairness ▾</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Open Data</span>
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onSwitchToLegacy}
            title="Switch to classic hero"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Sparkles size={12} style={{ color: '#A855F7' }} />
            <span>Classic</span>
          </button>

          <button
            onClick={() => { setMode('login'); setShowAuthModal(true); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#F8FAFC',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Log in
          </button>

          <button
            className="puzzle-mint-btn"
            onClick={() => { setMode('login'); setShowAuthModal(true); }}
            style={{ padding: '7px 18px', fontSize: '0.76rem' }}
          >
            Get started for free
          </button>
        </div>
      </header>

      {/* ── Main Hero Section (Compact & Fully Above the Fold) ── */}
      <main style={{
        position: 'relative',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 20px 20px 20px',
        maxWidth: 1220,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Main Headline (Exact Puzzle cadence) */}
        <h1 style={{
          fontSize: 'clamp(1.9rem, 3.4vw, 2.9rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          textAlign: 'center',
          color: '#FFFFFF',
          margin: '0 0 10px 0',
          maxWidth: 820
        }}>
          Don't let fragmented municipal tools<br />
          slow your city down
        </h1>

        <p style={{
          fontSize: 'clamp(0.82rem, 1.1vw, 0.92rem)',
          color: '#94A3B8',
          lineHeight: 1.5,
          textAlign: 'center',
          maxWidth: 620,
          margin: '0 0 14px 0'
        }}>
          The modern civic intelligence platform for the AI era.<br />
          Get real-time spatial telemetry, automated dispatch, and demographic fairness every day.<br />
          <span style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>Directly integrated with NDSAP &amp; CPCB CAAQMS.</span>
        </p>

        {/* Mint CTA Button */}
        <button
          className="puzzle-mint-btn"
          onClick={() => { setMode('login'); setShowAuthModal(true); }}
          style={{ marginBottom: 14 }}
        >
          <span>Get started for free</span>
        </button>

        {/* Domain Filter Pills Track (Matching Puzzle horizontal pills) */}
        <div className="puzzle-pill-track">
          {profiles.map((p, idx) => (
            <div
              key={p.id}
              className={`puzzle-filter-pill ${idx === profileIndex ? 'active' : ''}`}
            >
              {p.label}
            </div>
          ))}
          <div className="puzzle-filter-pill">Automated Dispatch</div>
          <div className="puzzle-filter-pill">NDSAP Open Sync</div>
        </div>

        <p style={{
          fontSize: '0.72rem',
          color: '#64748B',
          textAlign: 'center',
          margin: '0 0 14px 0'
        }}>
          Be audit-ready with real-time incident flow, dispatch latency, sensor health, and demographic parity.
        </p>

        {/* ── The Embedded Dashboard Console (Matching Puzzle Image) ── */}
        <div className="puzzle-dashboard-canvas">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '190px 1fr',
            minHeight: 380
          }}>
            {/* ── Left Sidebar inside Cockpit ── */}
            <div style={{
              background: 'rgba(15, 13, 30, 0.95)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <WardlyLogo size={22} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>wardly</span>
                </div>

                <div style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>
                  CIVIC INTELLIGENCE
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'rgba(168, 85, 247, 0.16)',
                    color: '#FAF4F0',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}>
                    <LayoutDashboard size={13} style={{ color: '#C084FC' }} />
                    <span>Dashboard</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: '#94A3B8', fontSize: '0.72rem' }}>
                    <AlertTriangle size={13} />
                    <span>Incidents</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: '#94A3B8', fontSize: '0.72rem' }}>
                    <Wind size={13} />
                    <span>Air Quality</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: '#94A3B8', fontSize: '0.72rem' }}>
                    <Droplet size={13} />
                    <span>AMRUT Water</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: '#94A3B8', fontSize: '0.72rem' }}>
                    <Scale size={13} />
                    <span>Equity Audit</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: '#94A3B8', fontSize: '0.72rem' }}>
                    <MapPin size={13} />
                    <span>Wards Grid</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', color: '#64748B', fontSize: '0.68rem' }}>
                  <Settings size={12} />
                  <span>Settings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', color: '#64748B', fontSize: '0.68rem' }}>
                  <HelpCircle size={12} />
                  <span>Support</span>
                </div>
              </div>
            </div>

            {/* ── Main Canvas inside Cockpit ── */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Top Row: 3 Metric Cards with Volumetric Violet Visuals */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                paddingBottom: 14,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{currentProfile.metricA.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '2px 0' }}>{currentProfile.metricA.val}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.62rem', color: '#10B981', fontWeight: 600 }}>{currentProfile.metricA.sub}</span>
                    <svg width="80" height="20" viewBox="0 0 160 40">
                      <path d={currentProfile.sparkline} fill="none" stroke="#A855F7" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{currentProfile.metricB.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '2px 0' }}>{currentProfile.metricB.val}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.62rem', color: '#38BDF8', fontWeight: 600 }}>{currentProfile.metricB.sub}</span>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'end', height: 16 }}>
                      <span style={{ width: 4, height: 8, background: '#A855F7', borderRadius: 1 }} />
                      <span style={{ width: 4, height: 14, background: '#C084FC', borderRadius: 1 }} />
                      <span style={{ width: 4, height: 10, background: '#E879F9', borderRadius: 1 }} />
                      <span style={{ width: 4, height: 16, background: '#D946EF', borderRadius: 1 }} />
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{currentProfile.metricC.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '2px 0' }}>{currentProfile.metricC.val}</div>
                  <div style={{ fontSize: '0.62rem', color: '#6EE7B7' }}>{currentProfile.metricC.sub}</div>
                </div>
              </div>

              {/* Middle Row: Active Counters & Volumetric Magenta Bars (Puzzle Inspiration) */}
              <div style={{ margin: '10px 0 8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
                      Active: <strong style={{ color: '#FFFFFF' }}>{currentProfile.activeSpend}</strong>
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
                      Processed: <strong style={{ color: '#FFFFFF' }}>{currentProfile.activeRevenue}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#A855F7', fontFamily: 'var(--font-mono)' }}>
                    Auto-Stream: {currentProfile.label}
                  </span>
                </div>

                {/* 12 Volumetric Violet / Magenta Bars */}
                <div
                  ref={barContainerRef}
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: 8,
                    alignItems: 'end',
                    height: 110,
                    padding: '8px 10px 0 10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 10,
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    overflow: 'hidden'
                  }}
                >
                  {currentProfile.bars.map((bar, i) => (
                    <div
                      key={`${currentProfile.id}-${i}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                        gap: 3,
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      <div
                        className="puzzle-volumetric-bar puzzle-bar-fill"
                        style={{
                          width: '100%',
                          maxWidth: 32,
                          height: `${bar.val * 0.85}px`,
                          background: bar.color
                        }}
                      >
                        <div className="puzzle-volumetric-glow-cap" style={{ color: '#E879F9' }} />
                      </div>
                      <span style={{ fontSize: '0.58rem', color: '#64748B', fontWeight: 600, paddingBottom: 2 }}>
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Task & Activity Table Snippet */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.18)',
                borderRadius: 8,
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.68rem', color: '#94A3B8' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 700, borderBottom: '1px solid #A855F7', paddingBottom: 2 }}>Task &amp; Activity</span>
                    <span>All Wards</span>
                    <span>Dispatched</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: '0.62rem', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>Filter ▾</span>
                    <span style={{ fontSize: '0.62rem', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>Export</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', padding: '2px 0' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className="live-dot" style={{ width: 5, height: 5, background: '#EF4444' }} />
                      <span>Ward 07 &bull; Main Drain Choke Dispatch</span>
                    </span>
                    <span style={{ color: '#A855F7' }}>Crew #04 &bull; ETA 12m</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', padding: '2px 0' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className="live-dot" style={{ width: 5, height: 5, background: '#10B981' }} />
                      <span>Ward 12 &bull; 100% Solid Waste Segregated</span>
                    </span>
                    <span style={{ color: '#10B981' }}>Verified Nominal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Buttery-Smooth Dual-Panel Sliding Authentication Modal ── */}
      {showAuthModal && (
        <div className="smooth-auth-overlay" onClick={() => setShowAuthModal(false)}>
          <div
            className="smooth-auth-modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxHeight: mode === 'register' ? 620 : 440
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FAF4F0' }}>
                  {mode === 'login' ? 'Sign In to Wardly' : 'Create Verified Account'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#94A3B8' }}>
                  {mode === 'login'
                    ? 'Access live municipal command dashboards & civic AI tools'
                    : 'Register municipal officer or citizen account in SQLite OLTP'}
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setShowAuthModal(false)}
                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
              >
                ✕
              </button>
            </div>

            {/* Smooth Sliding Pill Toggle Switcher */}
            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 999,
                padding: 4,
                marginBottom: 16,
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              {/* Sliding Indicator with Spring Ease */}
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  bottom: 4,
                  left: mode === 'login' ? 4 : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)',
                  background: '#A855F7',
                  borderRadius: 999,
                  boxShadow: '0 2px 12px rgba(168, 85, 247, 0.45)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: 'transparent',
                  border: 'none',
                  color: mode === 'login' ? '#FFFFFF' : '#94A3B8',
                  padding: '7px 0',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'color 0.25s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: 'transparent',
                  border: 'none',
                  color: mode === 'register' ? '#FFFFFF' : '#94A3B8',
                  padding: '7px 0',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'color 0.25s ease'
                }}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: '0.74rem',
                marginBottom: 14
              }}>
                {error}
              </div>
            )}

            {/* Sliding Viewport for Dual-Panel Transition */}
            <div className="auth-slider-viewport">
              <div
                className="auth-slider-track"
                style={{
                  transform: mode === 'login' ? 'translateX(0%)' : 'translateX(-50%)'
                }}
              >
                {/* ── Panel 1: Login ── */}
                <div className="auth-slider-panel">
                  <form onSubmit={handleAuthSubmit}>
                    <div className="auth-input-group" style={{ marginBottom: 12 }}>
                      <label className="auth-input-label">Email Address</label>
                      <input
                        className="auth-input"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@wardly.gov"
                        required={mode === 'login'}
                      />
                    </div>

                    <div className="auth-input-group" style={{ marginBottom: 16 }}>
                      <label className="auth-input-label">Password</label>
                      <input
                        className="auth-input"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required={mode === 'login'}
                      />
                    </div>

                    {/* Quick 1-Click Demo Credentials Pill Row inside Modal */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 16,
                      fontSize: '0.7rem'
                    }}>
                      <span style={{ color: '#64748B' }}>Quick Fill:</span>
                      <button
                        type="button"
                        onClick={() => { setEmail('citizen@wardly.gov'); setPassword('demo123'); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#38BDF8',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.68rem',
                          cursor: 'pointer'
                        }}
                      >
                        Citizen
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('officer@wardly.gov'); setPassword('demo123'); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F59E0B',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.68rem',
                          cursor: 'pointer'
                        }}
                      >
                        Officer
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('admin@wardly.gov'); setPassword('demo123'); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#10B981',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.68rem',
                          cursor: 'pointer'
                        }}
                      >
                        Admin
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="puzzle-mint-btn"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        borderRadius: 10
                      }}
                    >
                      <span>{loading ? 'Authenticating...' : 'Enter Command Console'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </form>
                </div>

                {/* ── Panel 2: Register ── */}
                <div className="auth-slider-panel">
                  <form onSubmit={handleAuthSubmit}>
                    <div className="auth-input-group" style={{ marginBottom: 10 }}>
                      <label className="auth-input-label">Full Name</label>
                      <input
                        className="auth-input"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        required={mode === 'register'}
                      />
                    </div>

                    <div className="form-grid-2" style={{ marginBottom: 10 }}>
                      <div className="auth-input-group">
                        <label className="auth-input-label">System Role</label>
                        <select
                          className="auth-select"
                          value={role}
                          onChange={e => setRole(e.target.value)}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="officer">Municipal Officer</option>
                          <option value="ward_officer">Ward Officer</option>
                          <option value="admin">System Admin</option>
                        </select>
                      </div>

                      <div className="auth-input-group">
                        <label className="auth-input-label">Assigned Ward</label>
                        <select
                          className="auth-select"
                          value={wardId}
                          onChange={e => setWardId(e.target.value)}
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(w => (
                            <option key={w} value={w}>Ward {w}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="auth-input-group" style={{ marginBottom: 10 }}>
                      <label className="auth-input-label">Email Address</label>
                      <input
                        className="auth-input"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@wardly.gov"
                        required={mode === 'register'}
                      />
                    </div>

                    <div className="auth-input-group" style={{ marginBottom: 14 }}>
                      <label className="auth-input-label">Password</label>
                      <input
                        className="auth-input"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required={mode === 'register'}
                      />
                    </div>

                    <button
                      type="submit"
                      className="puzzle-mint-btn"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        borderRadius: 10
                      }}
                    >
                      <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Single Minimal Developer Entry Point (Downside of Left Side) ── */}
      {onOpenAbout && (
        <div style={{ position: 'fixed', bottom: 24, left: 28, zIndex: 90 }}>
          <button
            type="button"
            onClick={onOpenAbout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(16, 14, 29, 0.88)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#D8B4FE',
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45), 0 0 14px rgba(168, 85, 247, 0.2)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.7)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(168, 85, 247, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.45), 0 0 14px rgba(168, 85, 247, 0.2)';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
            title="Developer Profile, Neural Architecture & Project Story"
          >
            <Sparkles size={13} style={{ color: '#C084FC' }} />
            <span>Developer &amp; Reviews</span>
          </button>
        </div>
      )}
    </div>
  );
}
