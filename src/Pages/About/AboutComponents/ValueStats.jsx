export default function ValueStats() {
  const stats = [
    { label: "Assets Managmed", value: "$420M+", sub: "Institutional Grade" },
    { label: "Target IRR", value: "15%+", sub: "Projected Annual" },
    { label: "Successful Exits", value: "100%", sub: "Portfolio Proven" }
  ]

  return (
    <section className="py-24 bg-black font-['Poppins'] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Performance Highlights Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div className="max-w-xl">
             <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ccff00] bg-black px-3 py-1 rounded inline-block mb-4">Success Ledger</span>
             <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
               Precision in every<br/>
               <span className="font-semibold text-[#ccff00]">distributed cent.</span>
             </h2>
           </div>
           <p className="max-w-[300px] text-[13px] text-gray-500 leading-relaxed font-medium">
              We leverage real-time data to optimize yield, ensuring our milestone-driven approach remains the gold standard in asset management.
           </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 pt-12 border-t border-white/10">
           {stats.map((stat, i) => (
             <div key={i} className="flex flex-col gap-2">
                <span className="text-5xl md:text-6xl font-black text-white tracking-tighter transition-all duration-500 group-hover:text-[#ccff00]">
                  {stat.value}
                </span>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ccff00] block mb-1">
                     {stat.label}
                   </span>
                   <span className="text-[11px] text-gray-500 font-medium uppercase tracking-widest leading-none">
                     {stat.sub}
                   </span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_50%)] from-white/5 to-transparent pointer-none" />
    </section>
  )
}
