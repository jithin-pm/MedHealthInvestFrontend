import React from 'react';
import { Link } from 'react-router-dom';
import AreaChartBackground from '../../Components/AreaChartBackground';
import Auth3DBackground from '../../Components/Auth3DBackground';
import AuthForm from './AuthForm';
import Logo from '../../Components/Logo';

export default function Auth() {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col md:flex-row overflow-hidden relative">
      
      {/* ── Left Side: 3D Visualization ── */}
      <div className="relative w-full md:w-1/2 h-64 md:h-screen items-center justify-center border-b md:border-b-0 md:border-r border-white/10 hidden sm:flex">
        <AreaChartBackground className="opacity-100" />
        
        {/* Vignette for left side */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)'
          }}
        />

        {/* Branding Overlay */}
        <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
          <Logo size="sm" />
        </div>

        {/* Left Side Content Overlay */}
        <div className="absolute z-10 p-12 bottom-64 left-0 text-center md:text-left max-w-2xl hidden md:block">
          <h2 className="text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter mb-6">
            Invest Once,<br/>
            <span className="font-['Playfair_Display'] italic font-normal text-white/70">Earn Every Month.</span>
          </h2>
          <p className="text-white/50 text-sm font-medium leading-relaxed mt-6 w-full pr-10">
            Join thousands of investors earning fixed monthly returns. We provide access to exclusive, vetted institutional-grade projects designed for consistent wealth compounding. Enjoy guaranteed transparent payouts and a completely hassle-free passive income experience managed by industry experts.
          </p>
        </div>
      </div>

      {/* ── Right Side: Authentication Form ── */}
      <div className="relative w-full md:w-1/2 h-screen md:h-screen bg-white flex items-center justify-center p-6 md:p-4">

        {/* Mobile Header / Branding */}
        <div className="absolute top-6 left-6 z-20 md:hidden">
          <Logo size="sm" variant="dark" />
        </div>

        {/* The Form */}
        <div className="w-full max-w-md relative z-10 flex flex-col justify-center items-center h-full pt-10 md:pt-0">
          <AuthForm />
        </div>
      </div>

    </div>
  );
}
