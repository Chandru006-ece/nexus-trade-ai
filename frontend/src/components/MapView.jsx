import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const HUB_COORDS = {
  A: [28.6139, 77.2090],
  B: [19.0760, 72.8777],
  C: [12.9716, 77.5946],
  D: [22.5726, 88.3639],
  E: [13.0827, 80.2707],
};

const HUB_NAMES = {
  A: 'Delhi (Hub A)', B: 'Mumbai (Hub B)', C: 'Bangalore (Hub C)',
  D: 'Kolkata (Hub D)', E: 'Chennai (Hub E)',
};

const GRAPH_EDGES = [
  ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'],
  ['C', 'D'], ['C', 'E'], ['D', 'E'], ['A', 'D'], ['B', 'E'],
];

const ROUTE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

function getCurvedPath(from, to, curvature = 0.12) {
  const pts = [];
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  const dx = to[1] - from[1], dy = to[0] - from[0];
  const cLat = midLat + dx * curvature, cLng = midLng - dy * curvature;
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    pts.push([
      (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * cLat + t * t * to[0],
      (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * cLng + t * t * to[1],
    ]);
  }
  return pts;
}

function getRoutePath(path) {
  const positions = [];
  for (let i = 0; i < path.length - 1; i++) {
    const curve = getCurvedPath(HUB_COORDS[path[i]], HUB_COORDS[path[i + 1]]);
    if (i > 0) curve.shift();
    positions.push(...curve);
  }
  return positions;
}

function createHubIcon(label, isOnBestRoute) {
  const bg = isOnBestRoute
    ? 'linear-gradient(180deg, #34D399, #10B981)'
    : 'linear-gradient(180deg, #60A5FA, #2563EB)';
  const border = isOnBestRoute ? '#10B981' : '#3B82F6';
  const size = isOnBestRoute ? 44 : 38;
  const fs = isOnBestRoute ? 15 : 13;
  const glow = isOnBestRoute
    ? 'box-shadow:0 0 20px rgba(16,185,129,0.5),0 4px 12px rgba(0,0,0,0.3);animation:hubFloat 3s ease-in-out infinite;'
    : 'box-shadow:0 4px 12px rgba(0,0,0,0.3);';

  return L.divIcon({
    className: 'custom-hub-icon',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:3px solid ${border};
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${fs}px;
      font-family:'Inter',sans-serif;${glow}
    ">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function AnimatedPolyline({ positions, color, weight, animate, delay: d = 0, opacity = 0.9 }) {
  const [progress, setProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) { setProgress(1); return; }
    setProgress(0);
    const timer = setTimeout(() => {
      const start = performance.now();
      const dur = 800;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        setProgress(p);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, d);
    return () => clearTimeout(timer);
  }, [animate, d]);

  if (progress <= 0 || positions.length < 2) return null;
  const count = Math.max(2, Math.ceil(progress * positions.length));
  return <Polyline positions={positions.slice(0, count)} pathOptions={{ color, weight, opacity }} />;
}

function ParcelDot({ positions, animate }) {
  const [dotPos, setDotPos] = useState(null);

  useEffect(() => {
    if (!animate || positions.length < 2) return;
    let cancelled = false;
    const dur = 5000;
    const tick = (s) => (now) => {
      if (cancelled) return;
      const t = ((now - s) % dur) / dur;
      const total = positions.length - 1;
      const target = t * total;
      const idx = Math.min(Math.floor(target), total - 1);
      const frac = target - idx;
      const from = positions[idx], to = positions[idx + 1] || from;
      setDotPos([from[0] + (to[0] - from[0]) * frac, from[1] + (to[1] - from[1]) * frac]);
      requestAnimationFrame(tick(s));
    };
    requestAnimationFrame(tick(performance.now()));
    return () => { cancelled = true; };
  }, [animate, positions]);

  if (!dotPos || !animate) return null;
  const icon = L.divIcon({
    className: 'parcel-dot',
    html: `<div style="width:14px;height:14px;background:#10B981;border-radius:50%;border:3px solid white;box-shadow:0 0 16px rgba(16,185,129,0.6),0 0 32px rgba(16,185,129,0.25);"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7],
  });
  return <Marker position={dotPos} icon={icon} />;
}

export default function MapView({ data, animate }) {
  const bestPath = data?.bestRoute || [];
  const routes = data?.routes || [];
  const nonBest = routes.filter(r => r.path.join(',') !== bestPath.join(','));
  const bestRoutePath = bestPath.length > 1 ? getRoutePath(bestPath) : [];

  const isEdgeOnBest = (a, b) => {
    for (let i = 0; i < bestPath.length - 1; i++)
      if ((bestPath[i] === a && bestPath[i + 1] === b) || (bestPath[i] === b && bestPath[i + 1] === a)) return true;
    return false;
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={[20.5, 79.5]} zoom={5} style={{ height: '100%', width: '100%' }}
        zoomControl={true} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />

        {/* Background edges */}
        {GRAPH_EDGES.map(([a, b]) => {
          if (data && isEdgeOnBest(a, b)) return null;
          return <Polyline key={`bg-${a}-${b}`} positions={getCurvedPath(HUB_COORDS[a], HUB_COORDS[b], 0.08)}
            pathOptions={{ color: '#1E3A5F', weight: 1.5, opacity: 0.3, dashArray: '6 4' }} />;
        })}

        {/* Non-best routes */}
        {nonBest.map((route, i) => {
          const pos = getRoutePath(route.path);
          const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
          return <AnimatedPolyline key={`r-${i}`} positions={pos} color={color} weight={3}
            animate={animate} delay={i * 200} />;
        })}

        {/* Best route — glow */}
        {bestRoutePath.length > 1 && (
          <AnimatedPolyline positions={bestRoutePath} color="#10B981" weight={14}
            animate={animate} delay={nonBest.length * 200 + 200} opacity={0.15} />
        )}
        {/* Best route — main */}
        {bestRoutePath.length > 1 && (
          <AnimatedPolyline positions={bestRoutePath} color="#10B981" weight={5}
            animate={animate} delay={nonBest.length * 200 + 200} />
        )}

        <ParcelDot positions={bestRoutePath} animate={animate && bestRoutePath.length > 1} />

        {Object.entries(HUB_COORDS).map(([hub, coords]) => (
          <Marker key={hub} position={coords} icon={createHubIcon(hub, bestPath.includes(hub))}>
            <Tooltip direction="top" offset={[0, -24]} permanent={false}>
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}>{HUB_NAMES[hub]}</span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
