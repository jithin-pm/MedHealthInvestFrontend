import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, QuadraticBezierLine } from '@react-three/drei'
import * as THREE from 'three'
import ErrorBoundary from './ErrorBoundary'
import { Suspense } from 'react'

/* ──────────────────── 3D Candlestick ──────────────────── */
function Candlestick({ position, isBullish, bodyHeight, wickHeight, delay }) {
  const groupRef = useRef()
  const bodyRef = useRef()

  const color = isBullish ? '#00e676' : '#ff1744' // Neon Green / Neon Red

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      // Gentle floating effect so it's not totally static
      groupRef.current.position.y = position[1] + Math.sin(t + delay) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Wick */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.05, wickHeight, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Body */}
      <mesh ref={bodyRef}>
        <boxGeometry args={[0.4, bodyHeight, 0.4]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          transparent
          opacity={0.9} 
        />
      </mesh>
    </group>
  )
}

/* ──────────────────── Glowing Trend Line ──────────────────── */
function TrendLine() {
  return (
    <QuadraticBezierLine
      start={[-6, -2, -1]}    // Start low
      mid={[0, 1, 0]}         // Dip/bend in middle
      end={[6, 4, -1]}        // End high
      color="#00e676"
      lineWidth={3}
      dashed={false}
    />
  )
}

/* ──────────────────────── Main 3D Scene ─────────────────────── */
function Scene() {
  // Generate a sequence of candlesticks going up
  const candles = useMemo(() => {
    const data = [
      { bullish: true, body: 1.5, wick: 2.5, y: -1 },
      { bullish: false, body: 0.8, wick: 1.5, y: -0.5 },
      { bullish: true, body: 2.0, wick: 3.0, y: 0.5 },
      { bullish: true, body: 1.2, wick: 2.0, y: 1.5 },
      { bullish: false, body: 1.0, wick: 2.5, y: 1.0 },
      { bullish: true, body: 2.5, wick: 4.0, y: 2.0 },
      { bullish: true, body: 1.8, wick: 2.5, y: 3.5 },
    ]
    
    // Spread them out horizontally along X axis
    return data.map((d, i) => ({
      ...d,
      x: -4.5 + i * 1.5,
      delay: i * 0.5
    }))
  }, [])

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      
      {/* Directional light to give volume to the candles */}
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />

      {/* Group to center and angle the entire chart slightly */}
      <group rotation={[0.1, Math.PI / 8, 0]} position={[0, -1, 0]}>
        {candles.map((c, i) => (
          <Candlestick 
            key={i} 
            position={[c.x, c.y, 0]} 
            isBullish={c.bullish} 
            bodyHeight={c.body} 
            wickHeight={c.wick} 
            delay={c.delay} 
          />
        ))}
        
        {/* The soaring trend line weaving through */}
        <TrendLine />
      </group>

      {/* Grid Floor to anchor the "finance terminal" look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#050505" 
          metalness={0.5} 
          roughness={0.8}
        />
      </mesh>
      <gridHelper args={[20, 20, '#111111', '#111111']} position={[0, -3.49, 0]} />
    </>
  )
}

export default function CandlestickChartBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none opacity-90 transition-opacity duration-1000 ${className}`}>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 1, 10], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene />
            {/* Very slow pan across the chart */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.2}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2 - 0.2}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
