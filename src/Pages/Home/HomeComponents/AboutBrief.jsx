import React from 'react'
import { FiShield, FiClock, FiTrendingUp, FiCheckCircle } from 'react-icons/fi'

export default function AboutBrief() {
  const policies = [
    {
      icon: <FiTrendingUp />,
      title: "Fund Active Projects",
      description: "Browse our curated platform and allocate your capital to fund 'Active' projects that match your financial goals."
    },
    {
      icon: <FiShield />,
      title: "100% Capital Protection",
      description: "If a project fails to reach its total funding goal within the deadline, your full initial capital is refunded to you immediately—zero risk.",
    },
    {
      icon: <FiClock />,
      title: "Guaranteed Fixed Returns",
      description: "Once successfully funded, the project becomes 'Ongoing'. You secure a fixed monthly interest payout and the return of your full capital when the project duration ends."
    },
    {
      icon: <FiCheckCircle />,
      title: "Lock-in Profit Guarantee",
      description: "If a project is completed ahead of schedule, you still receive the full guaranteed interest for the entire original duration. No lost profits."
    }
  ]

  return (
    <section id="about" className="py-24 bg-black relative font-['Outfit']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-4 block">How It Works</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 tracking-tight mb-6 leading-[1.1]">
            Predictable returns.<br/>
            <span className="font-medium text-[#ccff00]">Zero capital risk.</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-medium">
            We engineer investment opportunities to protect your money. From guaranteed funding thresholds to fixed payout structures, every rule is designed to ensure maximum investor upside without the downside.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
          {policies.map((policy, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-6 group">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#ccff00] text-2xl group-hover:bg-[#ccff00] group-hover:text-black transition-all duration-500 shadow-xl border border-white/5">
                {policy.icon}
              </div>
              <div className="pt-2">
                <h3 className="text-[22px] font-bold text-zinc-100 mb-3 leading-none transition-colors group-hover:text-[#ccff00]">{policy.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-[15px] font-medium pr-4">
                  {policy.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  )
}
