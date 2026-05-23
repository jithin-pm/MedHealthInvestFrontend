import ActiveProjectCard from './ActiveProjectCard'
import { FiArrowRight, FiInbox } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAllProjectsApi } from '../../../Services/allApi'
import { BASE_URL } from '../../../Services/baseUrl'
import { io } from 'socket.io-client'

export default function ActiveProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])

  // Fetch initial projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
        const res = await getAllProjectsApi(user?.id)
        if (res.status === 200) {
          const activeOnes = res.data.projects.filter(p => p.status === 'ACTIVE' && p.projectType !== 'Exclusive').slice(0, 3)
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
      } catch (err) {
        console.error("Error fetching active projects:", err)
      }
    }
    fetchProjects()
  }, [])

  // Listen for real-time updates
  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on('project_updated', (data) => {
      console.log('Real-time update received:', data);
      setProjects(prevProjects => {
        // If status changed to anything other than ACTIVE, remove it
        if (data.status && data.status !== 'ACTIVE') {
          return prevProjects.filter(p => p.id === data.projectId ? false : true);
        }
        return prevProjects.map(p => 
          p.id === data.projectId 
            ? { ...p, collected: parseFloat(data.collectedAmount) } 
            : p
        )
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <section id="active" className="py-24 bg-black font-['Poppins']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ccff00] bg-zinc-900 border border-white/5 px-3 py-1 rounded inline-block mb-4">Active Projects</span>
            <h2 className="text-4xl md:text-5xl font-light text-zinc-100 tracking-tight leading-tight">
              Discover projects<br/>
              <span className="font-medium text-white italic">open for investment.</span>
            </h2>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ActiveProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 bg-zinc-900/30 rounded-[32px] animate-in fade-in duration-700">
               <FiInbox className="text-4xl text-zinc-700 mb-4" />
               <p className="text-zinc-500 font-medium italic text-sm tracking-tight">No active projects found at the moment.</p>
            </div>
          )}
        </div>
        
        {/* Bottom Center Button - Classy Rounded v5 */}
        {projects.length > 0 && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={() => navigate('/active-projects')}
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
