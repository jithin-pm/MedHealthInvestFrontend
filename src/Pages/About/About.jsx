import AboutHero from './AboutComponents/AboutHero'
import FeatureGrid from './AboutComponents/FeatureGrid'
import InvestmentMethodology from './AboutComponents/InvestmentMethodology'
import ValueStats from './AboutComponents/ValueStats'
import HowItWorks from './AboutComponents/HowItWorks'
import Navbar from '../Home/HomeComponents/Navbar'
import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Footer from '../../Components/Footer'

export default function About() {
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
              <Link to="/" className="group/btn relative px-12 py-5 bg-black text-white rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/20">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Browse Active Projects <FiArrowRight className="text-white/40 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all underline decoration-[#ccff00] underline-offset-4" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              </Link>
              
              <button className="text-[12px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors duration-300 border-b-2 border-transparent hover:border-[#ccff00] pb-1">
                Contact Advisory Team
              </button>
           </div>
        </div>
      </section>


      <Footer />
    </main>
  )
}
