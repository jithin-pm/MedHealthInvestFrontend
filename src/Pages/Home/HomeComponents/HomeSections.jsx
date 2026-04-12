import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Browse Projects',
    desc: 'Explore our curated portfolio of vetted, high-performing investment projects — each with a clearly defined monthly return rate and lock-in period.',
    accent: '#84CC16',
  },
  {
    number: '02',
    title: 'Invest Your Capital',
    desc: 'Choose your project, decide your investment amount, and confirm securely through our platform. Your capital is allocated immediately.',
    accent: '#ffffff',
  },
  {
    number: '03',
    title: 'Earn Every Month',
    desc: 'Sit back and receive your fixed monthly profit directly to your account — every single month, for the duration of your investment term.',
    accent: '#84CC16',
  },
];

const projects = [
  {
    name: 'Agri Harvest Fund',
    category: 'Agriculture',
    monthlyReturn: '2.5%',
    annualReturn: '30%',
    minInvestment: '₹25,000',
    duration: '12 Months',
    slots: 18,
    totalSlots: 50,
    tag: 'Popular',
  },
  {
    name: 'Urban Solar Grid',
    category: 'Renewable Energy',
    monthlyReturn: '2.0%',
    annualReturn: '24%',
    minInvestment: '₹50,000',
    duration: '24 Months',
    slots: 6,
    totalSlots: 30,
    tag: 'Limited Slots',
  },
  {
    name: 'Commercial Leasing Pool',
    category: 'Real Estate',
    monthlyReturn: '1.8%',
    annualReturn: '21.6%',
    minInvestment: '₹1,00,000',
    duration: '18 Months',
    slots: 22,
    totalSlots: 40,
    tag: 'Stable',
  },
];

export default function HomeSections() {
  return (
    <>
      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how-it-works" className="relative bg-black py-28 px-8 lg:px-24 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-20 gap-3">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30">How It Works</span>
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight">
              Simple. Transparent.
              <br />
              <span className="font-['Playfair_Display'] italic font-normal text-white/60">Massively Rewarding.</span>
            </h2>
            <p className="text-white/40 text-sm max-w-xl mt-2 leading-relaxed">
              Our model is built for both new and experienced investors. Three steps is all it takes to start growing your wealth.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

            {steps.map((step, i) => (
              <div key={i}
                className="group relative flex flex-col gap-6 p-8 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-white/15 transition-all duration-500"
              >
                {/* Number */}
                <div className="flex items-center justify-between">
                  <span className="text-6xl font-black text-white/5 font-['Outfit'] select-none">{step.number}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: step.accent }} />
                </div>
                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-black text-white tracking-tight">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── PROJECTS ───────────────── */}
      <section id="projects" className="relative bg-[#060606] py-28 px-8 lg:px-24 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30">Featured Projects</span>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
                Where Your Money <br />
                <span className="font-['Playfair_Display'] italic font-normal text-white/60">Works Hardest.</span>
              </h2>
            </div>
            <button className="hidden md:block self-end px-8 py-3.5 border border-white/15 text-white/60 hover:text-white hover:border-white/40 text-[10px] font-black tracking-widest uppercase rounded-full transition-all duration-300">
              View All Projects
            </button>
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <div key={i}
                className="group relative flex flex-col gap-0 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer"
              >
                {/* Top accent bar */}
                <div className="h-1 w-full bg-linear-to-r from-[#84CC16]/60 via-white/30 to-transparent" />

                <div className="p-7 flex flex-col gap-5">
                  {/* Tag + Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black tracking-widest uppercase text-white/30">{project.category}</span>
                    <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-white/10 text-white/50">
                      {project.tag}
                    </span>
                  </div>

                  {/* Project Name */}
                  <h3 className="text-xl font-black text-white tracking-tight leading-tight">{project.name}</h3>

                  {/* Return highlight */}
                  <div className="flex items-baseline gap-2 py-4 border-y border-white/5">
                    <span className="text-5xl font-black text-white tracking-tighter">{project.monthlyReturn}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">per month</span>
                      <span className="text-xs font-bold text-[#84CC16]">{project.annualReturn} / year</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/25">Min. Investment</span>
                      <span className="text-sm font-black text-white">{project.minInvestment}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/25">Duration</span>
                      <span className="text-sm font-black text-white">{project.duration}</span>
                    </div>
                  </div>

                  {/* Slots availability */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/25">Slots Available</span>
                      <span className="text-[10px] font-black text-white/50">{project.slots} / {project.totalSlots}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#84CC16] to-white/60 rounded-full transition-all duration-700"
                        style={{ width: `${(project.slots / project.totalSlots) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="w-full py-3.5 mt-1 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-white/80 transition-colors duration-300">
                    Invest Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile view all */}
          <div className="flex justify-center mt-10 md:hidden">
            <button className="px-10 py-4 border border-white/15 text-white/60 hover:text-white text-[10px] font-black tracking-widest uppercase rounded-full transition-all duration-300">
              View All Projects
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
