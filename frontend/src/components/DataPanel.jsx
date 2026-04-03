import { useEffect, useState } from 'react';

/* ── Helpers ── */
function getDelayLevel(d) {
  if (d <= 10) return { label: 'Low', cls: 'low' };
  if (d <= 20) return { label: 'Medium', cls: 'medium' };
  return { label: 'High', cls: 'high' };
}
function barWidth(val, max) { return Math.min((val / max) * 100, 100) + '%'; }

/* ── Metric Box ── */
function MetricBox({ label, value, unit, accent, icon }) {
  return (
    <div style={{
      background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '14px 10px', textAlign: 'center',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>
        {icon} {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color: accent || '#1E293B', lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 3 }}>{unit}</span>
      </p>
    </div>
  );
}

/* ── Route Card ── */
function RouteCard({ route, isBest, index, maxCarbon, maxDist, visible }) {
  const dl = getDelayLevel(route.delay);
  return (
    <div
      className={isBest ? 'route-card best-route-card' : 'route-card'}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: `opacity 0.4s ease ${0.07 * index}s, transform 0.4s ease ${0.07 * index}s`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isBest && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '3px 8px',
              borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#059669', textTransform: 'uppercase',
            }}>✦ Best</span>
          )}
          <span style={{
            fontSize: 15, fontWeight: 700, color: isBest ? '#059669' : '#1E293B', letterSpacing: '-0.01em',
          }}>
            {route.path.join(' → ')}
          </span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
          background: isBest ? 'rgba(16,185,129,0.1)' : '#F1F5F9',
          color: isBest ? '#059669' : '#2563EB',
        }}>
          {route.score}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Distance */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>📍 Distance</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{route.distance} km</span>
          </div>
          <div className="data-bar-track">
            <div className="data-bar-fill" style={{
              '--bar-width': barWidth(route.distance, maxDist),
              background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            }} />
          </div>
        </div>

        {/* Carbon */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>🌿 Carbon Emission</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{route.carbon} kg CO₂</span>
          </div>
          <div className="data-bar-track">
            <div className="data-bar-fill" style={{
              '--bar-width': barWidth(route.carbon, maxCarbon),
              background: 'linear-gradient(90deg, #10B981, #34D399)',
            }} />
          </div>
        </div>

        {/* Delay */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>🤖 Predicted Delay (AI)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{route.delay} min</span>
            <span className={`delay-badge ${dl.cls}`}>{dl.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PANEL
   ══════════════════════════════════════════════ */
export default function DataPanel({ data, loading, error, onOptimize, onDismissError }) {
  const routes = data?.routes || [];
  const bestRoute = data?.bestRoute || null;
  const metrics = data?.metrics || null;
  const [visible, setVisible] = useState(false);

  const maxDist = routes.length ? Math.max(...routes.map(r => r.distance)) : 1;
  const maxCarbon = routes.length ? Math.max(...routes.map(r => r.carbon)) : 1;

  useEffect(() => {
    if (data) {
      setVisible(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      <p className="section-label">📊 Analytics Panel</p>

      {/* ── Button ── */}
      <button
        id="optimize-btn" onClick={onOptimize} disabled={loading}
        className="btn-optimize"
        style={{
          width: '100%', padding: '14px 24px', borderRadius: 14,
          fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', color: 'white',
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg className="animate-spin-smooth" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Optimizing…
          </span>
        ) : (
          <span>⚡ Optimize Route</span>
        )}
      </button>

      {/* ── Error ── */}
      {error && (
        <div style={{
          borderRadius: 14, padding: 14, display: 'flex', alignItems: 'start', gap: 10,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>Optimization Failed</p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{error}</p>
          </div>
          <button onClick={onDismissError} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* ── Best Route Card ── */}
      {bestRoute && metrics && (
        <div className="best-route-card" style={{
          padding: 22,
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#059669',
            }}>
              🏆 Best Route
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>Score: {metrics.score}</span>
          </div>

          <p style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 16, letterSpacing: '-0.02em' }}>
            {bestRoute.join(' → ')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <MetricBox label="Distance" value={metrics.distance} unit="km" icon="📍" />
            <MetricBox label="Carbon" value={metrics.carbon} unit="kg" accent="#059669" icon="🌿" />
            <MetricBox label="Delay" value={metrics.delay} unit="min" icon="🤖" />
          </div>

          <div style={{
            marginTop: 14, paddingTop: 14, borderTop: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'start', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>🧠</span>
            <p style={{ fontSize: 11, lineHeight: 1.7, color: '#64748B' }}>
              Selected based on lowest combined score:{' '}
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#475569', fontWeight: 600 }}>
                (0.4 × carbon + 0.3 × distance + 0.3 × delay)
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      {routes.length > 0 && <div style={{ height: 1, background: '#F1F5F9' }} />}

      {/* ── All Routes ── */}
      {routes.length > 0 && (
        <div style={{
          flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.15s',
        }}>
          <p className="section-label">All Routes ({routes.length})</p>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
            {[...routes].sort((a, b) => a.score - b.score).map((route, i) => {
              const isBest = bestRoute && route.path.join(',') === bestRoute.join(',');
              return (
                <RouteCard key={i} route={route} isBest={isBest} index={i}
                  maxCarbon={maxCarbon} maxDist={maxDist} visible={visible} />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!data && !loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 16px', borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F1F5F9', border: '1px solid #E5E7EB',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)', fontSize: 28,
            }}>🗺️</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 6 }}>No routes analyzed</p>
            <p style={{ fontSize: 12, color: '#94A3B8', maxWidth: 220, margin: '0 auto' }}>
              Click <strong style={{ color: '#1E293B' }}>⚡ Optimize Route</strong> to find the best carbon-aware path
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
