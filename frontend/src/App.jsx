import { useState } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import DataPanel from './components/DataPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STEPS = [
  { id: 1, label: 'Generating routes\n(ParcelFlow)' },
  { id: 2, label: 'Calculating\nDistances' },
  { id: 3, label: 'Evaluating\nCarbon' },
  { id: 4, label: 'Predicting Delay\n(TradeMind AI)' },
  { id: 5, label: 'Selecting\nOptimal Route' },
];

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [animateMap, setAnimateMap] = useState(false);
  // Default selected order
  const [sourceNode, setSourceNode] = useState('A');
  const [destNode, setDestNode] = useState('E');

  const handleOptimize = async () => {
    setLoading(true);
    setData(null);
    setError(null);
    setAnimateMap(false);

    // AI Step-by-step thinking simulation (approx 3-4s total)
    setCurrentStep(1); // Generating
    await delay(600);
    setCurrentStep(2); // Distance
    await delay(500);
    setCurrentStep(3); // Carbon
    
    try {
      // In a real app we'd pass sourceNode/destNode. For now the backend 
      // is hardcoded to A -> E, but we simulate it visually.
      const res = await fetch(`${API_URL}/optimize?source=${sourceNode}&dest=${destNode}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Server error ${res.status}`);
      }
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setCurrentStep(4); // Predict delay 
      await delay(800);  // Make the AI delay calculation feel heavy
      setCurrentStep(5); // Select optimal
      await delay(500);

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
      setTimeout(() => setCurrentStep(0), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0B1120' }}>
      <Header />

      {/* ═══ Horizontal Step Bar (System process visibility) ═══ */}
      {(loading || currentStep > 0) && (
        <div style={{ padding: '20px 32px 0' }}>
          <div className="step-bar">
            {STEPS.map((step, i) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                  <div className={`step-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                    <div className="step-dot" />
                    <span className="step-label" style={{ whiteSpace: 'pre-line', marginTop: 8, lineHeight: 1.3 }}>
                      {step.label}
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

      {/* ═══ Main Content ═══ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: 20, gap: 0 }}>
        {/* ── DARK MAP ZONE (LEFT) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginRight: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-label-dark">🗺️ Route Visualization</span>
            {data && (
              <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 14, height: 3, borderRadius: 2, background: '#3B82F6', display: 'inline-block' }} />
                  <span style={{ color: '#64748B' }}>Routes</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 14, height: 4, borderRadius: 2, background: '#10B981', display: 'inline-block' }} />
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Optimal Selection</span>
                </span>
              </div>
            )}
          </div>
          <div style={{
            flex: 1, borderRadius: 18, overflow: 'hidden',
            border: '1px solid rgba(31,46,64,0.6)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
          }}>
            <MapView data={data} animate={animateMap} />
          </div>
        </div>

        {/* ── LIGHT ANALYTICS PANEL (RIGHT) ── */}
        <div style={{
          width: 440, // Increased width slightly to fit order details and cards better
          borderRadius: 18,
          background: 'var(--light-bg)',
          border: '1px solid rgba(229,231,235,0.8)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.06)',
          overflowY: 'auto',
          padding: 20,
        }}>
          <DataPanel
            data={data}
            loading={loading}
            error={error}
            onOptimize={handleOptimize}
            onDismissError={() => setError(null)}
            sourceNode={sourceNode}
            destNode={destNode}
            setSourceNode={setSourceNode}
            setDestNode={setDestNode}
          />
        </div>
      </div>
    </div>
  );
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
