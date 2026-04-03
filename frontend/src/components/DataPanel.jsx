import { useEffect, useState } from 'react';

/* ── Icon Components ── */
const RouteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
    <path strokeLinecap="round" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5 0 3-.3 4.3-.9" />
    <path strokeLinecap="round" d="M12 2c5 4 7 9.5 5 16" />
    <path strokeLinecap="round" d="M17 8l5-2-2 5" />
  </svg>
);

/* ── Loading Stage Item ── */
function LoadingStage({ message, isActive }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="relative flex items-center justify-center w-5 h-5">
        {isActive ? (
          <>
            <span className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping"
              style={{ background: 'var(--accent-green)' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ background: 'var(--accent-green)' }} />
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2"
            style={{ background: 'var(--text-muted)', opacity: 0.4 }} />
        )}
      </div>
      <p className="text-sm font-medium" style={{
        color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
        transition: 'color 0.3s ease',
      }}>
        {message}
      </p>
    </div>
  );
}

/* ── Metric Box ── */
function MetricBox({ label, value, unit, accent }) {
  return (
    <div className="rounded-xl p-3 text-center"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
      }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-base font-bold" style={{ color: accent || 'var(--text-primary)' }}>
        {value}
        <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>
          {unit}
        </span>
      </p>
    </div>
  );
}

/* ── Score Badge ── */
function ScoreBadge({ score, isBest }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
      style={{
        background: isBest ? 'rgba(0,209,178,0.12)' : 'rgba(30,58,138,0.15)',
        color: isBest ? 'var(--accent-green)' : 'var(--accent-blue-light)',
        fontSize: '11px',
      }}>
      {score}
    </span>
  );
}

/* ── Main DataPanel ── */
export default function DataPanel({ data, loading, loadingStage, error, onOptimize, onDismissError }) {
  const routes = data?.routes || [];
  const bestRoute = data?.bestRoute || null;
  const metrics = data?.metrics || null;
  const [visible, setVisible] = useState(false);

  const STAGES = [
    'Generating routes…',
    'Calculating carbon…',
    'Predicting delay…',
    'Selecting best route…',
  ];

  useEffect(() => {
    if (data) {
      setVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }
  }, [data]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ── Optimize Button ── */}
      <button
        id="optimize-btn"
        onClick={onOptimize}
        disabled={loading}
        className="btn-optimize w-full py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide cursor-pointer text-white"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin-smooth w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Optimizing…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            ⚡ Optimize Route
          </span>
        )}
      </button>

      {/* ── Error Banner ── */}
      {error && (
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
          <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none"
            stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
              Optimization Failed
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {error}
            </p>
          </div>
          <button onClick={onDismissError} className="shrink-0 cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Loading Stages ── */}
      {loading && (
        <div className="glass-card p-4 loading-shimmer">
          {STAGES.map((stage, i) => (
            <LoadingStage key={i} message={stage} isActive={loadingStage === stage} />
          ))}
        </div>
      )}

      {/* ── Best Route Card ── */}
      {bestRoute && metrics && (
        <div
          className="glass-card p-5 best-route-glow"
          style={{
            background: 'linear-gradient(135deg, rgba(0,209,178,0.06), rgba(0,209,178,0.02))',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,209,178,0.12)', color: 'var(--accent-green)' }}>
              ✦ Best Route
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>
              Score: {metrics.score}
            </span>
          </div>

          {/* Route Path */}
          <p className="text-lg font-bold mb-4 tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {bestRoute.join(' → ')}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <MetricBox label="Distance" value={metrics.distance} unit="km" />
            <MetricBox label="Carbon" value={metrics.carbon} unit="kg" accent="var(--accent-green)" />
            <MetricBox label="Delay" value={metrics.delay} unit="min" />
          </div>

          {/* Explanation */}
          <div className="mt-3 pt-3 flex items-start gap-2"
            style={{ borderTop: '1px solid var(--border)' }}>
            <LeafIcon />
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Selected based on lowest combined score:
              <span className="font-mono ml-1" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                (0.4×carbon + 0.3×distance + 0.3×delay)
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── All Routes List ── */}
      {routes.length > 0 && (
        <div className="flex-1 overflow-hidden flex flex-col"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.15s',
          }}>
          <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3"
            style={{ color: 'var(--text-muted)' }}>
            All Routes ({routes.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {[...routes]
              .sort((a, b) => a.score - b.score)
              .map((route, i) => {
                const isBest = bestRoute && route.path.join(',') === bestRoute.join(',');
                return (
                  <div
                    key={i}
                    className={`glass-card p-3.5 ${isBest ? 'best-route-glow' : ''}`}
                    style={{
                      background: isBest
                        ? 'rgba(0,209,178,0.04)'
                        : undefined,
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 0.4s ease ${0.08 * i}s, transform 0.4s ease ${0.08 * i}s`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{
                        color: isBest ? 'var(--accent-green)' : 'var(--text-primary)',
                      }}>
                        {isBest && <span className="mr-1">✦</span>}
                        {route.path.join(' → ')}
                      </span>
                      <ScoreBadge score={route.score} isBest={isBest} />
                    </div>
                    <div className="flex gap-5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>{route.distance} km</span>
                      <span>{route.carbon} kg CO₂</span>
                      <span>{route.delay} min</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!data && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(30,58,138,0.15), rgba(0,209,178,0.08))',
                border: '1px solid var(--border)',
              }}>
              <RouteIcon />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              No routes analyzed
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Click <strong style={{ color: 'var(--text-primary)' }}>Optimize Route</strong> to find the best carbon-aware path
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
