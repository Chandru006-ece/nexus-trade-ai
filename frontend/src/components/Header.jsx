import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Header() {
  const [online, setOnline] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(4000) });
        if (!cancelled) setOnline(res.ok);
      } catch {
        if (!cancelled) setOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000); // re-check every 30s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const statusColor = online === null
    ? 'var(--text-muted)'
    : online ? 'var(--accent-green)' : '#EF4444';
  const statusText = online === null
    ? 'Checking…'
    : online ? 'System Online' : 'Backend Offline';

  return (
    <header
      className="flex items-center justify-between px-8 py-4"
      style={{
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Logo Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
            boxShadow: '0 4px 20px rgba(0, 209, 178, 0.25)',
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            NexusTrade
            <span className="gradient-text ml-1.5">AI</span>
          </h1>
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', marginTop: '1px' }}
          >
            Carbon-Aware Logistics Dashboard
          </p>
        </div>
      </div>

      {/* Right side — status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: online === false ? 'rgba(239,68,68,0.08)' : 'rgba(0, 209, 178, 0.08)',
            border: `1px solid ${online === false ? 'rgba(239,68,68,0.15)' : 'rgba(0, 209, 178, 0.15)'}`,
          }}>
          <span className="relative flex h-2 w-2">
            {online !== false && (
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: statusColor, animation: 'pulseRing 2s ease-in-out infinite' }} />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: statusColor }} />
          </span>
          <span className="text-xs font-medium" style={{ color: statusColor }}>
            {statusText}
          </span>
        </div>
      </div>
    </header>
  );
}

