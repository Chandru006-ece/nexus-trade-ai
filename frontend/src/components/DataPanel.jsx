import { useEffect, useState } from 'react';

function getDelayLevel(d) {
  if (d <= 10) return { label: 'Low', cls: 'low' };
  if (d <= 20) return { label: 'Medium', cls: 'medium' };
  return { label: 'High', cls: 'high' };
}
function barW(v, m) { return Math.min((v / m) * 100, 100) + '%'; }

function MetricBox({ label, value, unit, accent, icon }) {
  return (
    <div style={{
      background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '12px 10px', textAlign: 'center', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
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

function RouteCard({ route, isBest, index, maxC, maxD, visible }) {
  const dl = getDelayLevel(route.delay);
  return (
    <div className={isBest ? 'route-card best-route-card' : 'route-card'} style={{
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity 0.4s ease ${0.07 * index}s, transform 0.4s ease ${0.07 * index}s`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isBest && <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '4px 10px',
            borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#059669', textTransform: 'uppercase',
          }}>✦ Optimal Selection</span>}
          <span style={{ fontSize: 15, fontWeight: 700, color: isBest ? '#059669' : '#1E293B' }}>
            {route.path.join(' → ')}
          </span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
          background: isBest ? 'rgba(16,185,129,0.1)' : '#F1F5F9',
          color: isBest ? '#059669' : '#2563EB',
        }}>{route.score}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>📍 Distance</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{route.distance} km</span>
          </div>
          <div className="data-bar-track">
            <div className="data-bar-fill" style={{
              '--bar-width': barW(route.distance, maxD),
              background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>🌿 Carbon Emission</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{route.carbon} kg CO₂</span>
          </div>
          <div className="data-bar-track">
            <div className="data-bar-fill" style={{
              '--bar-width': barW(route.carbon, maxC),
              background: 'linear-gradient(90deg, #10B981, #34D399)',
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(241,245,249,0.5)', padding: '6px 8px', borderRadius: 8, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>🤖 Predicted Delay (AI)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1E293B' }}>{route.delay} min</span>
            <span className={`delay-badge ${dl.cls}`}>{dl.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DataPanel({ data, loading, error, onOptimize, onDismissError, sourceNode, destNode, setSourceNode, setDestNode }) {
  const routes = data?.routes || [];
  const bestRoute = data?.bestRoute || null;
  const metrics = data?.metrics || null;
  const [visible, setVisible] = useState(false);

  const maxD = routes.length ? Math.max(...routes.map(r => r.distance)) : 1;
  const maxC = routes.length ? Math.max(...routes.map(r => r.carbon)) : 1;

  useEffect(() => {
    if (data) {
      setVisible(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
    }
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      
      {/* 🔴 1. ORDER DETAILS (MANDATORY FIX) */}
      <div>
        <h2 className="section-label">📦 Active Order Details</h2>
        <p className="section-subtitle">Real-time status tracking for logistics order.</p>
        
        <div className="order-details-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 700 }}>A</span>
              <div>
                <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Source</p>
                <p style={{ fontSize: 13, color: '#1E293B', fontWeight: 700 }}>Delhi Hub (WH-A)</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#CBD5E1' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}/>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}/>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}/>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Destination</p>
                <p style={{ fontSize: 13, color: '#1E293B', fontWeight: 700 }}>Chennai Hub (CUST-E)</p>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: '#F0FDF4', color: '#10B981', fontSize: 12, fontWeight: 700 }}>E</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: loading || data ? 'rgba(37,99,235,0.06)' : '#F8FAFC', 
            border: `1px solid ${loading || data ? 'rgba(37,99,235,0.15)' : '#E5E7EB'}`, 
            padding: '8px', borderRadius: 8, gap: 8 
          }}>
            {loading ? (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ORDER CREATED → PROCESSING STARTED...
              </span>
            ) : data ? (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ORDER PROCESSED → ROUTE SELECTED
              </span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ORDER CREATED → WAITING FOR OPTIMIZATION
              </span>
            )}
          </div>
        </div>
      </div>

      <button id="optimize-btn" onClick={onOptimize} disabled={loading} className="btn-optimize"
        style={{ width: '100%', padding: '16px 24px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        {loading ? (
          <>
            <svg className="animate-spin-smooth" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            System Analyzing...
          </>
        ) : <>⚡ Optimize Route with AI</>}
      </button>

      {error && (
        <div style={{ borderRadius: 14, padding: 14, display: 'flex', alignItems: 'start', gap: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>Optimization Failed</p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{error}</p>
          </div>
          <button onClick={onDismissError} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* 🔴 2. PARCELFLOW ENGINE CONTENT (BEFORE BEST ROUTE) */}
      {routes.length > 0 && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.15s' }}>
          <div>
            <h2 className="section-label" style={{ color: '#2563EB' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              ParcelFlow Engine – Route Generation
            </h2>
            <p className="section-subtitle">
              Generated {routes.length} possible routes depicting parcel movement across logistics hubs.
            </p>
          </div>
          
          <div style={{ 
            flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, 
            paddingRight: 6, paddingBottom: 20 
          }}>
            {[...routes].sort((a, b) => a.score - b.score).map((route, i) => (
              <RouteCard key={i} route={route} isBest={false} index={i} maxC={maxC} maxD={maxD} visible={visible} />
            ))}

            {/* 🔴 6. BEST ROUTE SELECTION (AT BOTTOM AS DECISION) */}
            {bestRoute && metrics && (
              <div style={{ marginTop: 10, paddingTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                  <div style={{ height: 1, flex: 1, background: '#E5E7EB' }}/>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>System Decision</span>
                  <div style={{ height: 1, flex: 1, background: '#E5E7EB' }}/>
                </div>

                <div className="best-route-card" style={{
                  padding: 24, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.5s ease 1s, transform 0.5s ease 1s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#059669',
                      border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <span style={{ fontSize: 14 }}>🏆</span> TradeMind Optimal Selection
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>Score: {metrics.score}</span>
                  </div>
                  
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', marginBottom: 18, letterSpacing: '-0.02em', textAlign: 'center' }}>
                    {bestRoute.join(' → ')}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <MetricBox label="Distance" value={metrics.distance} unit="km" icon="📍" />
                    <MetricBox label="Carbon" value={metrics.carbon} unit="kg" accent="#059669" icon="🌿" />
                    <MetricBox label="Delay (AI)" value={metrics.delay} unit="m" icon="🤖" accent="#DC2626" />
                  </div>
                  
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'start', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>🧠</span>
                    <p style={{ fontSize: 11, lineHeight: 1.6, color: '#475569' }}>
                      Selected based on lowest combined score prioritizing eco-friendly routing and AI delay prediction:{' '}
                      <span style={{ display: 'block', marginTop: 4, fontFamily: 'monospace', fontSize: 10, color: '#1E293B', fontWeight: 600, background: 'rgba(0,0,0,0.04)', padding: '4px 8px', borderRadius: 6 }}>
                        score = (0.4 × carbon) + (0.3 × distance) + (0.3 × delay)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, margin: '0 auto 16px', borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F1F5F9', border: '1px solid #E5E7EB', fontSize: 32,
            }}>📦</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Ready for Processing</p>
            <p style={{ fontSize: 13, color: '#64748B', maxWidth: 240, margin: '0 auto', lineHeight: 1.5 }}>
              Click <strong style={{ color: '#2563EB' }}>Optimize Route</strong> to initiate the ParcelFlow engine and TradeMind AI evaluation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
