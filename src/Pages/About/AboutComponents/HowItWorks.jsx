import { HiRocketLaunch } from 'react-icons/hi2'
import { FiArrowRight, FiTarget, FiDollarSign } from 'react-icons/fi'

/* ────────────────────────── Chevron Success Flow ────────────────────────── */

function ChevronLifecycle() {
  const segments = [
    { icon: HiRocketLaunch, label: "Launched", sub: "Phase 1: Capital Raise" },
    { icon: FiTarget, label: "Target Met", sub: "Phase 2: Operational Completion" },
    { icon: FiDollarSign, label: "Payout", sub: "Phase 3: Exit & Yield Distribution", highlight: true }
  ]

  return (
    <div className="relative w-full py-12 mb-8 bg-gray-50/50 rounded-[48px] p-8 md:p-16 border border-gray-100">
      <div className="flex flex-col md:flex-row gap-6 h-auto md:h-20 mb-12">
        {segments.map((seg, i) => {
          const Icon = seg.icon
          return (
            <div 
              key={i} 
              className="group/seg relative flex-1 flex flex-col items-center justify-center p-8 md:p-0 overflow-hidden min-h-[100px] md:min-h-0"
              style={{ clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)' }}
            >
               {/* Background Chevron */}
               <div className="absolute inset-0 bg-black/5 group-hover/seg:bg-black/10 transition-colors" />
               
               {/* Fixed Success Fill (100% on About Us static view) */}
               <div className="absolute inset-y-0 left-0 bg-[#ccff00] w-full shadow-[0_0_20px_rgba(204,255,0,0.3)]" />

               <div className="relative z-10 flex items-center gap-3">
                  <Icon className="text-xl text-black scale-125" />
                  <span className="text-[14px] font-black uppercase tracking-widest text-black">{seg.label}</span>
               </div>
            </div>
          )
        })}
      </div>

      {/* Expanded Descriptive Content */}
      <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
         {segments.map((seg, i) => (
           <div key={i} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                   {seg.label} Stage
                 </span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                {seg.sub}. Our milestone-driven approach ensures predictability for all portfolio stakeholders.
              </p>
           </div>
         ))}
      </div>
    </div>
  )
}

/* ────────────────────────── Main How It Works Section ────────────────────────── */

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white font-['Poppins']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div className="max-w-xl">
             <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-4 block underline decoration-black/10 underline-offset-8">Lifecycle Transparency</span>
             <h2 className="text-4xl md:text-5xl font-light text-black tracking-tight leading-tight">
               How your asset<br/>
               <span className="font-semibold text-black">matures over time.</span>
             </h2>
           </div>
           <button className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-black group hover:gap-4 transition-all duration-300">
             Explore Details <FiArrowRight className="text-gray-400 group-hover:text-black transition-colors" />
           </button>
        </div>

        {/* The Chevron Flow Diagram */}
        <ChevronLifecycle />
      </div>
    </section>
  )
}
