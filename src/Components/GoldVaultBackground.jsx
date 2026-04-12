import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/* ──────────────────── Single Gold Bar ──────────────────── */
function GoldBar({ position, rotation, scale = 1, delay = 0 }) {
  const meshRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Subtle breathing float for each bar individually based on delay
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + delay) * 0.2
      // Extremely slow rotation to catch the light
      meshRef.current.rotation.y = rotation[1] + Math.sin(t * 0.2 + delay) * 0.1
      meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.3 + delay) * 0.05
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      {/* RoundedBox creates a beautiful chamfered edge like a real bullion */}
      <RoundedBox args={[2, 0.4, 4]} radius={0.05} smoothness={4}>
        <meshStandardMaterial
          color="#FFC000" // Deep gold
          metalness={1}
          roughness={0.12} // Very polished but slightly blurred reflection
          envMapIntensity={2.5}
        />
      </RoundedBox>
    </mesh>
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
      <meshBasicMaterial color="#FFC000" transparent opacity={0.2} />
    </instancedMesh>
  )
}

/* ──────────────────────── Main 3D Scene ─────────────────────── */
function Scene() {
  return (
    <>
      {/* City environment provides sharp reflections on the metallic gold */}
      <Environment preset="city" />
      
      <ambientLight intensity={0.2} />
      {/* Warm directional light for gold highlights */}
      <directionalLight position={[10, 20, 15]} intensity={4} color="#ffeaad" castShadow />
      <directionalLight position={[-10, 5, -10]} intensity={1.5} color="#ffffff" />
      
      {/* Cool rim light */}
      <spotLight position={[-15, -10, 10]} angle={0.5} penumbra={1} intensity={2} color="#a0c8ff" />

      {/* Floating arrangement of Gold Bullions */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[0, -0.5, 0]}>
          {/* Bottom Bar */}
          <GoldBar position={[0, -0.5, 0]} rotation={[0, Math.PI / 6, 0]} delay={0} />
          {/* Middle Bar (stacked slightly offset) */}
          <GoldBar position={[0.2, 0, 0]} rotation={[0, Math.PI / 4, 0]} delay={1} />
          {/* Top Bar (Resting across) */}
          <GoldBar position={[-0.3, 0.5, 0.5]} rotation={[0.1, -Math.PI / 8, 0.1]} delay={2} />
        </group>
      </Float>

      <DustParticles />
    </>
  )
}

export default function GoldVaultBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none opacity-90 transition-opacity duration-1000 ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true, stencil: false }}
        dpr={[1, 2]}
      >
        <Scene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 2 - 0.4}
        />
      </Canvas>
    </div>
  )
}
