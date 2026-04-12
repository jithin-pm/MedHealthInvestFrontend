import { HiOutlineMagnifyingGlass, HiOutlineFingerPrint, HiOutlineVariable, HiOutlineShieldCheck } from 'react-icons/hi2'

/* ────────────────────────── Methodology Step Card ────────────────────────── */

function MethodologyStep({ number, icon: Icon, title, description, details }) {
  return (
    <div className="group relative p-10 bg-white border border-gray-100 hover:border-black transition-all duration-700">
       {/* Large Watermark Number */}
       <div className="absolute top-4 right-8 text-[80px] font-black text-gray-100 group-hover:text-[#ccff00]/10 transition-colors pointer-events-none select-none">
          {number}
       </div>
       
       <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-black text-2xl mb-8 group-hover:bg-[#ccff00] transition-all duration-500">
             <Icon />
          </div>
          
          <h3 className="text-2xl font-bold text-black tracking-tight mb-4 uppercase">{title}</h3>
          <p className="text-gray-500 text-[15px] leading-relaxed font-medium mb-6">
             {description}
          </p>
          
          {/* Detailed Points */}
          <ul className="space-y-3">
             {details.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] mt-2 group-hover:scale-125 transition-transform" />
                   <span className="text-[12px] font-bold text-gray-400 group-hover:text-black transition-colors">
                      {point}
                   </span>
                </li>
             ))}
          </ul>
       </div>
    </div>
  )
}

/* ────────────────────────── Main Investment Methodology Section ────────────────────────── */

export default function InvestmentMethodology() {
  const steps = [
    {
      number: "01",
      icon: HiOutlineMagnifyingGlass,
      title: "Strategic Sourcing",
      description: "We use proprietary data modeling to identify high-yield fixed-income assets that are currently undervalued or under-utilized.",
      details: [
         "Market Opportunity Mapping",
         "Asset Category Selection",
         "Initial Counterparty Screening"
      ]
    },
    {
      number: "02",
      icon: HiOutlineFingerPrint,
      title: "Rigorous Validation",
      description: "Every potential asset undergoes a comprehensive 120-point due diligence process to verify financial and physical health.",
      details: [
         "Legal Document Verification",
         "Real-world Asset Appraisal",
         "Cashflow Sustainability Audit"
      ]
    },
    {
      number: "03",
      icon: HiOutlineVariable,
      title: "Structuring & Optimization",
      description: "Our legal and financial teams structure the investment for maximum protection, stability, and tax efficiency.",
      details: [
         "Legal Trust Formation",
         "Yield Curve Modeling",
         "Risk Mitigation Layering"
      ]
    },
    {
      number: "04",
      icon: HiOutlineShieldCheck,
      title: "Active Performance",
      description: "Continuous monitoring through the entire asset lifecycle ensures that all performance milestones are met on schedule.",
      details: [
         "Milestone-Driven Tracking",
         "Quarterly Performance Audits",
         "Secondary Market Liquidity"
      ]
    }
  ]

  return (
    <section className="py-24 bg-gray-50 font-['Poppins']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-20">
           <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-4 block underline decoration-black/10 underline-offset-8">Execution Excellence</span>
           <h2 className="text-4xl md:text-5xl font-light text-black tracking-tight leading-tight">
             A methodical approach to<br/>
             <span className="font-semibold text-black">institutional-grade wealth.</span>
           </h2>
        </div>

        {/* 2x2 Detail Grid */}
        <div className="grid md:grid-cols-2 gap-0 border border-gray-100 bg-white">
           {steps.map((step, i) => (
             <MethodologyStep key={i} {...step} />
           ))}
        </div>
      </div>
    </section>
  )
}
