import CompletedProjectCard from './CompletedProjectCard'
import { FiArrowRight, FiInbox } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAllProjectsApi } from '../../../services/allApi'
import { BASE_URL } from '../../../services/baseUrl'

export default function CompletedProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
        const res = await getAllProjectsApi(user?.id)
        if (res.status === 200) {
          const completedOnes = res.data.projects.filter(p => p.status === 'COMPLETED' && p.projectType !== 'Exclusive').slice(0, 3)
          const mapped = completedOnes.map(p => {
             const images = JSON.parse(p.projectImages || '[]')
             const mainImage = images.length > 0 ? `${BASE_URL}/${images[0].replace(/\\/g, '/')}` : ''
             return {
                ...p,
                title: p.projectName,
                category: p.projectCategory,
                image: mainImage,
                totalReturn: p.roi.toString().includes('%') ? p.roi : `${p.roi}%`,
                duration: `${p.duration} Months`,
                finalValuation: `₹${(parseFloat(p.targetAmount) * 1.2).toLocaleString()}` // Placeholder
             }
          })
          setProjects(mapped)
        }
      } catch (err) {
        console.error("Error fetching completed projects:", err)
      }
    }
    fetchProjects()
  }, [])

  return (
    <section id="completed" className="py-24 bg-black font-['Poppins']">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ccff00] bg-zinc-900 border border-white/5 px-3 py-1 rounded inline-block mb-4">Completed Projects</span>
            <h2 className="text-4xl md:text-5xl font-light text-zinc-100 tracking-tight leading-tight">
              A track record of<br/>
              <span className="font-medium text-white italic">proven distributions.</span>
            </h2>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.length > 0 ? (
            projects.map((project) => (
              <CompletedProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 bg-zinc-900/30 rounded-[32px] animate-in fade-in duration-700">
               <FiInbox className="text-4xl text-zinc-700 mb-4" />
               <p className="text-zinc-500 font-medium italic text-sm tracking-tight">No completed projects found at the moment.</p>
            </div>
          )}
        </div>

        {/* Bottom Center Button - Classy Rounded v5 */}
        {projects.length > 0 && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={() => navigate('/completed-projects')}
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
