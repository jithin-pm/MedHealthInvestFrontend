import { FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp, FiExternalLink, FiTarget, FiDollarSign } from 'react-icons/fi'
import { HiRocketLaunch } from 'react-icons/hi2'
import { useState, useEffect, useRef } from 'react'

/* ────────────────────────── Chevron Success Flow ────────────────────────── */

function ChevronLifecycle({ isLoaded, project }) {
  const segments = [
    { icon: HiRocketLaunch, label: "Launched", date: project.startDate },
    { icon: FiTarget, label: "Target Met", date: project.targetDate },
    { icon: FiDollarSign, label: "Payout", date: project.maturityDate, highlight: true }
  ]

  return (
    <div className="relative w-full py-3 mb-2">
      <div className="flex gap-1.5 h-10">
        {segments.map((seg, i) => {
          const Icon = seg.icon
          return (
            <div 
              key={i} 
              className="group/seg relative flex-1 flex flex-col items-center justify-center overflow-hidden"
              style={{ clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)' }}
            >
               {/* Background Chevron */}
               <div className="absolute inset-0 bg-white/5" />
               
               {/* Animated Success Fill */}
               <div 
                 className={`absolute inset-y-0 left-0 bg-[#ccff00] transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(204,255,0,0.5)] ${
                   isLoaded ? 'w-full' : 'w-0'
                 }`}
                 style={{ transitionDelay: `${i * 350}ms` }}
               />

               <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon className={`text-[13px] transition-all duration-500 ${
                    isLoaded ? 'text-black scale-110' : 'text-zinc-500'
                  }`} style={{ transitionDelay: `${i * 350}ms` }} />
                  
                  {/* Small Pulse for Payout */}
                  {seg.highlight && isLoaded && (
                     <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-40" />
                  )}
               </div>
            </div>
          )
        })}
      </div>

      {/* Labels & Dates below the chevrons */}
      <div className="flex justify-between mt-4 px-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex flex-col items-center">
             <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-700 ${
               isLoaded ? 'text-zinc-100 opacity-100' : 'text-zinc-500 opacity-50'
             }`} style={{ transitionDelay: `${i * 350}ms` }}>
               {seg.label}
             </span>
             <span className={`text-[9px] font-bold text-zinc-500 mt-1 transition-all duration-700 ${
               isLoaded ? 'opacity-100' : 'opacity-0'
             }`} style={{ transitionDelay: `${i * 350}ms` }}>
               {seg.date}
             </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────── Completed Project Card Component ────────────────────────── */

export default function CompletedProjectCard({ project }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLoaded(entry.isIntersecting)
      },
      { threshold: 0.15 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  return (
    <div 
      ref={cardRef}
      className="group relative h-full flex flex-col bg-zinc-900 rounded-[32px] p-6 border border-white/5 hover:border-[#ccff00]/50 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
    >
      {/* Horizontal Accent Bar - Pill Style */}
      <div className="absolute top-0 left-10 right-10 h-[6px] rounded-b-full bg-white transition-all duration-500" />

      {/* Project Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
           <FiCheckCircle className="text-[#ccff00] text-[12px]" />
           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#ccff00]">
             Successfully Exited
           </span>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight mb-2">
          {project.title}
        </h3>
        <p className="text-zinc-400 text-[14px] leading-relaxed font-medium line-clamp-2">{project.description}</p>
      </div>

      {/* Financial Metrics - Success Focused */}
      <div className="flex flex-col gap-2 py-3 border-y border-white/5 text-[14px] font-bold text-white">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Final IRR :</span>
          <span className=" text-white px-1.5 py-0.5 rounded text-[14px] uppercase font-black whitespace-nowrap">{project.irr}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Timeline :</span>
          <span className="text-zinc-100 whitespace-nowrap">{project.startDate} — {project.maturityDate}</span>
        </div>
      </div>

      {/* Progress Section: Chevron Success Flow Lifecycle */}
      <div className="mt-auto pt-2 ">
        <div className="flex justify-between items-end mb-2">
           <div className="flex items-center gap-1.5 text-zinc-500">
             <FiShield className="text-[10px]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Asset Success Flow</span>
           </div>
           <div className="text-right">
             <span className="text-lg font-black text-white tracking-tighter">100%</span>
             <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 leading-none">Verified Success</span>
           </div>
        </div>
        
        <ChevronLifecycle isLoaded={isLoaded} project={project} />

        <div className="flex flex-col gap-4">
          <button className="group/btn relative w-full py-5 bg-zinc-800 text-white rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/20">
            <span className="relative z-10 flex items-center justify-center gap-2">
              View Audit Report <FiExternalLink className="text-white/40 group-hover/btn:rotate-45 group-hover/btn:text-[#ccff00] transition-all" />
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#ccff00]/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          </button>
        </div>
      </div>
    </div>
  )
}
