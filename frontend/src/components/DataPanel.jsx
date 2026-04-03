import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════
   HELPER FUNCTIONS
   ══════════════════════════════════════════════ */

function getDelayLevel(delay) {
  if (delay <= 10) return { label: 'Low', cls: 'low' };
  if (delay <= 20) return { label: 'Medium', cls: 'medium' };
  return { label: 'High', cls: 'high' };
}

function getBarWidth(value, max) {
  return Math.min((value / max) * 100, 100) + '%';
}

/* ══════════════════════════════════════════════
   STEP INDICATOR LIST
   ══════════════════════════════════════════════ */
function StepIndicatorList({ steps, currentStep }) {
  return (
    <div className="glass-card" style={{ padding: 16 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
      }}>
        ⚙️ System Processing
      </p>
      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isPending = step.id > currentStep;
        const dotClass = isActive ? 'active' : isCompleted ? 'completed' : 'pending';
        const indicatorClass = isActive ? 'active' : isCompleted ? 'completed' : '';

        return (
          <div key={step.id} className={`step-indicator ${indicatorClass}`}>
            <div className={`step-dot ${dotClass}`} />
            <span style={{
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent-green)'
                : isCompleted ? 'var(--text-secondary)'
                : 'var(--text-muted)',
              transition: 'color 0.3s ease',
            }}>
              {isCompleted && '✓ '}{step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   METRIC BOX (for Best Route section)
   ══════════════════════════════════════════════ */
function MetricBox({ label, value, unit, accent, icon }) {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '12px 14px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6,
      }}>
        {icon} {label}
      </p>
      <p style={{
        fontSize: 20, fontWeight: 800, color: accent || 'var(--text-primary)',
        lineHeight: 1,
      }}>
        {value}
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>
          {unit}
        </span>
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROUTE CARD (individual route)
   ══════════════════════════════════════════════ */
function RouteCard({ route, isBest, index, maxCarbon, maxDistance, visible }) {
  const delayInfo = getDelayLevel(route.delay);

  return (
    <div
      className={`route-card ${isBest ? 'best-route-card' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.4s ease ${0.08 * index}s, transform 0.4s ease ${0.08 * index}s`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isBest && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              padding: '3px 8px', borderRadius: 12,
              background: 'rgba(0,209,178,0.15)', color: 'var(--accent-green)',
              textTransform: 'uppercase',
            }}>
              ✦ Best
            </span>
          )}
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: isBest ? 'var(--accent-green)' : 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            {route.path.join(' → ')}
          </span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: isBest ? 'rgba(0,209,178,0.12)' : 'rgba(30,58,138,0.15)',
          color: isBest ? 'var(--accent-green)' : 'var(--accent-blue-light)',
        }}>
          {route.score}
        </span>
      </div>

      {/* Data rows with visual bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Distance */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>📍 Distance</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{route.distance} km</span>
          </div>
          <div className="data-bar-track">
            <div className="data-bar-fill" style={{
              '--bar-width': getBarWidth(route.distance, maxDistance),
              background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            }} />
          </div>
        </div>

        {/* Carbon */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>🌿 Carbon</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>{route.carbon} kg CO₂</span>
          </div>
          <div className="data-bar-track">
            <div className="data-bar-fill" style={{
              '--bar-width': getBarWidth(route.carbon, maxCarbon),
              background: 'linear-gradient(90deg, #00D1B2, #00E5C7)',
            }} />
          </div>
        </div>

        {/* Delay with AI label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            🤖 Predicted Delay (AI)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {route.delay} min
            </span>
            <span className={`delay-badge ${delayInfo.cls}`}>{delayInfo.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN DATA PANEL
   ══════════════════════════════════════════════ */
export default function DataPanel({ data, loading, currentStep, steps, error, onOptimize, onDismissError }) {
  const routes = data?.routes || [];
  const bestRoute = data?.bestRoute || null;
  const metrics = data?.metrics || null;
  const [visible, setVisible] = useState(false);

  // Compute max values for bars
  const maxDistance = routes.length ? Math.max(...routes.map(r => r.distance)) : 1;
  const maxCarbon = routes.length ? Math.max(...routes.map(r => r.carbon)) : 1;

  useEffect(() => {
    if (data) {
      setVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      {/* Section Label */}
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
      }}>
        📊 Analytics Panel
      </p>

      {/* ── OPTIMIZE BUTTON ── */}
      <button
        id="optimize-btn"
        onClick={onOptimize}
        disabled={loading}
        className="btn-optimize"
        style={{
          width: '100%', padding: '14px 24px', borderRadius: 14,
          fontWeight: 700, fontSize: 14, letterSpacing: '0.02em',
          cursor: loading ? 'not-allowed' : 'pointer', color: 'white',
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg className="animate-spin-smooth" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Optimizing…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            ⚡ Optimize Route
          </span>
        )}
      </button>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div style={{
          borderRadius: 14, padding: 16,
          display: 'flex', alignItems: 'start', gap: 12,
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#EF4444" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>Optimization Failed</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{error}</p>
          </div>
          <button onClick={onDismissError} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── STEP INDICATORS (during loading) ── */}
      {loading && currentStep > 0 && (
        <StepIndicatorList steps={steps} currentStep={currentStep} />
      )}

      {/* ── BEST ROUTE CARD ── */}
      {bestRoute && metrics && (
        <div
          className="best-route-card"
          style={{
            padding: 20,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20,
              background: 'rgba(0,209,178,0.15)', color: 'var(--accent-green)',
            }}>
              🏆 Best Route
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>
              Score: {metrics.score}
            </span>
          </div>

          <p style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em',
            color: 'var(--text-primary)', marginBottom: 16,
          }}>
            {bestRoute.join(' → ')}
          </p>

          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <MetricBox label="Distance" value={metrics.distance} unit="km" icon="📍" />
            <MetricBox label="Carbon" value={metrics.carbon} unit="kg" accent="var(--accent-green)" icon="🌿" />
            <MetricBox label="Delay" value={metrics.delay} unit="min" icon="🤖" />
          </div>

          {/* AI Explanation */}
          <div style={{
            marginTop: 14, paddingTop: 14,
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'start', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>🧠</span>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--text-muted)' }}>
              Selected based on lowest combined score:{' '}
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-secondary)' }}>
                (0.4 × carbon + 0.3 × distance + 0.3 × delay)
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── ALL ROUTES LIST ── */}
      {routes.length > 0 && (
        <div style={{
          flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.15s',
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
          }}>
            All Routes ({routes.length})
          </p>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
            {[...routes]
              .sort((a, b) => a.score - b.score)
              .map((route, i) => {
                const isBest = bestRoute && route.path.join(',') === bestRoute.join(',');
                return (
                  <RouteCard
                    key={i}
                    route={route}
                    isBest={isBest}
                    index={i}
                    maxCarbon={maxCarbon}
                    maxDistance={maxDistance}
                    visible={visible}
                  />
                );
              })}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!data && !loading && (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 16px', borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(30,58,138,0.15), rgba(0,209,178,0.08))',
              border: '1px solid var(--border)',
              fontSize: 28,
            }}>
              🗺️
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              No routes analyzed
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 240, margin: '0 auto' }}>
              Click <strong style={{ color: 'var(--text-primary)' }}>⚡ Optimize Route</strong> to find the best carbon-aware path
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
