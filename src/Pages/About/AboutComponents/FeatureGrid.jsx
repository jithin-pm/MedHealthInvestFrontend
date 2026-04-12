import { HiShieldCheck, HiOutlineCubeTransparent, HiOutlinePresentationChartLine } from 'react-icons/hi2'

/* ────────────────────────── Feature Block Layout ────────────────────────── */

function FeatureBlock({ icon: Icon, title, description, badge }) {
  return (
    <div className="group relative p-8 bg-gray-50/50 rounded-[40px] border border-gray-100 hover:border-[#ccff00] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(204,255,0,0.1)]">
       <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-[#ccff00] text-2xl group-hover:bg-[#ccff00] group-hover:text-black transition-all duration-300">
             <Icon />
          </div>
       </div>
       
       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccff00] bg-black px-2 py-0.5 rounded mb-4 inline-block">
          {badge}
       </span>
       
       <h3 className="text-2xl font-bold text-black tracking-tight mb-4">{title}</h3>
       <p className="text-gray-500 text-[14px] leading-relaxed font-medium">{description}</p>

       {/* Link Overlay - Subtle Decor */}
       <div className="absolute bottom-8 right-8 w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black group-hover:bg-black transition-all">
          <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#ccff00]" />
       </div>
    </div>
  )
}

/* ────────────────────────── Main Feature Grid Section ────────────────────────── */

export default function FeatureGrid() {
  return (
    <section className="py-24 bg-white font-['Poppins']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20">
        
        {/* Section Header */}
        <div className="text-center md:text-left mb-16">
           <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-4 block underline decoration-black/10 underline-offset-8">Platform Pillars</span>
           <h2 className="text-4xl md:text-5xl font-light text-black tracking-tight leading-tight">
             Built on a foundation<br/>
             <span className="font-medium">of radical transparency.</span>
           </h2>
        </div>

        {/* Triple Column Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
           <FeatureBlock 
             badge="Institutional Grade"
             icon={HiShieldCheck} 
             title="Triple-Secure Assets" 
             description="Each project undergoes rigorous multi-layer auditing and legal verification to ensure capital protection at every stage of the lifecycle."
           />
           <FeatureBlock 
             badge="Unrivaled Visibility"
             icon={HiOutlineCubeTransparent} 
             title="On-Chain Clarity" 
             description="Track your performance with 100% visibility. From development phase milestones to monthly payout schedules, your dashboard remains your source of truth."
           />
           <FeatureBlock 
             badge="Consistent Yield"
             icon={HiOutlinePresentationChartLine} 
             title="Optimized IRR" 
             description="We leverage proprietary asset modeling to deliver market-leading internal rates of return (IRR) with a focus on predictability."
           />
        </div>
      </div>
    </section>
  )
}
