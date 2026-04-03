import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Header() {
  const [online, setOnline] = useState(null);

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
    const interval = setInterval(check, 30000);
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
      style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #112240 50%, #0F1F3A 100%)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Logo */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #1E3A8A, #00D1B2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 209, 178, 0.25)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            NexusTrade <span className="gradient-text">AI</span>
          </h1>
          <p style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginTop: 2,
          }}>
            Carbon-Aware Intelligent Logistics
          </p>
        </div>
      </div>

      {/* Right — status + version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Version badge */}
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 20,
          background: 'rgba(30, 58, 138, 0.2)',
          border: '1px solid rgba(30, 58, 138, 0.3)',
          color: 'var(--accent-blue-light)',
          letterSpacing: '0.05em',
        }}>
          v2.0
        </span>

        {/* Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 14px',
          borderRadius: 20,
          background: online === false ? 'rgba(239,68,68,0.08)' : 'rgba(0, 209, 178, 0.08)',
          border: `1px solid ${online === false ? 'rgba(239,68,68,0.15)' : 'rgba(0, 209, 178, 0.15)'}`,
        }}>
          <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
            {online !== false && (
              <span style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: statusColor,
                animation: 'pulseRing 2s ease-in-out infinite',
                opacity: 0.75,
              }} />
            )}
            <span style={{
              position: 'relative',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
            }} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>
            {statusText}
          </span>
        </div>
      </div>
    </header>
  );
}
