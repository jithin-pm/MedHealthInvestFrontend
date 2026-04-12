import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';

function AbstractCore() {
  const coreRef = useRef();
  const wireRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.x = t * 0.1;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * -0.15;
      wireRef.current.rotation.x = t * -0.05;
      wireRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group>
      {/* Inner glowing deformed core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={coreRef} scale={1.2}>
          <icosahedronGeometry args={[1, 2]} />
          <MeshDistortMaterial 
            color="#000000" 
            emissive="#1a1a1a"
            envMapIntensity={1}
            distort={0.3} 
            speed={2} 
            roughness={0.2} 
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Outer elegant wireframe */}
      <mesh ref={wireRef} scale={1.8}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          wireframe 
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Subtle outer geometric structure */}
      <mesh scale={2.4} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
         <torusGeometry args={[1, 0.02, 16, 100]} />
         <meshStandardMaterial color="#84CC16" transparent opacity={0.2} />
      </mesh>
      <mesh scale={2.4} rotation={[-Math.PI / 4, -Math.PI / 4, 0]}>
         <torusGeometry args={[1, 0.02, 16, 100]} />
         <meshStandardMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export default function Auth3DBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 bg-[#0a0a0a] z-0 ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <fog attach="fog" args={['#0a0a0a', 4, 8]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[2, 5, 2]} intensity={1} color="#ffffff" />
        <directionalLight position={[-2, -5, -2]} intensity={2} color="#84CC16" />
        
        {/* Background Particles */}
        <Stars radius={10} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        {/* Central Geometric Structure */}
        <AbstractCore />
      </Canvas>
    </div>
  );
}
