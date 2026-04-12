import { FiArrowRight, FiTarget, FiShield, FiPercent } from 'react-icons/fi'
import { LuCoins } from 'react-icons/lu'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function ActiveProjectCard({ project }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const cardRef = useRef(null)
  const progress = (project.collected / project.target) * 100

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
           <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#ccff00]">
             Private Offering
           </span>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight mb-2">
          {project.title}
        </h3>
        <p className="text-zinc-400 text-[14px] leading-relaxed font-medium line-clamp-2">{project.description}</p>
      </div>

      {/* Financial Metrics - Success Focused */}
      <div className="flex flex-col gap-2 mb-4 py-3 border-y border-white/5 font-bold">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Target ROI :</span>
          <span className="text-[#ccff00] whitespace-nowrap">{project.roi}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Duration :</span>
          <span className="text-white whitespace-nowrap">{project.duration}</span>
        </div>
      </div>

      {/* Progress Section: Linear Progress Bar */}
      <div className="mt-auto pt-4">
        <div className="flex justify-between items-end mb-2">
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <FiShield className="text-[12px]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Funding Progress</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest leading-none">
                  {project.collected.toLocaleString()} / {project.target.toLocaleString()}
                </span>
              </div>
           </div>
           <div className="text-right pb-0.5">
             <span className="text-2xl font-black text-white tracking-tighter">{isLoaded ? `${Math.round(progress)}%` : '0%'}</span>
           </div>
        </div>
        
        {/* Animated Linear Bar */}
        <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
           <div 
             className="absolute top-0 left-0 h-full bg-[#ccff00] transition-all duration-2000 ease-out"
             style={{ width: isLoaded ? `${progress}%` : '0%' }}
           />
        </div>

        <div className="flex flex-col gap-4">
          <button className="group/btn relative w-full py-5 bg-white text-black rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/20">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Invest Now <LuCoins className="text-[18px] text-black/50 group-hover/btn:rotate-12 group-hover/btn:text-black transition-all duration-500" />
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_50%)] via-[#ccff00]/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          </button>
          
          <Link to={`/project/${project.id}`} className="text-center text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors duration-300">
            Know More
          </Link>
        </div>
      </div>
    </div>
  )
}
