import React from 'react'
import MoneyRainBackground from '../../../Components/MoneyRainBackground'


/* ─────────────────────────── Banner ─────────────────────────── */
export default function Banner() {
  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">

      {/* ── 3D Background Layer ── */}
      <MoneyRainBackground className="z-0" />

      {/* dark radial vignette */}
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

      {/* ── Foreground Content ── */}
      <div className="relative z-10 w-full mx-auto px-8 lg:px-24 flex flex-col items-center mt-8">
        <div className="flex flex-col items-center text-center gap-6 max-w-5xl animate-fade-in-up translate-y-12">


          {/* headline */}
          <h1 className="text-5xl lg:text-[80px] font-black leading-[1.1] tracking-tighter text-white flex flex-col gap-2">
            <span>Reliable Returns.</span>
            <span className="text-3xl lg:text-[60px] font-['Playfair_Display'] italic font-normal normal-case tracking-normal leading-none px-1">Refined Exposure.</span>
            <span className="relative text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 30%, #555555 100%)' }}>
              Guaranteed Security.
            </span>
          </h1>

          {/* subtext */}
          <p className="text-[14px] lg:text-xl text-white/40 max-w-4xl leading-relaxed font-medium tracking-tight">
            Elevate your monthly income through <span className="text-white/70">private, vetted project funding</span>. We provide a transparent framework for fixed monthly yields where your capital remains our primary objective.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <button
              id="banner-cta-start"
              className="group relative px-10 py-4 bg-white text-black text-[11px] font-black tracking-widest uppercase rounded-full overflow-hidden transition-all duration-500 border-2 border-white hover:bg-black hover:text-white"
            >
              <span className="relative z-10 transition-colors duration-500">Start Investing</span>
              <div className="absolute inset-x-0 top-0 h-full w-[200%] bg-white/20 -translate-x-full group-hover:animate-shimmer" />
            </button>

            <button
              id="banner-cta-learn"
              className="group relative px-10 py-4 border-2 border-white text-white text-[11px] font-black tracking-widest uppercase rounded-full overflow-hidden transition-all duration-500 hover:bg-white hover:text-black"
            >
              <span className="relative z-10 transition-colors duration-500">View Projects</span>
              {/* Center Out Fill */}
              <div className="absolute inset-0 bg-white scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>

      {/* border lines */}
      <div className="absolute top-10 left-10 w-40 h-px bg-white/10" />
      <div className="absolute top-10 left-10 w-px h-40 bg-white/10" />
      <div className="absolute bottom-10 right-10 w-40 h-px bg-white/10" />
      <div className="absolute bottom-10 right-10 w-px h-40 bg-white/10" />
    </section>
  )
}
