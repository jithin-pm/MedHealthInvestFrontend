import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiArrowRight, FiActivity, FiRefreshCw, FiCheckCircle, FiX } from 'react-icons/fi'
import Logo from '../../../Components/Logo'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* ── Desktop Navbar (Preserved Design) ── */}
      <nav className="fixed top-0 left-0 w-full z-100 px-6 lg:px-20 py-3 transition-all duration-500 font-['Outfit'] hidden md:flex items-center justify-between bg-black/30 backdrop-blur-sm border-b border-white/5 shadow-2xl">
        
        {/* ── Left: Logo & Branding ── */}
        <Logo size="md" />

        {/* ── Center: Minimalist Link Navigation & Dropdown ── */}
        <div className="flex items-center gap-10 lg:gap-14 ml-auto mr-auto px-4 py-2">
          
          <Link to="/" className="text-[15px] font-bold text-white hover:text-gray-300 transition-colors">
            Home
          </Link>
          
          {/* Projects Dropdown Menu */}
          <div className="group relative py-4 cursor-pointer">
             <div className="flex items-center gap-1.5 text-[15px] font-bold text-[#ccff00]">
                Projects <FiChevronDown className="text-lg transition-transform duration-300 group-hover:-rotate-180" />
             </div>
             
             {/* Simple & Short Dropdown Container */}
             <div className="absolute top-[calc(100%+21px)] left-1/2 -translate-x-1/2 w-[550px] bg-zinc-900 border border-white/10 rounded-t-none rounded-b-2xl py-4 px-6 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300  transform origin-top shadow-2xl shadow-top-none group-hover:translate-y-0 translate-y-1 before:absolute before:-top-3 before:left-0 before:w-full before:h-3">
                <div className="flex flex-row items-center justify-between gap-2">
                    {/* Item 1: Active */}
                    <a href="#active" className="flex flex-1 items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 rounded-xl transition-colors group/item">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.5)] group-hover/item:scale-125 transition-transform" />
                       <span className="text-[14px] font-bold text-white tracking-tight">Active</span>
                    </a>
                                      {/* Item 2: Ongoing */}
                    <a href="#ongoing" className="flex flex-1 items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 rounded-xl transition-colors group/item">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.5)] group-hover/item:scale-125 transition-transform" />
                       <span className="text-[14px] font-bold text-white tracking-tight">Ongoing</span>
                    </a>

                    {/* Item 3: Completed */}
                    <a href="#completed" className="flex flex-1 items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 rounded-xl transition-colors group/item">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.5)] group-hover/item:scale-125 transition-transform" />
                       <span className="text-[14px] font-bold text-white tracking-tight">Completed</span>
                    </a>
                </div>
             </div>
          </div>

          <Link to="/about" className="text-[15px] font-bold text-white hover:text-gray-300 transition-colors">
            About Us
          </Link>

        </div>

        {/* ── Right: Auth & Menu ── */}
        <div className="flex items-center gap-4 lg:gap-6 relative z-120">
          <Link to="/auth" className="flex items-center gap-4 bg-white text-black pl-6 pr-2 py-2 rounded-full group">
             <span className="text-[14px] font-bold tracking-tight">Login</span>
             <div className="w-8 h-8 shrink-0 bg-black rounded-full flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <FiArrowRight className="text-white text-sm" />
             </div>
          </Link>
        </div>
      </nav>

      {/* ── Mobile "Floating Island" Navbar ── */}
      <nav 
        className={`md:hidden fixed top-6 left-6 right-6 z-100 transition-all duration-500 ${
          isOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <Logo size="sm" />

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-1 transition-all hover:opacity-70"
          >
            <span className="w-4 h-0.5 bg-white/80" />
            <span className="w-4 h-0.5 bg-white/80" />
            <span className="w-2 h-0.5 bg-[#ccff00]" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Side Drawer (Institutional Premium) ── */}
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 md:hidden ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop Backdrop Blur Overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* The Actual Drawer */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-full bg-zinc-950/95 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header Area */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <Logo size="sm" />
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <FiX className="text-white text-xl" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto pt-10 px-8 pb-10 scrollbar-hide flex flex-col">
            <div className="flex flex-col gap-10">
              
              {/* Main Links */}
              <div className="flex flex-col gap-6">
                {[
                  { name: 'Home', path: '/', detail: 'Return to portfolio' },
                  { name: 'About Us', path: '/about', detail: 'Our core values' },
                ].map((item, i) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    style={{ transitionDelay: `${150 + i * 100}ms` }}
                    className={`group flex items-start transition-all duration-700 ${
                      isOpen ? 'translate-x-0 opacity-100 blur-0' : 'translate-x-10 opacity-0 blur-md'
                    }`}
                  >
                    <span className="text-[10px] font-black text-[#ccff00] mt-4 mr-6 tabular-nums tracking-widest">
                      {i < 9 ? '0' : ''}{i + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-5xl font-bold text-white group-hover:text-[#ccff00] transition-colors tracking-tighter">
                        {item.name.replace(' Us', '')}
                        {item.name.includes(' Us') && <span className="font-bold italic ml-1 text-zinc-800">.</span>}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mt-2 group-hover:text-zinc-400 transition-colors">{item.detail}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Categorized Projects */}
              <div className={`flex flex-col gap-6 transition-all duration-700 delay-[350ms] ${
                isOpen ? 'translate-x-0 opacity-100 blur-0' : 'translate-x-10 opacity-0 blur-md'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-px bg-[#ccff00]/30" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Investments</span>
                </div>
                
                <div className="flex flex-col relative pl-4">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[7px] top-2 bottom-6 w-px bg-white/5" />
                  
                  {[
                    { name: 'Active Projects', href: '#active', icon: <FiActivity /> },
                    { name: 'Ongoing Projects', href: '#ongoing', icon: <FiRefreshCw /> },
                    { name: 'Completed Projects', href: '#completed', icon: <FiCheckCircle /> }
                  ].map((item, i) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      style={{ transitionDelay: `${450 + i * 50}ms` }}
                      className={`group/item flex items-center justify-between py-3 transition-all duration-700 ${
                        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                      }`}
                    >
                      <div className="flex items-center gap-5 relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center relative z-10 group-hover/item:border-[#ccff00] transition-colors">
                           <div className="w-1 h-1 rounded-full bg-[#ccff00] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-bold text-zinc-500 group-hover/item:text-white transition-colors tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#ccff00]/20 group-hover/item:text-[#ccff00] transition-colors mr-2">→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className={`mt-auto pt-16 transition-all duration-700 delay-[650ms] ${
              isOpen ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-10 opacity-0 blur-md'
            }`}>
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between bg-white text-black pl-8 pr-3 py-3 rounded-full group transition-all duration-500 active:scale-[0.98] shadow-2xl"
              >
                <span className="text-[15px] font-black uppercase tracking-widest">Login</span>
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                   <FiArrowRight className="text-white text-xl" />
                </div>
              </Link>
              
              <div className="mt-10 flex flex-col gap-4">
                 <div className="h-px w-10 bg-white/10" />
                 <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em] leading-relaxed">
                   Institutional Grade <br />
                   Portfolios © 2026
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
