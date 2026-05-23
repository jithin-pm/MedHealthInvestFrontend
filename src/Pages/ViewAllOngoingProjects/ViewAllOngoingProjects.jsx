import React, { useEffect, useState, useCallback } from 'react'
import OngoingProjectCard from '../Home/HomeComponents/OngoingProjectCard'
import Navbar from '../Home/HomeComponents/Navbar'
import Footer from '../../Components/Footer'
import { getAllProjectsApi } from '../../services/allApi'
import { BASE_URL } from '../../services/baseUrl'
import { io } from 'socket.io-client'

export default function ViewAllOngoingProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
      const res = await getAllProjectsApi(user?.id)
      if (res.status === 200) {
        const ongoingOnes = res.data.projects.filter(p => p.status === 'ONGOING' && p.projectType !== 'Exclusive')
        const mapped = ongoingOnes.map(p => {
          const durationMonths = parseInt(p.duration);
          const totalDurationDays = durationMonths * 30;
          
          let maturityDate;
          if (p.completionDate) {
            maturityDate = new Date(p.completionDate);
          } else {
            const startDate = p.ongoingStartDate ? new Date(p.ongoingStartDate) : new Date(p.updated_at);
            maturityDate = new Date(startDate.getTime() + (totalDurationDays * 24 * 60 * 60 * 1000));
          }
          
          const now = new Date();
          const diffTime = maturityDate - now;
          const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          
          // Format maturity date as DD MMM YYYY
          const maturityDateStr = maturityDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });

           return {
              ...p,
              title: p.projectName,
              category: p.projectCategory,
              yield: p.roi.toString().includes('%') ? p.roi : `${p.roi}% Monthly`,
              maturityDate: maturityDateStr,
              daysRemaining: daysRemaining,
              completionPercent: (parseFloat(p.collectedAmount || 0) / parseFloat(p.targetAmount)) * 100
           }
        })
        setProjects(mapped)
      }
      setLoading(false)
    } catch (err) {
      console.error("Error fetching ongoing projects:", err)
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchProjects()
    window.scrollTo(0, 0)
  }, [fetchProjects])

  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on('project_updated', (data) => {
      console.log('Real-time update received in ongoing:', data);
      // If a project status changes to ONGOING, refresh the list
      if (data.status === 'ONGOING') {
        fetchProjects();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchProjects]);

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
            ongoing<br/>
            <span className="font-['Playfair_Display'] italic font-normal text-[#ccff00] lowercase">projects.</span>
          </h1>
          
          <p className="max-w-xl text-zinc-400 text-sm md:text-base leading-relaxed font-medium tracking-tight">
            Monitor the performance and progress of our active project assets. 
            Real-time tracking of operational milestones and value creation.
          </p>
        </div>

        {/* Projects Grid with Staggered-feel Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-x-8 md:gap-y-16">
          {loading ? (
            <div className="col-span-full py-20 text-center text-zinc-500 font-medium italic">Loading ongoing assets...</div>
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={project.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <OngoingProjectCard project={project} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500 font-medium italic">No ongoing projects found.</div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-32 pt-16 border-t border-white/5 flex flex-col items-center text-center">
           <div className="w-12 h-[2px] bg-[#ccff00] mb-8" />
           <p className="max-w-md text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] leading-loose">
             Institutional Exposure <br/> 
             Refined Project Management <br/>
             © 2026 Med Health Invest
           </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
