import { useState } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import DataPanel from './components/DataPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STEPS = [
  { id: 1, label: 'Generate Routes' },
  { id: 2, label: 'Analyze Distance' },
  { id: 3, label: 'Evaluate Carbon' },
  { id: 4, label: 'Predict Delay' },
  { id: 5, label: 'Select Best' },
];

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [animateMap, setAnimateMap] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    setData(null);
    setError(null);
    setAnimateMap(false);

    setCurrentStep(1);
    await delay(500);
    setCurrentStep(2);
    await delay(400);
    setCurrentStep(3);

    try {
      const res = await fetch(`${API_URL}/optimize`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Server responded with ${res.status}`);
      }
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setCurrentStep(4);
      await delay(500);
      setCurrentStep(5);
      await delay(400);

      setData(result);
      setAnimateMap(true);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot reach backend. Ensure it is running on ' + API_URL
          : err.message
      );
    } finally {
      setLoading(false);
      setTimeout(() => setCurrentStep(0), 1500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F8FAFC' }}>
      <Header />

      {/* ── Horizontal Step Bar ── */}
      {(loading || currentStep > 0) && (
        <div style={{ padding: '12px 24px 0' }}>
          <div className="step-bar">
            {STEPS.map((step, i) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`step-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                    <div className={`step-dot ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`} />
                    <span style={{
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#10B981' : isCompleted ? '#10B981' : '#94A3B8',
                    }}>
                      {isCompleted ? '✓ ' : ''}{step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`step-connector ${isCompleted ? 'done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '16px 24px 24px' }}>
        {/* MAP (LEFT) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginRight: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-label" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
              🗺️ Route Visualization
            </span>
            {data && (
              <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 14, height: 3, borderRadius: 2, background: '#3B82F6', display: 'inline-block' }} />
                  <span style={{ color: '#64748B' }}>Routes</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 14, height: 4, borderRadius: 2, background: '#10B981', display: 'inline-block' }} />
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Best Route</span>
                </span>
              </div>
            )}
          </div>
          <div style={{
            flex: 1, borderRadius: 18, overflow: 'hidden',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <MapView data={data} animate={animateMap} />
          </div>
        </div>

        {/* ANALYTICS (RIGHT) */}
        <div style={{
          width: 400, overflowY: 'auto',
          background: 'white', borderRadius: 18,
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          padding: 20,
        }}>
          <DataPanel
            data={data}
            loading={loading}
            error={error}
            onOptimize={handleOptimize}
            onDismissError={() => setError(null)}
          />
        </div>
      </div>
    </div>
  );
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
