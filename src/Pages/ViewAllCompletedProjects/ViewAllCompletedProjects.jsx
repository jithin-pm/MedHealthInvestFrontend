import React, { useEffect } from 'react'
import CompletedProjectCard from '../Home/HomeComponents/CompletedProjectCard'
import { completedProjects } from '../../data/projects'
import Navbar from '../Home/HomeComponents/Navbar'
import Footer from '../../Components/Footer'

export default function ViewAllCompletedProjects() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="bg-black min-h-screen relative overflow-hidden font-['Poppins']">
      <Navbar />

      {/* Atmospheric Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-[#ccff00]/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 lg:px-20 pt-36 pb-32 relative z-10">
        
        {/* Editorial Header Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[#ccff00]/10 blur-xl rounded-full" />
          </div>

          <h1 className="text-5xl md:text-8xl font-light text-white tracking-tighter leading-[0.9] mb-8 uppercase">
            completed<br/>
            <span className="font-['Playfair_Display'] italic font-normal text-[#ccff00] lowercase">projects.</span>
          </h1>
          
          <p className="max-w-xl text-zinc-400 text-sm md:text-base leading-relaxed font-medium tracking-tight">
            Review our historical track record of distributions and successful exits. 
            A testament to our disciplined approach to institutional capital management.
          </p>
        </div>

        {/* Projects Grid with Staggered-feel Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-x-8 md:gap-y-16">
          {completedProjects.map((project, index) => (
            <div key={project.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <CompletedProjectCard project={project} />
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="mt-32 pt-16 border-t border-white/5 flex flex-col items-center text-center">
           <div className="w-12 h-[2px] bg-[#ccff00] mb-8" />
           <p className="max-w-md text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] leading-loose">
             Institutional Exposure <br/> 
             Refined Portfolio Management <br/>
             © 2026 Med Health Invest
           </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
