import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import ErrorBoundary from './ErrorBoundary';
import { Suspense } from 'react';

export default function AreaChartBackground({ className = "" }) {
  // Monthly portfolio growth data points (Jan → Jul)
  // viewBox: 0 0 1000 400 — higher Y = lower on screen
  const dataPoints = [
    { x: 0,    y: 280 }, // Jan  — ₹1.0L
    { x: 143,  y: 250 }, // Feb  — ₹1.25L
    { x: 286,  y: 230 }, // Mar  — ₹1.5L
    { x: 429,  y: 195 }, // Apr  — ₹1.8L
    { x: 571,  y: 160 }, // May  — ₹2.1L
    { x: 714,  y: 110 }, // Jun  — ₹2.6L ← peak/active
    { x: 857,  y: 130 }, // Jul  — ₹2.4L
    { x: 1000, y: 95  }, // Aug  — ₹2.75L
  ];

  const pathData = `M${dataPoints.map(p => `${p.x},${p.y}`).join(' L')}`;
  const fillPathData = `${pathData} L1000,400 L0,400 Z`;

  // Active point: June (peak month)
  const activePoint = dataPoints[5];

  const xLabels = [
    { label: 'Jan', active: false },
    { label: 'Feb', active: false },
    { label: 'Mar', active: false },
    { label: 'Apr', active: false },
    { label: 'May', active: false },
    { label: 'Jun', active: true  },
    { label: 'Jul', active: false },
    { label: 'Aug', active: false },
  ];

  const yLabels = [
    { label: '₹3L' },
    { label: '₹2L' },
    { label: '₹1L' },
    { label: '₹0'  },
  ];

  return (
    <div className={`absolute inset-0 bg-[#0d1a08] flex flex-col justify-end pb-16 pt-32 px-10 font-['Outfit'] ${className}`}>


      {/* 3D Animation Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-70">
        <ErrorBoundary>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <fog attach="fog" args={['#0d1a08', 3, 10]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[2, 5, 2]} intensity={1.5} color="#a3e635" />
              <directionalLight position={[-2, -5, -2]} intensity={0.5} color="#ffffff" />
              
              {/* Floating Data Particles */}
              <Stars radius={10} depth={50} count={1500} factor={3} saturation={0} fade speed={1.5} />
              
              {/* Abstract Floating Rings representing financial cycles */}
              <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
                <mesh position={[2, 0, -1]} scale={1.2} rotation={[Math.PI / 4, 0, 0]}>
                  <torusGeometry args={[1.5, 0.015, 16, 100]} />
                  <meshStandardMaterial color="#84CC16" transparent opacity={0.3} />
                </mesh>
              </Float>
              <Float speed={1.2} rotationIntensity={1.5} floatIntensity={2}>
                <mesh position={[1.8, 0, -1]} scale={0.9} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                  <torusGeometry args={[1.5, 0.015, 16, 100]} />
                  <meshStandardMaterial color="#ffffff" transparent opacity={0.15} />
                </mesh>
              </Float>

              {/* Background Wireframe Element */}
              <Float speed={2} rotationIntensity={2} floatIntensity={1}>
                <mesh position={[-2, 1, -3]} scale={2}>
                  <icosahedronGeometry args={[1, 1]} />
                  <meshStandardMaterial color="#a3e635" wireframe transparent opacity={0.1} />
                </mesh>
              </Float>
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Background Grid & Axis Labels */}
      <div className="absolute inset-x-10 top-0 bottom-28 flex flex-col justify-between z-0 pointer-events-none mt-36">
        {yLabels.map((axis, i) => (
          <div key={i} className="flex flex-row items-center w-full relative">
            <span className="text-white/30 text-[11px] font-medium w-10 shrink-0">{axis.label}</span>
            <div className="flex-1 border-t border-dashed border-[#84CC16]/15 ml-2" />
          </div>
        ))}
      </div>

      {/* SVG Chart Layer */}
      <div className="relative w-full h-[260px] z-10 mt-6">
        <svg
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="authChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#84CC16" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#84CC16" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={fillPathData} fill="url(#authChartGradient)" />

          {/* Main Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#a3e635"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Highlight Vertical Line */}
          <line
            x1={activePoint.x} y1={activePoint.y}
            x2={activePoint.x} y2="400"
            stroke="#a3e635"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.6"
          />

          {/* Surrounding glow */}
          <circle cx={activePoint.x} cy={activePoint.y} r="18" fill="#84CC16" opacity="0.2" />
          {/* Dot Core */}
          <circle cx={activePoint.x} cy={activePoint.y} r="6" fill="#ffffff" stroke="#a3e635" strokeWidth="2" />
        </svg>

        {/* Tooltip Removed */}
      </div>

      {/* X-Axis Months */}
      <div className="flex justify-between w-full pl-10 pr-2 pt-4 z-10 border-t border-[#84CC16]/15">
        {xLabels.map((m, i) => (
          <div key={i} className={`flex flex-col items-center gap-0.5 ${m.active ? 'text-white' : 'text-white/30'}`}>
            <span className={`text-xs font-bold ${m.active ? 'text-[#84CC16]' : ''}`}>{m.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
