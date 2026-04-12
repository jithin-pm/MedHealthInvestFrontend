import { FiArrowDown } from 'react-icons/fi'

export default function AboutHero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-white font-['Poppins']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Breadcrumb / Label */}
        <div className="flex items-center gap-3 mb-8">
           <div className="w-8 h-px bg-[#ccff00]" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Our Story</span>
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl">
           <h1 className="text-5xl md:text-7xl font-light text-black tracking-tight leading-[1.1] mb-12">
             Bridging the gap between<br/>
             <span className="font-medium">private capital</span> and<br/>
             <span className="font-semibold text-black relative">
               stable growth.
               <div className="absolute -bottom-2 left-0 w-full h-[6px] bg-[#ccff00]/30 -z-10" />
             </span>
           </h1>
           
           <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl font-medium mb-16">
              We empower investors with curated, high-yield fixed-income assets that were once reserved for institutional giants. Transparency, security, and consistent returns are the bedrock of our platform.
           </p>
        </div>

        {/* Scroll Indicator */}
        <div className="flex items-center gap-4 group/scroll cursor-pointer animate-bounce">
           <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover/scroll:border-[#ccff00] group-hover/scroll:bg-[#ccff00] transition-all duration-300">
              <FiArrowDown className="text-gray-400 group-hover/scroll:text-black transition-colors" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/scroll:text-black transition-colors">Discover Our Mission</span>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-linear-to-l from-gray-50/50 to-transparent -z-10" />
    </section>
  )
}
