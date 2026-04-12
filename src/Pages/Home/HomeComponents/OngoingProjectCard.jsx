import { FiArrowRight, FiCalendar, FiShield, FiRefreshCw } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import MaturityDonut from './MaturityDonut'

export default function OngoingProjectCard({ project }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const cardRef = useRef(null)
  const progress = project.completionPercent || 45

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
           <FiShield className="text-[#ccff00] text-[10px]" />
           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500">
             {project.category}
           </span>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight mb-2">
          {project.title}
        </h3>
        <p className="text-zinc-400 text-[14px] leading-relaxed font-medium line-clamp-2">{project.description}</p>
      </div>

      {/* Financial Metrics - Detailed Data Grid */}
      <div className="flex flex-col gap-2 mb-4 py-3 border-y border-white/5 font-bold">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-27 shrink-0">Current Yield :</span>
          <span className="text-[#ccff00] whitespace-nowrap">{project.yield}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Maturity :</span>
          <span className="text-white whitespace-nowrap">{project.maturityDate}</span>
        </div>
      </div>

      {/* Operational Metrics - Split Progress Layout */}
      <div className="mt-auto pt-2 flex items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-1.5 text-zinc-500">
             <FiCalendar className="text-[10px]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Asset Timeline</span>
           </div>
           <div className="flex flex-col">
             <span className="text-2xl font-black text-white tracking-tighter leading-none">{ project.daysRemaining }</span>
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Days to Completion</span>
           </div>
        </div>
        
        {/* Maturity Donut Chart Wrapper */}
        <div className="w-20 h-20">
          <MaturityDonut percentage={isLoaded ? project.completionPercent : 0} isLoaded={isLoaded} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button className="group/btn relative w-full py-5 bg-white text-black rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/20">
          <span className="relative z-10 flex items-center justify-center gap-2">
            View Asset Details <FiArrowRight className="text-black/40 group-hover/btn:translate-x-1 group-hover/btn:text-black transition-all" />
          </span>
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
    </div>
  )
}
