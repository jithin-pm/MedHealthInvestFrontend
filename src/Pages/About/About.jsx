import AboutHero from './AboutComponents/AboutHero'
import FeatureGrid from './AboutComponents/FeatureGrid'
import InvestmentMethodology from './AboutComponents/InvestmentMethodology'
import ValueStats from './AboutComponents/ValueStats'
import HowItWorks from './AboutComponents/HowItWorks'
import Navbar from '../Home/HomeComponents/Navbar'
import { FiArrowRight, FiPlay, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Footer from '../../Components/Footer'
import { useState } from 'react'

export default function About() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Page Sections */}
      <AboutHero />
      <ValueStats />
      <FeatureGrid />
      <InvestmentMethodology />
      <HowItWorks />

      {/* Final Call to Action */}
      <section className="py-24 bg-gray-50 font-['Poppins']">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-20 text-center">
           <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-6 block">Ready to grow?</span>
           <h2 className="text-4xl md:text-6xl font-light text-black tracking-tight leading-tight mb-12">
             Start your fixed-income<br/>
             <span className="font-semibold text-black relative">
               journey today.
               <div className="absolute -bottom-2 left-0 w-full h-[6px] bg-[#ccff00]/30 -z-10" />
             </span>
           </h2>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/active-projects" className="group/btn relative h-16 px-12 bg-black text-white rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/20 flex items-center justify-center">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Browse Active Projects <FiArrowRight className="text-white/40 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all underline decoration-[#ccff00] underline-offset-4" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              </Link>
              
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="group flex items-center justify-center gap-4 h-16 px-10 border-3 border-gray-100 rounded-2xl text-[12px] font-black text-gray-400 hover:text-black hover:border-[#ccff00] uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#ccff00] transition-all duration-300">
                  <FiPlay className="text-gray-400 group-hover:text-black transition-colors ml-0.5" />
                </div>
                Watch Intro Video
              </button>
           </div>
        </div>
      </section>

      {/* Video Modal Overlay */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 pointer-events-none">
           <div className="relative w-full max-w-5xl pointer-events-auto">
             <button 
               onClick={() => setIsVideoOpen(false)}
               className="absolute -top-5 -right-9 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-[1001] shadow-xl border border-white/10"
             >
               <FiX className="text-xl" />
             </button>
             <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 relative">
               <iframe 
                 src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                 title="Healthcare Investment Introduction"
                 className="w-full h-full"
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               />
             </div>
           </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
