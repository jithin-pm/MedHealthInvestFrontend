import CompletedProjectCard from './CompletedProjectCard'
import { completedProjects } from '../../../data/projects'
import { FiArrowRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export default function CompletedProjects() {
  const navigate = useNavigate()
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
          {completedProjects.map((project) => (
            <CompletedProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Bottom Center Button - Classy Rounded v5 */}
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
      </div>
    </section>
  )
}
