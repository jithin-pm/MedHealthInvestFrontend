import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei'
import * as THREE from 'three'
import ErrorBoundary from './ErrorBoundary'
import { Suspense } from 'react'

/* ─────────────────── falling coins (instanced) ────────────────── */
function FallingCoins({ count = 180 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // wide x range for full screen coverage + varied sizes
  const coins = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 55,
        y: Math.random() * 50 - 25,
        z: (Math.random() - 0.5) * 20,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 2.2,
        velocity: 0.01 + Math.random() * 0.035,
        rotVelocity: (Math.random() - 0.5) * 0.05,
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    coins.forEach((coin, i) => {
      coin.y -= coin.velocity
      coin.rx += coin.rotVelocity
      coin.ry += coin.rotVelocity * 1.2

      if (coin.y < -25) {
        coin.y = 25
        coin.x = (Math.random() - 0.5) * 55
      }

      dummy.position.set(coin.x, coin.y, coin.z)
      dummy.rotation.set(coin.rx, coin.ry, coin.rz)
      dummy.scale.setScalar(coin.scale * (1 + Math.sin(t + i) * 0.05))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.03}
        envMapIntensity={2.5}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  )
}

/* ─────────────────────── orbiting ring ──────────────────────── */
function OrbitRing({ radius, speed, tilt }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * speed
  })
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 16, 128]} />
      <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} opacity={0.1} transparent />
    </mesh>
  )
}

/* ──────────────────────── main 3D scene ─────────────────────── */
function Scene() {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 10]} intensity={3} color="#ffffff" castShadow />
      <pointLight position={[-10, 5, 5]} intensity={2} color="#ffffff" />
      <spotLight position={[0, 12, 0]} angle={0.4} penumbra={1} intensity={2.5} color="#ffffff" castShadow />

      {/* Floating background rings around hero center */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5} position={[0, 0, -4]}>
        <OrbitRing radius={3.5} speed={0.4} tilt={Math.PI / 2.2} />
        <OrbitRing radius={4.2} speed={-0.3} tilt={Math.PI / 6} />
      </Float>

      {/* Subtle central sphere for global depth */}
      <Float speed={1} position={[0, 0, -5]}>
        <Sphere args={[2, 64, 64]}>
          <MeshDistortMaterial color="#050505" distort={0.3} speed={1.2} metalness={1} />
        </Sphere>
      </Float>

      {/* Full screen money rain - uniform distribution */}
      <FallingCoins count={180} />
    </>
  )
}

export default function MoneyRainBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none opacity-80 ${className}`}>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true, stencil: false }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.4}
              maxPolarAngle={Math.PI * 0.6}
              minPolarAngle={Math.PI * 0.4}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
