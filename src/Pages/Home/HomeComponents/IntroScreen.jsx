import React, { useEffect, useRef, useMemo, useState } from 'react'
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import Logo from '../../../Components/Logo'

/* ── Galaxy spiral arms of coins ── */
function GalaxyCoins({ count = 60, arms = 3, spread = 12, speed = 0.12 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const groupRef = useRef()

  const coinData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const arm = i % arms
      const progress = (i / count)
      const armAngle = (arm / arms) * Math.PI * 2
      const spinAngle = progress * Math.PI * 6 // how tightly wound the spiral is
      const radius = 2 + progress * spread
      return {
        angle: armAngle + spinAngle,
        radius,
        yOffset: (Math.random() - 0.5) * 1.5,
        selfSpin: Math.random() * Math.PI * 2,
        selfSpinSpeed: (Math.random() - 0.5) * 2,
        scale: (0.06 + progress * 0.14) * (1 - progress * 0.3),
        floatPhase: Math.random() * Math.PI * 2,
      }
    })
  }, [count, arms, spread])

  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return
    groupRef.current.rotation.y += delta * speed
    const t = state.clock.elapsedTime

    coinData.forEach((c, i) => {
      c.selfSpin += c.selfSpinSpeed * delta
      const floatY = c.yOffset + Math.sin(t * 0.6 + c.floatPhase) * 0.5
      const x = Math.cos(c.angle) * c.radius
      const z = Math.sin(c.angle) * c.radius

      dummy.position.set(x, floatY, z)
      dummy.rotation.set(Math.PI / 2, c.angle, c.selfSpin)
      dummy.scale.setScalar(c.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <cylinderGeometry args={[2.5, 2.5, 0.15, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={1}
          roughness={0.05}
          envMapIntensity={3.5}
        />
      </instancedMesh>
    </group>
  )
}


/* ── Hero center coin with slow majestic precession ── */
function Coin() {
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y += delta * 0.6
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.35
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.3
  })

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4, 4, 0.28, 64]} />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={1}
          roughness={0.04}
          envMapIntensity={4}
        />
      </mesh>
    </group>
  )
}



