import React, { useEffect, useState } from 'react'
import ActiveProjectCard from '../Home/HomeComponents/ActiveProjectCard'
import Navbar from '../Home/HomeComponents/Navbar'
import { FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Footer from '../../Components/Footer'
import { getAllProjectsApi } from '../../services/allApi'
import { BASE_URL } from '../../services/baseUrl'
import { io } from 'socket.io-client'

export default function ViewAllActiveProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
        const res = await getAllProjectsApi(user?.id)
        if (res.status === 200) {
          const activeOnes = res.data.projects.filter(p => p.status === 'ACTIVE' && p.projectType !== 'Exclusive')
          const mapped = activeOnes.map(p => {
             const images = JSON.parse(p.projectImages || '[]')
             const mainImage = images.length > 0 ? `${BASE_URL}/${images[0].replace(/\\/g, '/')}` : ''
             return {
                ...p,
                title: p.projectName,
                image: mainImage,
                roi: p.roi.toString().includes('%') ? p.roi : `${p.roi}% Monthly`,
                duration: p.duration.toString().includes('Month') ? p.duration : `${p.duration} Months`,
                target: parseFloat(p.targetAmount),
                collected: parseFloat(p.collectedAmount || 0),
                minAmount: parseFloat(p.minInvestmentAmount || 1000)
             }
          })
          setProjects(mapped)
        }
        setLoading(false)
      } catch (err) {
        console.error("Error fetching projects:", err)
        setLoading(false)
      }
    }
    fetchProjects()
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on('project_updated', (data) => {
      console.log('Real-time update received:', data);
      setProjects(prevProjects => {
        // If status changed to anything other than ACTIVE, remove it from active projects view
        if (data.status && data.status !== 'ACTIVE') {
          return prevProjects.filter(p => p.id === data.projectId ? false : true);
        }
        return prevProjects.map(p => 
          p.id === data.projectId 
            ? { ...p, collected: parseFloat(data.collectedAmount) } 
            : p
        );
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
            active<br/>
            <span className="font-['Playfair_Display']  italic font-normal text-[#ccff00] lowercase">projects.</span>
          </h1>
          
          <p className="max-w-xl text-zinc-400 text-sm md:text-base leading-relaxed font-medium tracking-tight">
            A curated selection of high-yield institutional assets currently open for capital allocation. 
            All projects are rigorously audited for stability and performance.
          </p>
        </div>

        {/* Projects Grid with Staggered-feel Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-x-8 md:gap-y-16">
          {loading ? (
            <div className="col-span-full py-20 text-center text-zinc-500 font-medium italic">Loading institutional assets...</div>
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={project.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <ActiveProjectCard project={project} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500 font-medium italic">No active projects available at the moment.</div>
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
