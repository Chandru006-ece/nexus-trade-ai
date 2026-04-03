import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
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
  A: 'Delhi (Hub A)',
  B: 'Mumbai (Hub B)',
  C: 'Bangalore (Hub C)',
  D: 'Kolkata (Hub D)',
  E: 'Chennai (Hub E)',
};

// Graph edges
const GRAPH_EDGES = [
  ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'],
  ['C', 'D'], ['C', 'E'], ['D', 'E'], ['A', 'D'], ['B', 'E'],
];

// Route colors for non-best routes
const ROUTE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#F97316'];

function createHubIcon(label, isOnBestRoute) {
  const bg = isOnBestRoute
    ? 'linear-gradient(135deg, #00D1B2, #00E5C7)'
    : 'linear-gradient(135deg, #1E3A8A, #3B82F6)';
  const border = isOnBestRoute ? '#00D1B2' : '#3B82F6';
  const shadow = isOnBestRoute
    ? '0 2px 16px rgba(0,209,178,0.5)'
    : '0 2px 12px rgba(30,58,138,0.4)';
  const size = isOnBestRoute ? 42 : 36;
  const fontSize = isOnBestRoute ? 15 : 13;
  const glow = isOnBestRoute ? 'animation: hubGlow 2s ease-in-out infinite;' : '';

  return L.divIcon({
    className: 'custom-hub-icon',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: ${bg};
      border: 3px solid ${border};
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: ${fontSize}px;
      font-family: 'Inter', sans-serif;
      box-shadow: ${shadow};
      ${glow}
    ">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/* ── Animated polyline that draws itself ── */
function AnimatedPolyline({ positions, color, weight, animate, delay: animDelay = 0 }) {
  const [progress, setProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) { setProgress(1); return; }
    setProgress(0);
    const timer = setTimeout(() => {
      const start = performance.now();
      const duration = 800;
      const tick = (now) => {
        const elapsed = now - start;
        const p = Math.min(elapsed / duration, 1);
        setProgress(p);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, animDelay);
    return () => clearTimeout(timer);
  }, [animate, animDelay]);

  if (progress <= 0 || positions.length < 2) return null;

  // Interpolate along the path
  const totalSegments = positions.length - 1;
  const targetProgress = progress * totalSegments;
  const visiblePositions = [];

  for (let i = 0; i <= totalSegments; i++) {
    if (i <= targetProgress) {
      visiblePositions.push(positions[i]);
    }
  }

  // Add interpolated point
  if (Math.floor(targetProgress) < totalSegments) {
    const segIndex = Math.floor(targetProgress);
    const segProgress = targetProgress - segIndex;
    const from = positions[segIndex];
    const to = positions[segIndex + 1];
    visiblePositions.push([
      from[0] + (to[0] - from[0]) * segProgress,
      from[1] + (to[1] - from[1]) * segProgress,
    ]);
  }

  return (
    <Polyline
      positions={visiblePositions}
      pathOptions={{ color, weight, opacity: 0.9 }}
    />
  );
}

/* ── Moving parcel dot along best route ── */
function ParcelDot({ positions, animate }) {
  const markerRef = useRef(null);
  const [dotPos, setDotPos] = useState(null);

  useEffect(() => {
    if (!animate || positions.length < 2) return;
    let cancelled = false;
    const totalSegments = positions.length - 1;
    const duration = 4000;

    const tick = (startTime) => (now) => {
      if (cancelled) return;
      const elapsed = (now - startTime) % duration;
      const progress = elapsed / duration;
      const target = progress * totalSegments;
      const segIndex = Math.min(Math.floor(target), totalSegments - 1);
      const segProgress = target - segIndex;
      const from = positions[segIndex];
      const to = positions[segIndex + 1] || from;
      setDotPos([
        from[0] + (to[0] - from[0]) * segProgress,
        from[1] + (to[1] - from[1]) * segProgress,
      ]);
      requestAnimationFrame(tick(startTime));
    };

    const startTime = performance.now();
    requestAnimationFrame(tick(startTime));
    return () => { cancelled = true; };
  }, [animate, positions]);

  if (!dotPos || !animate) return null;

  const icon = L.divIcon({
    className: 'parcel-dot',
    html: `<div style="
      width: 14px; height: 14px;
      background: #00D1B2;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 16px rgba(0,209,178,0.7), 0 0 32px rgba(0,209,178,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  return <Marker ref={markerRef} position={dotPos} icon={icon} />;
}

export default function MapView({ data, animate }) {
  const center = [20.5, 79.5];
  const bestPath = data?.bestRoute || [];
  const routes = data?.routes || [];

  const isEdgeOnBestPath = (a, b) => {
    for (let i = 0; i < bestPath.length - 1; i++) {
      if (
        (bestPath[i] === a && bestPath[i + 1] === b) ||
        (bestPath[i] === b && bestPath[i + 1] === a)
      ) return true;
    }
    return false;
  };

  // Get non-best routes for colored rendering
  const nonBestRoutes = routes.filter(
    r => r.path.join(',') !== bestPath.join(',')
  );

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
        />

        {/* Background edges — dim dashed lines */}
        {GRAPH_EDGES.map(([a, b]) => {
          const isBest = data && isEdgeOnBestPath(a, b);
          if (isBest) return null;
          return (
            <Polyline
              key={`bg-${a}-${b}`}
              positions={[HUB_COORDS[a], HUB_COORDS[b]]}
              pathOptions={{
                color: '#1E3A5F',
                weight: 1.5,
                opacity: 0.3,
                dashArray: '6 6',
              }}
            />
          );
        })}

        {/* Non-best routes — colored lines */}
        {nonBestRoutes.map((route, i) => {
          const positions = route.path.map(h => HUB_COORDS[h]);
          const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
          return (
            <AnimatedPolyline
              key={`route-${i}`}
              positions={positions}
              color={color}
              weight={3}
              animate={animate}
              delay={i * 200}
            />
          );
        })}

        {/* Best route — glow layer */}
        {bestPath.length > 1 && (
          <AnimatedPolyline
            positions={bestPath.map(h => HUB_COORDS[h])}
            color="#00D1B2"
            weight={14}
            animate={animate}
            delay={nonBestRoutes.length * 200 + 200}
          />
        )}

        {/* Best route — main line */}
        {bestPath.length > 1 && (
          <AnimatedPolyline
            positions={bestPath.map(h => HUB_COORDS[h])}
            color="#00D1B2"
            weight={5}
            animate={animate}
            delay={nonBestRoutes.length * 200 + 200}
          />
        )}

        {/* Moving parcel dot on best route */}
        <ParcelDot
          positions={bestPath.map(h => HUB_COORDS[h])}
          animate={animate && bestPath.length > 1}
        />

        {/* Hub markers */}
        {Object.entries(HUB_COORDS).map(([hub, coords]) => (
          <Marker
            key={hub}
            position={coords}
            icon={createHubIcon(hub, bestPath.includes(hub))}
          >
            <Tooltip direction="top" offset={[0, -24]} permanent={false}>
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '13px' }}>
                {HUB_NAMES[hub]}
              </span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