export default function IntroScreen({ onComplete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = (e) => {
      if (isMenuOpen) return
      if (Math.abs(e.deltaY) > 10) {
        onComplete()
      }
    }

    let touchStartY = 0
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const handleTouchMove = (e) => {
      if (isMenuOpen) return
      const touchEndY = e.touches[0].clientY
      if (Math.abs(touchStartY - touchEndY) > 30) {
        onComplete()
      }
    }

    const handleKeyDown = (e) => {
      if (isMenuOpen) return
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Enter'].includes(e.key)) {
        onComplete()
      }
    }

    window.addEventListener('wheel', handleScroll, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 overflow-hidden">
      
      {/* ── Background Grids & Vignette (From Landing Page) ── */}
      <div className="absolute inset-0 z-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 85%)'
        }}
      />

      {/* grid pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-1"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* ── Top Left Logo ── */}
      <div className="absolute top-10 left-10 md:left-20 z-20">
        <Logo />
      </div>

      {/* ── Top Right Menu Button (CRED Expanding Style) ── */}
      <div 
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-10 right-10 md:right-20 z-20 flex border border-white/20 cursor-pointer bg-black/30 backdrop-blur-sm group transition-all duration-700 ease-out hover:bg-black/60"
      >
        {/* Left text section (Expands on hover) */}
        <div className="hidden md:flex items-center border-r border-white/20 relative overflow-hidden transition-all duration-700 ease-out w-[240px] group-hover:w-[380px] h-14">
           
           {/* Hover "CLICK TO EXPAND" (slides in from left) */}
           <div className="absolute left-6 flex items-center gap-3 transition-all duration-700 ease-out -translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
             <FiChevronDown className="text-white text-xs" />
             <span className="text-white text-[10px] font-light tracking-[0.4em] uppercase whitespace-nowrap">Click to Expand</span>
           </div>

           {/* Default Text (centers initially, pushes to right and fades on hover) */}
           <div className="absolute inset-0 flex flex-col justify-center items-center group-hover:items-end group-hover:pr-6 transition-all duration-700 ease-out group-hover:opacity-40">
             <span className="text-white text-[10px] font-light tracking-[0.3em] leading-tight whitespace-nowrap">MEDHEALTH INVEST</span>
             <span className="text-white/60 text-[9px] font-light tracking-[0.3em] leading-tight whitespace-nowrap">PREMIUM PORTFOLIO</span>
           </div>
        </div>

        {/* Hamburger Icon section */}
        <div className="w-14 h-14 flex flex-col justify-center items-center transition-colors">
          <FiMenu className="text-white/80 text-2xl font-light" />
        </div>
      </div>

      {/* ── Foreground Text (CRED Style) ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-5">
        <h1 className="text-5xl md:text-7xl lg:text-[100px] font-['Playfair_Display'] text-white font-black tracking-tight leading-none text-center">
          MedHealth<br />Invest
        </h1>
      </div>

      <div className="w-full h-[70vh] cursor-grab active:cursor-grabbing relative z-10">
        <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
          <React.Suspense fallback={null}>
            {/* Cinematic Lighting */}
            <ambientLight intensity={0.15} />
            <directionalLight position={[15, 10, 10]} intensity={3} color="#ffffff" castShadow />
            <directionalLight position={[-15, -10, -10]} intensity={1.5} color="#b0b0ff" />
            <spotLight position={[0, 15, 5]} angle={0.25} penumbra={1} intensity={4} color="#ffffff" />
            <pointLight position={[0, 0, 8]} intensity={1.5} color="#ffffff" />
            
            {/* Studio Environment - clean abstract reflections */}
            <Environment preset="studio" blur={0.5} />

            {/* Galaxy spiral arms of coins */}
            <GalaxyCoins count={60} arms={3} spread={12} speed={0.12} />

            {/* Hero Center Coin */}
            <Coin />
            
            <ContactShadows 
              position={[0, -4.5, 0]} 
              opacity={0.4} 
              scale={25} 
              blur={3} 
              far={6} 
              color="#888888"
            />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              minPolarAngle={Math.PI / 2.5} 
              maxPolarAngle={Math.PI / 1.5} 
              autoRotate={false}
            />
          </React.Suspense>
        </Canvas>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-80 animate-bounce z-10">
        <span className="text-[#ccff00] text-xs font-bold tracking-[0.4em] uppercase">Scroll to Enter</span>
        <div className="w-6 h-10 border-2 border-[#ccff00]/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-[#ccff00] rounded-full animate-pulse" />
        </div>
      </div>

      {/* ── Full Screen Menu Overlay ── */}
      <div className={`fixed inset-0 z-[100000] bg-black transition-opacity duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Close Button */}
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-10 right-10 md:right-20 z-[100001] w-14 h-14 border border-white/20 flex justify-center items-center cursor-pointer hover:bg-white/10 transition-colors bg-black/30 backdrop-blur-sm"
        >
          <FiX className="text-white text-3xl" />
        </div>

        {/* Menu Content */}
        <div className="w-full h-full flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start pt-32 px-10 md:px-32">
          
          {/* Left Side Navigation Links */}
          <div className="flex flex-col gap-6 md:gap-10 text-center md:text-left z-[100001]">
            {[
              { title: 'ABOUT US', path: '/about' },
              { title: 'ACTIVE PROJECTS', path: '/active-projects' },
              { title: 'ONGOING PROJECTS', path: '/ongoing-projects' },
              { title: 'COMPLETED PROJECTS', path: '/completed-projects' },
            ].map((item) => (
              <Link 
                key={item.title}
                to={item.path}
                className="text-white/60 hover:text-white text-2xl md:text-4xl font-bold tracking-[0.2em] transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Right Side Content (Exact CRED Layout) */}
          <div className="hidden md:flex flex-1 flex-col justify-center pl-10 lg:pl-20 z-[100001] w-full max-w-5xl">
             
             {/* ── Top Large Featured Card ── */}
             <div className="relative w-full h-[35vh] bg-gradient-to-br from-zinc-800 to-zinc-950 mb-10 overflow-hidden flex flex-col justify-center items-center group cursor-pointer border border-white/5 hover:border-white/20 transition-all">
                
                {/* Floating "NEW LAUNCH" Badge */}
                <div className="absolute top-0 left-10 -translate-y-1/2 bg-black border border-white/20 px-3 py-1 z-10">
                  <span className="text-white text-[10px] font-bold tracking-[0.3em]">NEW LAUNCH</span>
                </div>

                <div className="absolute top-10 flex flex-col items-center gap-1 z-10">
                  <span className="text-white text-sm font-bold tracking-[0.4em] uppercase">MedHealth Invest</span>
                  <span className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase">Premium Portfolio</span>
                </div>

                {/* Simulated Sleek Graphic in center */}
                <div className="mt-12 w-3/4 h-32 bg-gradient-to-t from-white/10 to-white/5 rounded-t-2xl border-t border-x border-white/10 shadow-2xl relative">
                  <div className="absolute top-4 left-4">
                    <Logo />
                  </div>
                  <div className="absolute top-6 right-6 font-bold text-white/50 text-xl tracking-widest italic font-['Playfair_Display']">
                    Exclusive
                  </div>
                </div>
                
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-[#ccff00] opacity-0 group-hover:opacity-5 mix-blend-overlay transition-opacity duration-500" />
             </div>

             {/* ── Bottom Grid of 4 Square Cards ── */}
             <div className="grid grid-cols-4 gap-6 w-full">
                {[
                  { title: 'MISSION', color: 'from-emerald-900/40 to-black' },
                  { title: 'VISION', color: 'from-blue-900/40 to-black' },
                  { title: 'OUR TEAM', color: 'from-purple-900/40 to-black' },
                  { title: 'CAREERS', color: 'from-zinc-800/40 to-black' }
                ].map((card, idx) => (
                  <div key={idx} className="flex flex-col gap-4 cursor-pointer group">
                    <div className={`w-full aspect-square bg-gradient-to-br ${card.color} border border-white/5 group-hover:border-white/20 transition-all relative overflow-hidden flex items-center justify-center`}>
                      {/* Simulated 3D Graphic placeholder inside square */}
                      <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(204,255,0,0)] group-hover:shadow-[0_0_30px_rgba(204,255,0,0.1)]" />
                      
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    </div>
                    <span className="text-white/70 group-hover:text-white text-xs font-bold tracking-[0.3em] text-center transition-colors">
                      {card.title}
                    </span>
                  </div>
                ))}
             </div>

          </div>
        </div>
      </div>
    </div>
  )
}
