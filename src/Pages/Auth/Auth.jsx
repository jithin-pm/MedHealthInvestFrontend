import React from 'react';
import { Link } from 'react-router-dom';
import AreaChartBackground from '../../Components/AreaChartBackground';
import Auth3DBackground from '../../Components/Auth3DBackground';
import AuthForm from './AuthForm';
import Logo from '../../Components/Logo';

export default function Auth() {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col md:flex-row overflow-hidden relative">
      
      {/* ── Background Visualization (Full screen on mobile, left half on desktop) ── */}
      <div className="absolute inset-0 md:relative md:w-1/2 md:h-screen flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 z-0 md:z-10">
        <AreaChartBackground className="opacity-100" />
        
        {/* Vignette for left side */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)'
          }}
        />

        {/* Branding Overlay (Desktop only) */}
        <div className="absolute top-12 left-12 z-20 hidden md:block">
          <Logo size="sm" />
        </div>

        {/* Content Overlay (Desktop only) */}
        <div className="absolute z-10 p-12 bottom-64 left-0 text-left max-w-2xl hidden md:block">
          <h2 className="text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter mb-6">
            Invest Once,<br/>
            <span className="font-['Playfair_Display'] italic font-normal text-white/70">Earn Every Month.</span>
          </h2>
          <p className="text-white/50 text-sm font-medium leading-relaxed mt-6 w-full pr-10">
            Join thousands of investors earning fixed monthly returns. We provide access to exclusive, vetted institutional-grade projects designed for consistent wealth compounding. Enjoy guaranteed transparent payouts and a completely hassle-free passive income experience managed by industry experts.
          </p>
        </div>
      </div>

      {/* ── Authentication Form Side (Centered modal on mobile, right half on desktop) ── */}
      <div className="relative w-full md:w-1/2 min-h-screen bg-transparent md:bg-white flex items-center justify-center p-6 md:p-10 z-10">

        {/* Mobile Header / Branding */}
        <div className="absolute top-6 left-6 z-20 md:hidden">
          <Logo size="sm" variant="light" />
        </div>

        {/* The Form (Modal appearance on mobile) */}
        <div className="w-full max-w-md relative z-10 flex flex-col justify-center items-center">
          <AuthForm />
        </div>
      </div>

    </div>
  );
}
