import { useState } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import DataPanel from './components/DataPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LOADING_STEPS = [
  { id: 1, label: 'Generating possible routes…' },
  { id: 2, label: 'Calculating distance metrics…' },
  { id: 3, label: 'Evaluating carbon emissions…' },
  { id: 4, label: 'Predicting delay using TradeMind AI…' },
  { id: 5, label: 'Selecting optimal route…' },
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

    await delay(600);
    setCurrentStep(2);
    await delay(500);
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
      await delay(600);
      setCurrentStep(5);
      await delay(500);

      setData(result);
      setAnimateMap(true);
    } catch (err) {
      console.error('Optimization failed:', err);
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot reach backend. Ensure it is running on ' + API_URL
          : err.message
      );
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
    }}>
      <Header />

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* MAP SECTION (LEFT) */}
        <div style={{
          flex: 1,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {/* Map label */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                🗺️ Route Visualization
              </span>
            </div>
            {data && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 11,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 3, borderRadius: 2, background: '#3B82F6', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Route 1</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 3, borderRadius: 2, background: '#8B5CF6', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Route 2</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 4, borderRadius: 2, background: '#00D1B2', display: 'inline-block' }} />
                  <span style={{ color: 'var(--accent-green)' }}>Best Route</span>
                </span>
              </div>
            )}
          </div>

          {/* Map */}
          <div style={{ flex: 1, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <MapView data={data} animate={animateMap} />
          </div>
        </div>

        {/* ANALYTICS PANEL (RIGHT) */}
        <div style={{
          width: 420,
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          overflowY: 'auto',
          padding: 20,
        }}>
          <DataPanel
            data={data}
            loading={loading}
            currentStep={currentStep}
            steps={LOADING_STEPS}
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
