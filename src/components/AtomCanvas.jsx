import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Three rings fanned 60deg apart around Y, each pitched forward on X so the
// ellipses read as tilted 3D orbits rather than flat circles (same
// composition as the old flat SVG watermark this component replaces).
const RING_CONFIG = [
  { radiusX: 2.3, radiusZ: 1.05, tiltX: 0.4, tiltY: 0, color: '#22d3ee', speed: 0.55 },
  { radiusX: 2.3, radiusZ: 1.05, tiltX: 0.4, tiltY: Math.PI / 3, color: '#a855f7', speed: -0.4 },
  { radiusX: 2.3, radiusZ: 1.05, tiltX: 0.4, tiltY: (2 * Math.PI) / 3, color: '#34d399', speed: 0.32 },
];

function ellipsePoints(radiusX, radiusZ, segments = 96) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(t) * radiusX, 0, Math.sin(t) * radiusZ));
  }
  return pts;
}

function OrbitRing({ radiusX, radiusZ, tiltX, tiltY, color, speed, reduced }) {
  const points = useMemo(() => ellipsePoints(radiusX, radiusZ), [radiusX, radiusZ]);
  const electronRef = useRef(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!electronRef.current) return;
    angleRef.current += delta * speed * (reduced ? 0.15 : 1);
    const a = angleRef.current;
    electronRef.current.position.set(Math.cos(a) * radiusX, 0, Math.sin(a) * radiusZ);
  });

  return (
    <group rotation={[tiltX, tiltY, 0]}>
      <Line points={points} color={color} transparent opacity={0.4} lineWidth={1.25} />
      <mesh ref={electronRef}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Nucleus() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color="#c026d3" emissive="#22d3ee" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* Faux bloom: a larger additive-blended, low-opacity shell around the core. */}
      <mesh scale={1.9}>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#a855f7" intensity={4} distance={7} decay={2} />
    </group>
  );
}

function AutoRotateGroup({ reduced, children }) {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * (reduced ? 0.02 : 0.08);
    ref.current.rotation.x = Math.sin(Date.now() * 0.00004) * 0.12;
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ reduced }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <AutoRotateGroup reduced={reduced}>
        <Nucleus />
        {RING_CONFIG.map((ring) => (
          <OrbitRing key={ring.color} {...ring} reduced={reduced} />
        ))}
      </AutoRotateGroup>
    </>
  );
}

// Non-intrusive decorative background layer: absolutely positioned, no
// pointer events (so it never intercepts clicks on the form above it), and
// aria-hidden since it's purely ornamental.
export default function AtomCanvas({ reducedMotion = false, className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 1.1, 6], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Scene reduced={reducedMotion} />
        </Canvas>
      </Suspense>
    </div>
  );
}
