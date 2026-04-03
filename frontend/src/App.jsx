import { useState } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import DataPanel from './components/DataPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    setLoading(true);
    setData(null);
    setError(null);

    // Staged loading messages
    setLoadingStage('Generating routes…');
    await delay(700);
    setLoadingStage('Calculating carbon…');
    await delay(600);
    setLoadingStage('Predicting delay…');

    try {
      const res = await fetch(`${API_URL}/optimize`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Server responded with ${res.status}`);
      }
      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setLoadingStage('Selecting best route…');
      await delay(500);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot reach the backend server. Make sure it is running on ' + API_URL
          : err.message
      );
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 p-4 min-h-[300px]">
          <MapView data={data} />
        </div>
        {/* Data Panel */}
        <div
          className="w-full lg:w-[400px] p-5 overflow-y-auto"
          style={{
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <DataPanel
            data={data}
            loading={loading}
            loadingStage={loadingStage}
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

