import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Sphere, Torus, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import ErrorBoundary from './ErrorBoundary'
import { Suspense } from 'react'

/* ──────────────────── Precision Gyroscope Rings ──────────────────── */
function PrecisionRings() {
  const outerRingRef = useRef()
  const middleRingRef = useRef()
  const innerRingRef = useRef()
  const coreRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    // Smooth, complex counter-rotations
    if (outerRingRef.current) outerRingRef.current.rotation.x = t * 0.15
    if (outerRingRef.current) outerRingRef.current.rotation.y = t * 0.2
    
    if (middleRingRef.current) middleRingRef.current.rotation.y = -t * 0.25
    if (middleRingRef.current) middleRingRef.current.rotation.z = t * 0.1
    
    if (innerRingRef.current) innerRingRef.current.rotation.x = -t * 0.3
    if (innerRingRef.current) innerRingRef.current.rotation.z = -t * 0.2

    // Core pulsing slowly
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05)
  })

  // Shared premium metallic material
  const metalMaterial = (
    <meshStandardMaterial
      color="#ffffff"
      metalness={1}
      roughness={0.05}
      envMapIntensity={2.5}
    />
  );

  return (
    <group scale={1.5}>
      {/* Outer Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[3, 0.05, 32, 100]} />
        {metalMaterial}
      </mesh>

      {/* Middle Ring */}
      <mesh ref={middleRingRef}>
        <torusGeometry args={[2.5, 0.08, 32, 100]} />
        {metalMaterial}
      </mesh>

      {/* Inner Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[2, 0.03, 32, 100]} />
        {metalMaterial}
      </mesh>

      {/* Distorted Core (Liquid Metal) */}
      <mesh ref={coreRef}>
        <Sphere args={[1.2, 64, 64]}>
           <MeshDistortMaterial 
             color="#ffffff" 
             metalness={1} 
             roughness={0} 
             envMapIntensity={3} 
             distort={0.4} 
             speed={2} 
           />
        </Sphere>
      </mesh>
    </group>
  )
}

/* ──────────────────── Ambient Dust Particles ──────────────────── */
function DustParticles({ count = 200 }) {
  const meshRef = useRef()
  const dummy = React.useMemo(() => new THREE.Object3D(), [])

  const particles = React.useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
        temp.push({
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20,
            speed: 0.01 + Math.random() * 0.02,
            scale: 0.02 + Math.random() * 0.05
        })
    }
    return temp
  }, [count])

  useFrame((state) => {
    particles.forEach((p, i) => {
      p.y -= p.speed
      if (p.y < -10) p.y = 10
      
      dummy.position.set(
        p.x + Math.sin(state.clock.elapsedTime + i) * 0.5, 
        p.y, 
        p.z
      )
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
    </instancedMesh>
  )
}

/* ──────────────────────── main 3D scene ─────────────────────── */
function Scene() {
  return (
    <>
      {/* High-contrast city reflection for sleek silver look */}
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 15]} intensity={5} color="#ffffff" />
      <spotLight position={[-10, -10, 10]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <PrecisionRings />
      </Float>

      <DustParticles />
    </>
  )
}

export default function PrecisionRingsBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none opacity-80 transition-opacity duration-1000 ${className}`}>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 45 }}
          gl={{ antialias: true, alpha: true, stencil: false }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2 + 0.2}
              minPolarAngle={Math.PI / 2 - 0.2}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
