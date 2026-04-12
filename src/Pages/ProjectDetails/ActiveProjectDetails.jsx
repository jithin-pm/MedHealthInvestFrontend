import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FiShield, FiTrendingUp, FiSettings, FiPlay, FiImage } from 'react-icons/fi'
import { activeProjects } from '../../data/projects'
import Navbar from '../Home/HomeComponents/Navbar'
import Footer from '../../Components/Footer'

/* ────────────────────────── Growth Line Chart Component ────────────────────────── */

function InvestmentChart({ investment = 0, roi = "0%", duration = "0" }) {
  const [data, setData] = useState([])
  const [hoveredPoint, setHoveredPoint] = useState(null)
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  // Improved coordinate system for scrollable view
  const width = 1000 
  const height = isMobile ? 400 : 500
  const padding = { 
    top: isMobile ? 50 : 80, 
    right: isMobile ? 30 : 40, 
    bottom: isMobile ? 70 : 80, 
    left: isMobile ? 70 : 70 
  }
  
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  useEffect(() => {
    const inv = parseFloat(investment) || 0
    const monthlyROI = (parseFloat(roi) || 0) / 100
    const months = parseInt(duration) || 0
    const points = []
    
    for (let i = 0; i <= months; i++) {
      const accumulatedProfit = inv * monthlyROI * i
      const totalValue = inv + accumulatedProfit
      points.push({ 
        month: i, 
        profit: accumulatedProfit,
        total: totalValue,
        isMaturity: i === months
      })
    }
    setData(points)
  }, [investment, roi, duration])

  if (data.length === 0) return (
    <div className="w-full h-[400px] bg-[#050804] rounded-[32px] flex items-center justify-center border border-white/5 italic text-zinc-600 font-['Poppins']">
      Synchronizing asset data...
    </div>
  )

  const maxValue = data[data.length - 1]?.total || 0
  const scaleMax = maxValue * 1.15

  const getX = (i) => padding.left + (i / (Math.max(1, data.length - 1))) * chartWidth
  const getY = (val) => padding.top + chartHeight - (val / (scaleMax || 1)) * chartHeight

  const pathD = data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.total)}`).join(' ')
  const areaD = `${pathD} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`

  return (
    <div className="flex flex-col gap-10 w-full font-['Poppins']">
      {/* 💎 Institutional Minimalist Simulator Visual */}
      <div className="w-full bg-[#050804] rounded-[40px] p-6 md:p-14 border border-white/5 relative overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,1)]">
        
        {/* Subtle Depth Layers (No Glow) */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10 md:mb-16 relative z-10">
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3">
               <div className="w-3 h-[2px] bg-[#ccff00]" />
               <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 italic">Med Health Yield Projection</h4>
             </div>
             <div className="flex flex-col">
               <span className="text-5xl md:text-7xl font-black text-white tracking-tightest leading-tight">
                  ₹{(maxValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
               </span>
               <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                  Estimated Maturity Value <span className="w-1 h-1 rounded-full bg-zinc-800" /> <span className="text-zinc-400">ROI: {roi}</span>
               </p>
             </div>
           </div>
           
           <div className="flex flex-col md:items-end gap-6 text-left md:text-right">
              <div className="flex flex-col items-start md:items-end">
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Asset Protocol</span>
                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <FiShield className="text-zinc-400 text-xs" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Secured Fixed-Income</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="relative h-[350px] md:h-[500px] w-full overflow-x-auto overflow-y-hidden scrollbar-hide cursor-crosshair touch-pan-x" onMouseLeave={() => setHoveredPoint(null)}>
          <div className="min-w-[700px] md:min-w-full h-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible select-none" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <defs>
                <linearGradient id="classyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ccff00" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Finer Grid Elements (Institutional Terminal Feel) */}
              {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                <g key={i}>
                  <line x1={padding.left} y1={padding.top + chartHeight * v} x2={padding.left + chartWidth} y2={padding.top + chartHeight * v} stroke="white" strokeOpacity="0.1" strokeDasharray="4,4" />
                  <text x={padding.left - 15} y={padding.top + chartHeight * v + 4} textAnchor="end" fill="white" fillOpacity="0.4" fontSize={isMobile ? "12" : "10"} fontWeight={isMobile ? "bold" : "500"} className="tabular-nums font-medium">₹{(scaleMax * (1-v) / 1000).toFixed(0)}K</text>
                </g>
              ))}

              {/* Base Protection Line */}
              <line x1={padding.left} y1={getY(investment)} x2={padding.left + chartWidth} y2={getY(investment)} stroke="white" strokeOpacity="0.2" strokeWidth="1" />

              {/* Main Area & Line (Clean, No-Glow) */}
              <path d={areaD} fill="url(#classyGradient)" className="transition-all duration-700" />
              <path d={pathD} fill="none" stroke="#ccff00" strokeWidth={isMobile ? "2" : "3"} strokeLinejoin="round" strokeLinecap="round" className="transition-all duration-700" />

              {/* Hover Target Detection */}
              {data.map((point, i) => (
                <rect
                  key={i}
                  x={getX(i) - (chartWidth / (data.length - 1)) / 2}
                  y={padding.top}
                  width={chartWidth / (data.length - 1)}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint({ ...point, x: getX(i), y: getY(point.total) })}
                />
              ))}

              {/* Minimalist Marker & Tooltip */}
              {hoveredPoint && (
                <g className="pointer-events-none transition-all duration-200">
                  <line x1={hoveredPoint.x} y1={padding.top} x2={hoveredPoint.x} y2={padding.top + chartHeight} stroke="white" strokeOpacity="0.2" strokeDasharray="4,4" />
                  
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={isMobile ? "4" : "5"} fill="#ccff00" stroke="#050804" strokeWidth="2" />
                  
                  <foreignObject x={hoveredPoint.x > width * 0.7 ? hoveredPoint.x - 190 : hoveredPoint.x < width * 0.3 ? hoveredPoint.x + 10 : hoveredPoint.x - 90} y={hoveredPoint.y - 140} width="180" height="130">
                    <div className="bg-zinc-900 p-4 rounded-xl border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)] select-none whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif' }}>
                       <div className="flex justify-between items-center mb-2.5">
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Month {hoveredPoint.month}</span>
                          {hoveredPoint.isMaturity && <span className="text-[7px] font-black text-black bg-[#ccff00] px-1.5 py-0.5 rounded-md uppercase">End</span>}
                       </div>
                       <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                             <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Invested</span>
                             <span className="text-[10px] font-bold text-zinc-300 tabular-nums">₹{(investment || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Profit</span>
                             <span className="text-[11px] font-black text-[#ccff00] tabular-nums">+ ₹{(hoveredPoint.profit || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
                             <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Total</span>
                             <span className="text-[14px] font-black text-white tabular-nums">₹{(hoveredPoint.total || 0).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                  </foreignObject>
                </g>
              )}

              {/* X-Axis Timeline (Dynamic splitting to prevent overlap) */}
              <line x1={padding.left} y1={padding.top + chartHeight + 40} x2={padding.left + chartWidth} y2={padding.top + chartHeight + 40} stroke="white" strokeOpacity="0.15" />
              {data.map((point, i) => {
                // Adjust frequency based on how many months are in the project
                const totalMonths = data.length - 1;
                const maxLabels = isMobile ? 6 : 10;
                const step = Math.max(1, Math.ceil(totalMonths / maxLabels));
                
                const isStep = i > 0 && i < totalMonths && i % step === 0;
                const isNearEnd = totalMonths - i < (step / 2); // Avoid crowding the 'End' label
                
                if (i === 0 || i === totalMonths || (isStep && !isNearEnd)) {
                  return (
                    <g key={i}>
                      <circle cx={getX(i)} cy={padding.top + chartHeight + 40} r="2.5" fill="white" fillOpacity="0.4" />
                      <text x={getX(i)} y={padding.top + chartHeight + 65} textAnchor="middle" fill="white" fillOpacity="0.4" fontSize={isMobile ? "11" : "10"} fontWeight={isMobile ? "bold" : "500"} className="uppercase tracking-widest font-medium">
                         {i === 0 ? 'Start' : i === totalMonths ? 'End' : isMobile ? `M${point.month}` : `Month ${point.month}`}
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* 🛡 Business Policy Reference Section (Clean and detailed) */}
      <div className="grid md:grid-cols-2 gap-8 bg-zinc-900/20 p-8 rounded-[32px] border border-white/5">
          <div className="flex gap-6">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <FiShield className="text-[#ccff00] text-xl" />
             </div>
             <div className="flex flex-col gap-1">
                <h6 className="text-[11px] font-black uppercase tracking-widest text-white">No-Loss Interest Guarantee</h6>
                <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">
                   If the project completes earlier than the planned tenure, you will still receive interest for the <strong>full initial duration</strong>. Your ROI is protected by the asset's early-exit premium.
                </p>
             </div>
          </div>
          <div className="flex gap-6">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <FiTrendingUp className="text-[#ccff00] text-xl" />
             </div>
             <div className="flex flex-col gap-1">
                <h6 className="text-[11px] font-black uppercase tracking-widest text-white">Full Capital Refund Policy</h6>
                <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">
                   In the rare event the total fund is not collected within the specified time duration, your full capital amount is <strong>refunded immediately</strong> with no deductions or interest loss.
                </p>
             </div>
          </div>
      </div>
    </div>
  )
}

/* ────────────────────────── Main Details Page ────────────────────────── */

export default function ActiveProjectDetails() {
  const { id } = useParams()
  const project = activeProjects.find((p) => p.id === parseInt(id))
  const [activeMedia, setActiveMedia] = useState(null)
  const [investmentInput, setInvestmentInput] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (project) {
      setActiveMedia(project.gallery[0])
      setTimeout(() => setIsLoaded(true), 100)
    }
    window.scrollTo(0, 0)
  }, [project])

  if (!project) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Project not found</div>

  const progress = (project.collected / project.target) * 100

  return (
    <div className="min-h-screen bg-black font-['Poppins'] text-white selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-20 pt-24 md:pt-32 pb-24">
        
        {/* 📋 Project Title Section (Responsive Padding/Sizes) */}
        <div className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-10">
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest">Active</span>
           </div>
           <div>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3 md:mb-4">
               {project.title}
             </h1>
             <p className="text-sm md:text-xl text-zinc-500 font-medium leading-relaxed max-w-3xl">
               {project.description.split('.')[0]}. Investing in the future of sustainable high-yield assets.
             </p>
           </div>
        </div>

        {/* 🎬 Premium Media Gallery (Hero + Row Thumbnails) */}
        <div className="flex flex-col gap-4 md:gap-6 mb-12 md:mb-16">
          
          {/* Main Hero Media */}
          <div className="relative w-full aspect-video rounded-[32px] md:rounded-[48px] overflow-hidden bg-zinc-900 border border-white/10 group shadow-2xl">
             {activeMedia?.type === 'video' ? (
                <video 
                  src={activeMedia.url} 
                  autoPlay loop muted playsInline 
                  className="w-full h-full object-cover"
                />
             ) : (
                <img 
                  src={activeMedia?.url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  alt={project.title} 
                />
             )}
             <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
             
             {/* Badge or Meta info on image */}
             <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10 flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-[0.3em] mb-1">Live Feed</span>
                   <span className="text-sm md:text-lg font-bold text-white uppercase italic">{project.location}</span>
                </div>
             </div>
          </div>

          {/* Thumbnails row below hero (Touch scrollable) */}
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x touch-pan-x">
             {project.gallery.map((media, i) => (
                <div 
                  key={i}
                  onClick={() => setActiveMedia(media)}
                  className={`relative w-36 md:w-48 h-20 md:h-28 rounded-xl md:rounded-2xl overflow-hidden bg-zinc-900 border-2 cursor-pointer transition-all group/thumb shrink-0 snap-center ${
                    activeMedia?.url === media.url ? 'border-[#ccff00]' : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                  }`}
                >
                   <img src={media.thumbnail} className="w-full h-full object-cover" alt="Thumb" />
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 lg:group-hover/thumb:bg-transparent transition-all">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                         {media.type === 'video' ? <FiPlay className="text-white text-[10px]" /> : <FiImage className="text-white text-[10px]" />}
                      </div>
                      <span className="mt-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white block lg:opacity-0 lg:group-hover/thumb:opacity-100 transition-opacity">
                         {media.type === 'video' ? 'WATCH VIDEO' : 'VIEW IMAGE'}
                      </span>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* 📋 Description and Funding Card Row (Responsive Stack) */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 md:gap-16 mb-16 md:mb-20">
           
           {/* Left: Narrative Section */}
           <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6 order-2 lg:order-1">
              <div className="flex items-center gap-3">
                 <div className="w-8 md:w-12 h-px bg-[#ccff00]" />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Project Narrative</span>
              </div>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed font-medium">
                {project.description}
                <br /><br />
                Our institutional-grade approach ensures that all assets are vetted through a rigorous risk-assessment framework. By bridging the gap between private capital and high-yield infrastructure, we provide our partners with a resilient hedge against market volatility.
              </p>
           </div>

           {/* Right: Institutional Funding Card */}
           <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="bg-zinc-900 rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/10 shadow-3xl flex flex-col gap-6 md:gap-8 transition-all hover:border-white/20">
                 <div className="flex justify-between items-baseline">
                    <div className="flex flex-col">
                       <span className="text-2xl md:text-3xl font-black text-white tracking-tight">₹{project.collected.toLocaleString()}</span>
                       <span className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Raised of ₹{project.target.toLocaleString()}</span>
                    </div>
                    <span className="text-xs md:text-sm font-black text-zinc-400">Target</span>
                 </div>

                 <div className="relative w-full h-3 md:h-4 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#ccff00] transition-all duration-2000"
                      style={{ width: isLoaded ? `${progress}%` : '0%' }}
                    />
                 </div>

                 <button className="group/btn relative w-full py-5 md:py-6 bg-white text-black rounded-2xl text-[12px] md:text-[14px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl">
                   <span className="relative z-10">Invest Now</span>
                   <div className="absolute inset-0 bg-[#ccff00] translate-y-full lg:group-hover/btn:translate-y-0 transition-transform duration-300" />
                 </button>

                 <p className="text-[9px] md:text-[10px] text-zinc-500 text-center font-bold uppercase tracking-widest leading-relaxed">
                   Join {project.investors}+ verified institutional partners in this offering.
                 </p>
              </div>
           </div>
        </div>

        {/* 📊 Integrated Returns Calculator & Growth Chart (Full-Width Row) */}
        <div className="flex flex-col gap-10 md:gap-16 items-start">
           
           {/* Calculator Controls (Full-Width Header) */}
           <div className="w-full flex flex-col md:flex-row justify-between items-end gap-8 bg-zinc-900/40 rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-white/5">
              <div className="flex flex-col gap-3 max-w-xl">
                 <div className="flex items-center gap-2">
                   <FiSettings className="text-[#ccff00] animate-spin-slow" />
                   <h3 className="text-xl md:text-3xl font-bold text-white tracking-tight">Your Payout Simulator</h3>
                 </div>
                 <p className="text-zinc-400 text-sm md:text-base font-normal leading-relaxed">
                   Enter your investment amount below to see exactly how much profit you'll earn each month and your total final payout.
                 </p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto items-center">
                 <div className="flex flex-col gap-2 w-full md:w-64">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Investment Amount (₹)</label>
                    <input 
                      type="number" 
                      value={investmentInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setInvestmentInput('');
                        } else {
                          setInvestmentInput(Math.max(0, parseInt(val) || 0));
                        }
                      }}
                      placeholder="Enter amount"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 md:px-5 py-3 md:py-4 text-center text-lg md:text-xl font-black text-[#ccff00] focus:border-[#ccff00] transition-all outline-none"
                    />
                 </div>
                 <div className="hidden md:flex gap-8 border-l border-white/10 pl-8">
                    <div className="flex flex-col gap-1">
                       <span className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Project ROI</span>
                       <span className="text-white font-black text-lg">{project.roi}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Tenure</span>
                       <span className="text-white font-black text-lg">{project.duration}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* The actual chart component */}
           <InvestmentChart investment={investmentInput} roi={project.roi} duration={project.duration} />
        </div>

        {/* 📋 Monthly Payout Schedule Table (Detailed transparency) */}
        <div className="mt-16 md:mt-24 w-full">
           <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/20">
                 <FiTrendingUp className="text-[#ccff00]" />
              </div>
              <div className="flex flex-col">
                 <h4 className="text-lg md:text-xl font-black uppercase tracking-tight">Payout Schedule</h4>
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic">Fixed Monthly Distributions</span>
              </div>
           </div>

           <div className="overflow-x-auto rounded-[32px] border border-white/5 bg-zinc-900/20 backdrop-blur-3xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Month</th>
                       <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Accrued Interest</th>
                       <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Total Account Value</th>
                    </tr>
                 </thead>
                 <tbody>
                    {[...Array(parseInt(project.duration) + 1)].map((_, i) => {
                       const monthlyROI = (parseFloat(project.roi) || 0) / 100
                       const monthlyInterest = investmentInput * monthlyROI
                       const totalValue = (investmentInput || 0) + (monthlyInterest * i)
                       
                       return (
                          <tr key={i} className={`border-b border-white/5 hover:bg-white/2 transition-colors ${i === parseInt(project.duration) ? 'bg-[#ccff00]/5' : ''}`}>
                             <td className="px-6 md:px-10 py-5 text-xs md:text-sm font-bold text-zinc-400">
                                {i === 0 ? 'Initial Deposit' : `Month ${i.toString().padStart(2, '0')}`}
                             </td>
                             <td className="px-6 md:px-10 py-5 text-xs md:text-sm font-black text-[#ccff00]">
                                {i === 0 ? '₹0.00' : `+ ₹${(monthlyInterest * i).toLocaleString()}`}
                             </td>
                             <td className="px-6 md:px-10 py-5 text-sm md:text-lg font-black text-white text-right font-['Outfit'] tracking-tighter">
                                ₹{totalValue.toLocaleString()}
                             </td>
                          </tr>
                       )
                    })}
                 </tbody>
              </table>
           </div>
           <p className="mt-6 text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center md:justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse" /> Final payout includes full capital redemption upon project maturity.
           </p>
        </div>

      </main>
      <Footer />
    </div>
  )
}
