import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Environment, Box } from '@react-three/drei'
import * as THREE from 'three'

/* ──────────────────── Rising Market Bars ──────────────────── */
function GrowthBars({ count = 40 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Generate grid-like positions for the data bars
  const bars = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
        // Distribute in a circular grid
        const radius = Math.random() * 10 + 2;
        const angle = Math.random() * Math.PI * 2;
        
        temp.push({
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius,
            y: -15 + Math.random() * 5, // start below visible plane
            targetY: Math.random() * 15 - 5, // target height (growth)
            heightOffset: Math.random() * 20, 
            speed: 0.005 + Math.random() * 0.015,
            delay: Math.random() * Math.PI * 2, // phase offset for sine wave
            thickness: 0.5 + Math.random() * 1.5
        })
    }
    return temp
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    bars.forEach((bar, i) => {
      // Oscillate height based on time to simulate market breathing
      const currentHeight = bar.targetY + Math.sin(t * bar.speed * 10 + bar.delay) * 2;
      
      // Slow rotation around the center
      const angleOffset = t * 0.05 + bar.delay;
      const radius = Math.sqrt(bar.x * bar.x + bar.z * bar.z);
      const currentX = Math.cos(angleOffset) * radius;
      const currentZ = Math.sin(angleOffset) * radius;

      dummy.position.set(currentX, currentHeight, currentZ)
      // Make them tall and thin
      dummy.scale.set(bar.thickness, 15, bar.thickness)
      dummy.rotation.set(0, angleOffset, 0) // Face center optionally
      dummy.updateMatrix()
      
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {/* High-end metallic glass material */}
      <meshStandardMaterial
        color="#ffffff"
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={3}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  )
}

/* ──────────────────── Background Data Network ──────────────────── */
function DataNodes({ count = 100 }) {
    const meshRef = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])
  
    const nodes = useMemo(() => {
      const temp = []
      for (let i = 0; i < count; i++) {
          temp.push({
              x: (Math.random() - 0.5) * 40,
              y: (Math.random() - 0.5) * 40,
              z: (Math.random() - 0.5) * 20 - 10,
              scale: 0.1 + Math.random() * 0.3,
          })
      }
      return temp
    }, [count])
  
    useFrame((state) => {
      const t = state.clock.elapsedTime * 0.1
      nodes.forEach((node, i) => {
        dummy.position.set(
            node.x + Math.sin(t + i)*2, 
            node.y + Math.cos(t + i)*2, 
            node.z
        )
        dummy.scale.setScalar(node.scale)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    })
  
    return (
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </instancedMesh>
    )
  }

/* ──────────────────────── main 3D scene ─────────────────────── */
function Scene() {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      {/* Strong directional lighting to catch the edges of the bars */}
      <directionalLight position={[15, 20, 10]} intensity={4} color="#ffffff" castShadow />
      <directionalLight position={[-15, -10, -10]} intensity={2} color="#ffffff" />
      <spotLight position={[0, 30, 0]} angle={0.6} penumbra={1} intensity={3} color="#ffffff" castShadow />

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <GrowthBars count={45} />
      </Float>
      
      <DataNodes count={150} />
    </>
  )
}

export default function AbstractGrowthBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none opacity-90 transition-opacity duration-1000 ${className}`}>
      <Canvas
        camera={{ position: [0, 5, 25], fov: 40 }}
        shadows
        gl={{ antialias: true, alpha: true, stencil: false }}
        dpr={[1, 2]}
      >
        <Scene />
        {/* Very slow cinematic orbit */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 2 - 0.3}
        />
      </Canvas>
    </div>
  )
}
