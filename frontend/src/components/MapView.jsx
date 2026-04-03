import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Hub coordinates — major Indian logistics cities
const HUB_COORDS = {
  A: [28.6139, 77.2090],   // Delhi
  B: [19.0760, 72.8777],   // Mumbai
  C: [12.9716, 77.5946],   // Bangalore
  D: [22.5726, 88.3639],   // Kolkata
  E: [13.0827, 80.2707],   // Chennai
};

const HUB_NAMES = {
  A: 'Delhi',
  B: 'Mumbai',
  C: 'Bangalore',
  D: 'Kolkata',
  E: 'Chennai',
};

// Graph edges
const GRAPH_EDGES = [
  ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'],
  ['C', 'D'], ['C', 'E'], ['D', 'E'], ['A', 'D'], ['B', 'E'],
];

function createHubIcon(label, isOnBestRoute) {
  const bg = isOnBestRoute
    ? 'linear-gradient(135deg, #00D1B2, #00E5C7)'
    : 'linear-gradient(135deg, #1E3A8A, #3B5FBF)';
  const border = isOnBestRoute ? '#00D1B2' : '#2B4FCF';
  const shadow = isOnBestRoute
    ? '0 2px 16px rgba(0,209,178,0.5)'
    : '0 2px 12px rgba(30,58,138,0.4)';
  const glow = isOnBestRoute ? 'animation: hubGlow 2s ease-in-out infinite;' : '';

  return L.divIcon({
    className: 'custom-hub-icon',
    html: `<div style="
      width: 38px; height: 38px;
      border-radius: 50%;
      background: ${bg};
      border: 3px solid ${border};
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 14px;
      font-family: 'Inter', sans-serif;
      box-shadow: ${shadow};
      ${glow}
    ">${label}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

export default function MapView({ data }) {
  const center = [20.5, 79.5];
  const bestPath = data?.bestRoute || [];

  const isOnBestPath = (a, b) => {
    for (let i = 0; i < bestPath.length - 1; i++) {
      if (
        (bestPath[i] === a && bestPath[i + 1] === b) ||
        (bestPath[i] === b && bestPath[i + 1] === a)
      ) return true;
    }
    return false;
  };

  return (
    <div className="h-full w-full relative">
      {/* Map Container */}
      <div className="h-full w-full rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}>
        <MapContainer center={center} zoom={5} className="h-full w-full"
          zoomControl={true} attributionControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />

          {/* Background edges — dashed, dim */}
          {GRAPH_EDGES.map(([a, b]) => {
            const isBest = data && isOnBestPath(a, b);
            if (isBest) return null; // draw best ones separately on top
            return (
              <Polyline
                key={`bg-${a}-${b}`}
                positions={[HUB_COORDS[a], HUB_COORDS[b]]}
                pathOptions={{
                  color: '#1E3A5F',
                  weight: 2,
                  opacity: 0.35,
                  dashArray: '6 6',
                }}
              />
            );
          })}

          {/* Best route overlay — thick green, solid */}
          {bestPath.length > 1 && (
            <>
              {/* Glow layer */}
              <Polyline
                positions={bestPath.map(h => HUB_COORDS[h])}
                pathOptions={{
                  color: '#00D1B2',
                  weight: 12,
                  opacity: 0.15,
                }}
              />
              {/* Main line */}
              <Polyline
                positions={bestPath.map(h => HUB_COORDS[h])}
                pathOptions={{
                  color: '#00D1B2',
                  weight: 5,
                  opacity: 0.95,
                }}
              />
            </>
          )}

          {/* Hub markers */}
          {Object.entries(HUB_COORDS).map(([hub, coords]) => (
            <Marker
              key={hub}
              position={coords}
              icon={createHubIcon(hub, bestPath.includes(hub))}
            >
              <Tooltip direction="top" offset={[0, -22]} permanent={false}>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '13px' }}>
                  Hub {hub} — {HUB_NAMES[hub]}
                </span>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card px-4 py-3"
        style={{ fontSize: '11px' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{
              width: 20, height: 3, borderRadius: 2,
              background: '#00D1B2', display: 'inline-block',
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>Best Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{
              width: 20, height: 2, borderRadius: 2,
              background: '#1E3A5F', display: 'inline-block',
              borderTop: '2px dashed #1E3A5F', height: 0,
            }} />
            <span style={{ color: 'var(--text-muted)' }}>Other Paths</span>
          </div>
        </div>
      </div>
    </div>
  );
}
