import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  MapPin,
  BarChart2,
  FileText,
  Crosshair,
  Shield,
  Cpu,
  Lightbulb,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';
import { animate } from 'animejs';

// Comprehensive Page-Specific Insight Configurations
const PAGE_CONFIGS = {
  dashboard: {
    title: 'PULSE TRIVIA',
    color: '#06B6D4', // Electric Cyan
    glow: 'rgba(6, 182, 212, 0.5)',
    icon: Activity,
    facts: [
      'Ward 4 holds the fastest 24-hr resolution rate.',
      'Sanitation & road hazards make up 62% of complaints.',
      'Yash used Anime.js spring physics for zero-jank 60 FPS transitions.',
      'Live municipal telemetry refreshes every 300 seconds.'
    ]
  },
  wards: {
    title: 'GEO TELEMETRY',
    color: '#10B981', // Emerald Green
    glow: 'rgba(16, 185, 129, 0.5)',
    icon: MapPin,
    facts: [
      'Heatmaps highlight wards above 75% neglect threshold.',
      'Boundary markers filter localized ward officers.',
      'Grievance density correlates with infrastructure age.',
      'GIS coordinates pinpoint high-density failure clusters.'
    ]
  },
  analytics: {
    title: 'CHART METRIC',
    color: '#8B5CF6', // Purple/Violet
    glow: 'rgba(139, 92, 246, 0.5)',
    icon: BarChart2,
    facts: [
      'Pareto chart isolates top 20% systemic root causes driving 80% issues.',
      'Time-to-resolve correlates inversely with ward budget allocation.',
      'AutoML detects seasonal water-logging before monsoon surges.',
      'Yash fused DuckDB OLAP to execute sub-12ms analytical aggregations.'
    ]
  },
  complaints: {
    title: 'OPS TELEMETRY',
    color: '#F97316', // Orange
    glow: 'rgba(249, 115, 22, 0.5)',
    icon: FileText,
    facts: [
      'SLA countdown timers warn officers 6 hours before breach.',
      'AI classifier auto-tags urgency and jurisdiction on submission.',
      'Geo-tagged photo uploads accelerate on-site verification.',
      'Repeated tickets trigger automatic escalation.'
    ]
  },
  track: {
    title: 'TRACKER AUDIT',
    color: '#38BDF8', // Sky Blue
    glow: 'rgba(56, 189, 248, 0.5)',
    icon: Crosshair,
    facts: [
      'Enter any 8-digit token for step-by-step audit history.',
      'Resolved tickets require citizen verification signature.',
      'Live timeline stamps log officer reassignments.'
    ]
  },
  users: {
    title: 'ROLE AUDIT',
    color: '#F43F5E', // Rose
    glow: 'rgba(244, 63, 94, 0.5)',
    icon: Shield,
    facts: [
      'Officer roles restrict reassignment to assigned wards.',
      'Admin audit trails record every status override.',
      'Department permissions enforce jurisdictional isolation.'
    ]
  },
  ai_audit: {
    title: 'NEURAL STAT',
    color: '#EAB308', // Amber
    glow: 'rgba(234, 179, 8, 0.5)',
    icon: Cpu,
    facts: [
      'Dual ensemble models cross-check classification confidence.',
      'Yash optimized NLP triage pipeline for sub-45ms inference latency.',
      'Token attribution highlights priority urgency triggers.'
    ]
  },
  ogd_portal: {
    title: 'DID YOU KNOW?',
    color: '#FFB703', // Warm Gold
    glow: 'rgba(255, 183, 3, 0.5)',
    icon: Lightbulb,
    facts: [
      'National portal syncs public records hourly.',
      'Zero-knowledge encryption protects ward telemetry.',
      'Live OGD connectors ingest municipal sensor feeds.'
    ]
  },
  hero: {
    title: 'ABOUT WARDLY',
    color: '#A855F7', // Magenta Purple
    glow: 'rgba(168, 85, 247, 0.55)',
    icon: MessageSquare,
    isActionModal: true,
    facts: [
      'Wardly is an enterprise civic intelligence platform solving municipal grievance neglect.',
      'Dual AI triage automatically tags jurisdiction, category, and SLA urgency upon submission.',
      'Spatial neglect heatmaps expose high-density grievance backlogs across 26 wards in real time.',
      'Yash Maurya engineered Wardly using FastAPI, React, SQLite WAL & DuckDB OLAP.'
    ]
  }
};

