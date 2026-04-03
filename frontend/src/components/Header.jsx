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

  const isOnline = online === true;
  const statusColor = online === null ? '#64748B' : isOnline ? '#10B981' : '#EF4444';
  const statusText = online === null ? 'Checking…' : isOnline ? 'System Online' : 'Offline';

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0B1120 0%, #111827 40%, #0F172A 100%)',
      borderBottom: '1px solid rgba(31,46,64,0.6)',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Subtle glow line at bottom */}
      <div style={{
        position: 'absolute', bottom: -1, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.3) 30%, rgba(16,185,129,0.3) 70%, transparent)',
      }} />

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'linear-gradient(135deg, #2563EB, #10B981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(16,185,129,0.3), 0 0 40px rgba(37,99,235,0.15)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            NexusTrade <span className="gradient-text">AI</span>
          </h1>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748B', marginTop: 1 }}>
            Carbon-Aware Intelligent Logistics
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
          background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#60A5FA',
        }}>v2.0</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 20,
          background: isOnline ? 'rgba(16,185,129,0.08)' : online === false ? 'rgba(239,68,68,0.08)' : 'rgba(100,116,139,0.08)',
          border: `1px solid ${isOnline ? 'rgba(16,185,129,0.2)' : online === false ? 'rgba(239,68,68,0.2)' : 'rgba(100,116,139,0.15)'}`,
        }}>
          <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
            {isOnline && (
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: statusColor, animation: 'pulseRing 2s ease-in-out infinite', opacity: 0.6,
              }} />
            )}
            <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: statusColor }} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{statusText}</span>
        </div>
      </div>
    </header>
  );
}
