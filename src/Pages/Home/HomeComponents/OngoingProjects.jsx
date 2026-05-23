import OngoingProjectCard from './OngoingProjectCard'
import { FiArrowRight, FiInbox } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { getAllProjectsApi } from '../../../services/allApi'
import { BASE_URL } from '../../../services/baseUrl'
import { io } from 'socket.io-client'

export default function OngoingProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])

  const fetchProjects = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
      const res = await getAllProjectsApi(user?.id)
      if (res.status === 200) {
        const ongoingOnes = res.data.projects.filter(p => p.status === 'ONGOING' && p.projectType !== 'Exclusive').slice(0, 3)
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
    } catch (err) {
      console.error("Error fetching ongoing projects:", err)
    }
  }, []);

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Listen for real-time updates
  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on('project_updated', (data) => {
      console.log('Real-time update received in home ongoing:', data);
      if (data.status === 'ONGOING') {
        fetchProjects();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchProjects]);

  return (
    <section id="ongoing" className="py-24 bg-black font-['Poppins']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ccff00] bg-zinc-900 border border-white/5 px-3 py-1 rounded inline-block mb-4">Ongoing Projects</span>
            <h2 className="text-4xl md:text-5xl font-light text-zinc-100 tracking-tight leading-tight">
              Projects currently<br/>
              <span className="font-medium text-white italic">in progress.</span>
            </h2>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.length > 0 ? (
            projects.map((project) => (
              <OngoingProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 bg-zinc-900/30 rounded-[32px] animate-in fade-in duration-700">
               <FiInbox className="text-4xl text-zinc-700 mb-4" />
               <p className="text-zinc-500 font-medium italic text-sm tracking-tight">No ongoing projects found at the moment.</p>
            </div>
          )}
        </div>
        
        {/* Bottom Center Button - Classy Rounded v5 */}
        {projects.length > 0 && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={() => navigate('/ongoing-projects')}
              className="group flex items-center gap-3 px-10 py-4 border-2 border-[#ccff00]/30 rounded-full text-sm font-sans text-zinc-400 hover:text-white hover:border-[#ccff00] hover:bg-[#ccff00]/5 transition-all duration-500"
            >
              <span className="font-medium transition-colors">
                view <span className="text-[#ccff00]">more</span>
              </span>
              <FiArrowRight className="text-zinc-500 group-hover:text-[#ccff00] group-hover:translate-x-1 transition-all duration-500" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