export default function FloatingInsightWidget({
  page = 'dashboard',
  auth = null,
  onOpenAbout = () => {},
  onOpenReviews = () => {}
}) {
  const config = PAGE_CONFIGS[page] || PAGE_CONFIGS.dashboard;
  const facts = config.facts;
  const IconComponent = config.icon;

  const [bulbLit, setBulbLit] = useState(false);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const widgetRef = useRef(null);
  const viewportRef = useRef(null);
  const textTrackRef = useRef(null);
  const slideAnimRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const currentDragYRef = useRef(0);

  // Reset index and state smoothly on page switch
  useEffect(() => {
    setFactIndex(0);
    setBulbLit(false);
    setCapsuleOpen(false);
  }, [page]);

  // Lifecycle with smooth sliding reveal and 10s reading window:
  useEffect(() => {
    let active = true;
    let cycleTimer = null;

    const schedule = (fn, delay) => {
      cycleTimer = setTimeout(() => {
        if (active) fn();
      }, delay);
    };

    const runCycle = (waitBeforeGlow) => {
      schedule(() => {
        setBulbLit(true);

        // 350ms after glowing starts, expand capsule with bouncy ease
        schedule(() => {
          setCapsuleOpen(true);
          if (widgetRef.current) {
            animate(widgetRef.current, {
              scaleX: [0.94, 1.04, 0.98, 1],
              scaleY: [1.06, 0.96, 1.02, 1],
              duration: 550,
              ease: 'outElastic(1.2, 0.55)'
            });
          }

          // Compute text overflow and perform sliding reveal
          let slideDuration = 0;
          schedule(() => {
            if (viewportRef.current && textTrackRef.current) {
              const overflow = textTrackRef.current.scrollWidth - viewportRef.current.clientWidth;
              if (overflow > 6) {
                // Wait 1.8s at start so user begins reading, then smoothly slide across
                slideDuration = Math.max(3000, Math.min(8000, (overflow / 32) * 1000));
                slideAnimRef.current = setTimeout(() => {
                  if (active && textTrackRef.current) {
                    animate(textTrackRef.current, {
                      translateX: [0, -(overflow + 14)],
                      duration: slideDuration,
                      ease: 'easeInOutQuad'
                    });
                  }
                }, 1800);
              }
            }

            // Total reading duration: Slide time + 10 FULL seconds of reading time!
            const totalDisplayTime = 1800 + slideDuration + 10000;

            schedule(() => {
              // Collapse capsule
              setCapsuleOpen(false);
              if (textTrackRef.current) {
                textTrackRef.current.style.transform = 'translateX(0px)';
              }

              // 350ms after collapsing, dim brightness down
              schedule(() => {
                setBulbLit(false);
                setFactIndex(prev => (prev + 1) % facts.length);

                // Rest unlit for 10 seconds before next cycle
                runCycle(10000);
              }, 350);
            }, totalDisplayTime);
          }, 350);
        }, 350);
      }, waitBeforeGlow);
    };

    // First cycle on page load: 5 seconds before glowing
    runCycle(5000);

    return () => {
      active = false;
      if (cycleTimer) clearTimeout(cycleTimer);
      if (slideAnimRef.current) clearTimeout(slideAnimRef.current);
    };
  }, [page, facts.length]);

  // Click Action Handler
  const handleWidgetClick = () => {
    if (config.isActionModal) {
      onOpenAbout();
      return;
    }
    if (!capsuleOpen) {
      setBulbLit(true);
      setCapsuleOpen(true);
    } else {
      if (textTrackRef.current) {
        textTrackRef.current.style.transform = 'translateX(0px)';
      }
      setFactIndex(prev => (prev + 1) % facts.length);
    }
  };

  // Interactive Bubbly Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;

    const onMouseMove = (moveEvt) => {
      if (!isDraggingRef.current) return;
      const rawDelta = moveEvt.clientY - dragStartYRef.current;
      const clampedDelta = Math.max(-75, Math.min(25, rawDelta * 0.35));
      currentDragYRef.current = clampedDelta;
      setDragOffsetY(clampedDelta);
    };

    const onMouseUp = (upEvt) => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const totalMove = Math.abs(upEvt.clientY - dragStartYRef.current);
      if (totalMove < 5) {
        handleWidgetClick();
      }

      if (widgetRef.current) {
        animate(widgetRef.current, {
          translateY: [currentDragYRef.current, 0],
          scaleX: [1.06, 0.96, 1.02, 1],
          scaleY: [0.94, 1.04, 0.98, 1],
          duration: 650,
          ease: 'outElastic(1.3, 0.45)',
          complete: () => {
            currentDragYRef.current = 0;
            setDragOffsetY(0);
          }
        });
      } else {
        setDragOffsetY(0);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragStartYRef.current = touch.clientY;

    const onTouchMove = (moveEvt) => {
      const currentTouch = moveEvt.touches[0];
      const rawDelta = currentTouch.clientY - dragStartYRef.current;
      const clampedDelta = Math.max(-75, Math.min(25, rawDelta * 0.35));
      currentDragYRef.current = clampedDelta;
      setDragOffsetY(clampedDelta);
    };

    const onTouchEnd = (endEvt) => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      const changedTouch = endEvt.changedTouches[0];
      const totalMove = Math.abs(changedTouch.clientY - dragStartYRef.current);
      if (totalMove < 5) {
        handleWidgetClick();
      }

      if (widgetRef.current) {
        animate(widgetRef.current, {
          translateY: [currentDragYRef.current, 0],
          duration: 600,
          ease: 'outElastic(1.3, 0.45)',
          complete: () => {
            currentDragYRef.current = 0;
            setDragOffsetY(0);
          }
        });
      } else {
        setDragOffsetY(0);
      }
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={widgetRef}
      className={`floating-bulb-widget ${bulbLit ? 'glowing' : 'unlit'} ${capsuleOpen ? 'expanded' : 'collapsed'}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        '--widget-color': config.color,
        '--widget-glow': config.glow,
        transform: `translateY(${dragOffsetY}px)`
      }}
      title={
        config.isActionModal
          ? "Click to open Developer Story & AMA Chat"
          : (capsuleOpen ? "Click to jump to next insight • Drag slightly up/down" : "Click to view page insight • Drag slightly up/down")
      }
    >
      {/* Icon Badge */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: bulbLit ? `${config.color}22` : 'rgba(255, 255, 255, 0.04)',
          border: bulbLit ? `1px solid ${config.color}88` : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: bulbLit ? `0 0 12px ${config.glow}` : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
      >
        <IconComponent
          size={16}
          className="bulb-icon-glow"
          style={{
            color: bulbLit ? config.color : 'rgba(255, 255, 255, 0.7)'
          }}
        />
      </div>

      {/* Expanded Capsule Text with Auto-Sliding Marquee Viewport */}
      {capsuleOpen && (
        <div className="bulb-capsule-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: config.color,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                flexShrink: 0
              }}
            >
              {config.title}
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.68rem' }}>&bull;</span>

            {/* Viewport container with sliding track */}
            <div
              ref={viewportRef}
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              <div
                ref={textTrackRef}
                style={{
                  display: 'inline-block',
                  fontSize: '0.74rem',
                  color: '#F8FAFC',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  willChange: 'transform'
                }}
              >
                {facts[factIndex % facts.length]}
              </div>
            </div>
          </div>

          {/* Quick AMA / Developer trigger only if on Hero page */}
          {config.isActionModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAbout();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${config.color}44`,
                color: config.color,
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: '0.62rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
                marginLeft: 4
              }}
              title="Open Developer AMA &amp; Reviews"
            >
              <Sparkles size={10} />
              <span>Ask AMA</span>
            </button>
          )}

          {/* Quick Collapse Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCapsuleOpen(false);
              setTimeout(() => setBulbLit(false), 250);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94A3B8',
              width: 18,
              height: 18,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.66rem',
              marginLeft: 4,
              flexShrink: 0
            }}
            title="Collapse"
          >
            <X size={11} />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
