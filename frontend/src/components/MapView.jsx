import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';

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

const GRAPH_EDGES = [
  ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'],
  ['C', 'D'], ['C', 'E'], ['D', 'E'], ['A', 'D'], ['B', 'E'],
];

const ROUTE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

/* ── Create curved path between two points for 3D depth feel ── */
function getCurvedPath(from, to, curvature = 0.15) {
  const points = [];
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  const dx = to[1] - from[1];
  const dy = to[0] - from[0];
  const controlLat = midLat + dx * curvature;
  const controlLng = midLng - dy * curvature;
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * controlLat + t * t * to[0];
    const lng = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * controlLng + t * t * to[1];
    points.push([lat, lng]);
  }
  return points;
}

/* ── Get full curved path for a multi-node route ── */
function getRoutePath(path) {
  const positions = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = HUB_COORDS[path[i]];
    const to = HUB_COORDS[path[i + 1]];
    const curve = getCurvedPath(from, to, 0.12);
    if (i > 0) curve.shift(); // avoid duplicate junction points
    positions.push(...curve);
  }
  return positions;
}

/* ── Hub marker with 3D shadow effect ── */
function createHubIcon(label, isOnBestRoute) {
  const bg = isOnBestRoute
    ? 'linear-gradient(180deg, #34D399, #10B981)'
    : 'linear-gradient(180deg, #60A5FA, #2563EB)';
  const borderColor = isOnBestRoute ? '#10B981' : '#2563EB';
  const size = isOnBestRoute ? 44 : 38;
  const fontSize = isOnBestRoute ? 15 : 13;

  return L.divIcon({
    className: 'custom-hub-icon',
    html: `<div style="position:relative;">
      <!-- Shadow -->
      <div style="
        position:absolute; top:4px; left:2px;
        width:${size}px; height:${size}px; border-radius:50%;
        background:rgba(0,0,0,0.12); filter:blur(4px);
      "></div>
      <!-- Main circle -->
      <div style="
        position:relative;
        width:${size}px; height:${size}px; border-radius:50%;
        background:${bg};
        border:3px solid ${borderColor};
        display:flex; align-items:center; justify-content:center;
        color:white; font-weight:700; font-size:${fontSize}px;
        font-family:'Inter',sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        ${isOnBestRoute ? 'animation: hubFloat 3s ease-in-out infinite;' : ''}
      ">${label}</div>
    </div>`,
    iconSize: [size + 4, size + 8],
    iconAnchor: [(size + 4) / 2, (size + 8) / 2],
  });
}

/* ── Animated Polyline with progressive drawing ── */
function AnimatedPolyline({ positions, color, weight, animate, delay: animDelay = 0, opacity = 0.9 }) {
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

  const totalPoints = positions.length;
  const visibleCount = Math.max(2, Math.ceil(progress * totalPoints));
  const visiblePositions = positions.slice(0, visibleCount);

  return (
    <Polyline
      positions={visiblePositions}
      pathOptions={{ color, weight, opacity }}
    />
  );
}

/* ── Moving parcel dot ── */
function ParcelDot({ positions, animate }) {
  const [dotPos, setDotPos] = useState(null);

  useEffect(() => {
    if (!animate || positions.length < 2) return;
    let cancelled = false;
    const duration = 5000;

    const tick = (startTime) => (now) => {
      if (cancelled) return;
      const t = ((now - startTime) % duration) / duration;
      const totalLen = positions.length - 1;
      const target = t * totalLen;
      const idx = Math.min(Math.floor(target), totalLen - 1);
      const frac = target - idx;
      const from = positions[idx];
      const to = positions[idx + 1] || from;
      setDotPos([
        from[0] + (to[0] - from[0]) * frac,
        from[1] + (to[1] - from[1]) * frac,
      ]);
      requestAnimationFrame(tick(startTime));
    };

    requestAnimationFrame(tick(performance.now()));
    return () => { cancelled = true; };
  }, [animate, positions]);

  if (!dotPos || !animate) return null;

  const icon = L.divIcon({
    className: 'parcel-dot',
    html: `<div style="position:relative;">
      <div style="position:absolute;top:2px;left:1px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.15);filter:blur(3px);"></div>
      <div style="position:relative;width:14px;height:14px;background:#10B981;border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(16,185,129,0.5);"></div>
    </div>`,
    iconSize: [16, 18],
    iconAnchor: [8, 9],
  });

  return <Marker position={dotPos} icon={icon} />;
}

export default function MapView({ data, animate }) {
  const center = [20.5, 79.5];
  const bestPath = data?.bestRoute || [];
  const routes = data?.routes || [];

  const isEdgeOnBestPath = (a, b) => {
    for (let i = 0; i < bestPath.length - 1; i++) {
      if ((bestPath[i] === a && bestPath[i + 1] === b) || (bestPath[i] === b && bestPath[i + 1] === a)) return true;
    }
    return false;
  };

  const nonBestRoutes = routes.filter(r => r.path.join(',') !== bestPath.join(','));
  const bestRoutePath = bestPath.length > 1 ? getRoutePath(bestPath) : [];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}
        zoomControl={true} attributionControl={false}>
        {/* Light theme tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        {/* Background edges — soft dashed */}
        {GRAPH_EDGES.map(([a, b]) => {
          if (data && isEdgeOnBestPath(a, b)) return null;
          const curved = getCurvedPath(HUB_COORDS[a], HUB_COORDS[b], 0.1);
          return (
            <Polyline key={`bg-${a}-${b}`} positions={curved}
              pathOptions={{ color: '#CBD5E1', weight: 1.5, opacity: 0.5, dashArray: '6 4' }} />
          );
        })}

        {/* Non-best routes — colored */}
        {nonBestRoutes.map((route, i) => {
          const positions = getRoutePath(route.path);
          const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
          return (
            <div key={`route-${i}`}>
              {/* Shadow layer */}
              <AnimatedPolyline positions={positions} color="rgba(0,0,0,0.08)" weight={6}
                animate={animate} delay={i * 200} opacity={0.5} />
              {/* Main line */}
              <AnimatedPolyline positions={positions} color={color} weight={3}
                animate={animate} delay={i * 200} />
            </div>
          );
        })}

        {/* Best route — shadow for depth */}
        {bestRoutePath.length > 1 && (
          <AnimatedPolyline positions={bestRoutePath} color="rgba(0,0,0,0.1)" weight={16}
            animate={animate} delay={nonBestRoutes.length * 200 + 200} opacity={0.3} />
        )}

        {/* Best route — glow */}
        {bestRoutePath.length > 1 && (
          <AnimatedPolyline positions={bestRoutePath} color="#10B981" weight={10}
            animate={animate} delay={nonBestRoutes.length * 200 + 200} opacity={0.15} />
        )}

        {/* Best route — main */}
        {bestRoutePath.length > 1 && (
          <AnimatedPolyline positions={bestRoutePath} color="#10B981" weight={4}
            animate={animate} delay={nonBestRoutes.length * 200 + 200} />
        )}

        {/* Parcel dot */}
        <ParcelDot positions={bestRoutePath} animate={animate && bestRoutePath.length > 1} />

        {/* Hub markers with 3D shadow */}
        {Object.entries(HUB_COORDS).map(([hub, coords]) => (
          <Marker key={hub} position={coords}
            icon={createHubIcon(hub, bestPath.includes(hub))}>
            <Tooltip direction="top" offset={[0, -26]} permanent={false}>
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}>
                {HUB_NAMES[hub]}
              </span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
