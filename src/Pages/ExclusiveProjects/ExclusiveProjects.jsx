import React, { useEffect, useState, useRef } from 'react'
import Navbar from '../Home/HomeComponents/Navbar'
import Footer from '../../Components/Footer'
import { getAllProjectsApi, saveEnquiryApi } from '../../services/allApi'
import { BASE_URL } from '../../services/baseUrl'
import { LuCrown } from 'react-icons/lu'
import { FiArrowRight, FiArrowLeft, FiX, FiLoader, FiSend } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const ExclusiveProjectCard = ({ project }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const cardRef = useRef(null)
  
  const images = JSON.parse(project.projectImages || '[]')
  const mainImage = images.length > 0 ? `${BASE_URL}/${images[0].replace(/\\/g, '/')}` : ''
  const target = parseFloat(project.targetAmount) || 0
  const collected = parseFloat(project.collectedAmount || 0)
  const progress = target > 0 ? (collected / target) * 100 : 0
  
  const roiText = project.roi.toString().includes('%') ? project.roi : `${project.roi}% Monthly`
  const durationText = project.duration.toString().includes('Month') ? project.duration : `${project.duration} Months`

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLoaded(entry.isIntersecting)
      },
      { threshold: 0.15 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  return (
    <div 
      ref={cardRef}
      className="group relative h-full flex flex-col bg-zinc-900 rounded-[32px] p-6 border border-white/5 hover:border-[#ccff00]/50 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
    >
      {/* Horizontal Accent Bar - Pill Style */}
      <div className="absolute top-0 left-10 right-10 h-[6px] rounded-b-full bg-[#ccff00] transition-all duration-500" />

      {/* Project Header */}
      <div className="mb-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
             <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#ccff00]">
               {project.projectCategory}
             </span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            
            {project.activeDeadline && (
               <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                 
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                   {(() => {
                     const diff = new Date(project.activeDeadline) - new Date();
                     const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                     return days > 0 ? `${days} Days Left` : 'Ending Soon';
                   })()}
                 </span>
               </div>
            )}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight mb-2">
          {project.projectName}
        </h3>
      </div>

      {/* Financial Metrics */}
      <div className="flex flex-col gap-2 mb-4 py-3 border-y border-white/5 font-bold">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Target ROI :</span>
          <span className="text-[#ccff00] whitespace-nowrap">{roiText}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Duration :</span>
          <span className="text-white whitespace-nowrap">{durationText}</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-auto pt-4">
        {/* Animated Linear Bar */}
        <div className="relative w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden mb-3">
           <div 
             className="absolute top-0 left-0 h-full bg-[#ccff00] transition-all duration-[2000ms] ease-out shadow-[0_0_10px_#ccff00]"
             style={{ width: isLoaded ? `${Math.min(progress, 100)}%` : '0%' }}
           />
        </div>

        <div className="flex justify-between items-center mb-6">
           <span className="text-lg md:text-xl font-black text-white tracking-tight">
             ₹{Number(collected).toLocaleString('en-IN')}
           </span>
           <span className="text-xs md:text-sm font-medium text-zinc-500">
             of ₹{Number(target).toLocaleString('en-IN')}
           </span>
        </div>

        <div className="flex flex-col gap-4">
          <Link to={`/project/${project.id}`} className="group/btn relative w-full py-5 bg-[#ccff00] text-black rounded-2xl text-[14px] font-black  uppercase overflow-hidden active:scale-[0.98] transition-all duration-300  flex items-center justify-center gap-2">
             <span className="relative z-10 flex items-center justify-center gap-2">
                Assets <FiArrowRight className="text-[14px] transition-transform duration-500 group-hover/btn:translate-x-1" />
             </span>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_50%)] via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ExclusiveProjects() {
  const [activeProjects, setActiveProjects] = useState([])
  const [ongoingProjects, setOngoingProjects] = useState([])
  const [completedProjects, setCompletedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState({ code: '+91', iso: 'in', name: 'India' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const savedUser = localStorage.getItem('medhealthinvestuser')
        if (!savedUser) {
          navigate('/auth')
          return
        }
        const user = JSON.parse(savedUser)
        if (user.mobile) setPhone(user.mobile)
        if (user.countryCode) {
          setSelectedCountry({ code: user.countryCode, iso: user.countryIso || 'in', name: 'Country' })
        }
        
        const res = await getAllProjectsApi(user.id)
        if (res.status === 200) {
          const exclusive = res.data.projects.filter(p => p.projectType === 'Exclusive')
          setActiveProjects(exclusive.filter(p => p.status === 'ACTIVE'))
          setOngoingProjects(exclusive.filter(p => p.status === 'ONGOING'))
          setCompletedProjects(exclusive.filter(p => p.status === 'COMPLETED'))
        }
      } catch (err) {
        console.error("Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
    window.scrollTo(0, 0)
  }, [navigate])

  const handleRequestAllocationClick = () => {
    const savedUser = JSON.parse(localStorage.getItem('medhealthinvestuser'));
    
    if (!savedUser || !savedUser.id) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to your MedHealth Invest account to request capital allocations.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#ccff00',
        cancelButtonColor: '#1a1a1a',
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel',
        background: '#09090b',
        color: '#ffffff',
        customClass: {
          confirmButton: 'text-black font-bold px-6 py-2.5 rounded-xl',
          cancelButton: 'text-white font-bold px-6 py-2.5 rounded-xl border border-white/10'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/auth');
        }
      });
      return;
    }

    const isPanVerified = savedUser.isPanVerified === 1 || savedUser.isPanVerified === true;
    const isBankVerified = savedUser.isBankVerified === 1 || savedUser.isBankVerified === true;

    if (!isPanVerified || !isBankVerified) {
      Swal.fire({
        title: 'Verification Required',
        text: 'To request capital allocations in exclusive assets, you must complete your Identity (PAN) and Bank Account verification first.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ccff00',
        cancelButtonColor: '#1a1a1a',
        confirmButtonText: 'Verify Now',
        cancelButtonText: 'Later',
        background: '#09090b',
        color: '#ffffff',
        customClass: {
          confirmButton: 'text-black font-bold px-6 py-2.5 rounded-xl',
          cancelButton: 'text-white font-bold px-6 py-2.5 rounded-xl border border-white/10'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile', { state: { openKyc: true } });
        }
      });
      return;
    }

    setIsModalOpen(true);
  };

  const handleSubmitEnquiry = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const savedUser = JSON.parse(localStorage.getItem('medhealthinvestuser'))
      
      const res = await saveEnquiryApi({
        name: savedUser.username || 'Exclusive User',
        email: savedUser.email,
        phone: `${selectedCountry.code} ${phone}`,
        subject: "Interest in More Exclusive Opportunities",
        message: message,
        enquiryType: "Exclusive"
      })

      if (res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Request Sent',
          text: 'Request sent successfully to our private team.',
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#ccff00'
        })
        setIsModalOpen(false)
        setMessage('')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to send request. Please try again.',
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#ccff00'
        })
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again later.',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#ccff00'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const Section = ({ title, projects, emptyText }) => (
    <div className="mb-24">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">{title}</h2>
        <div className="flex-1 h-px bg-black/5" />
        <span className="px-4 py-1 rounded-full bg-zinc-100 text-black text-[10px] font-black uppercase tracking-widest">
          {projects.length} {projects.length === 1 ? 'Asset' : 'Assets'}
        </span>
      </div>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <ExclusiveProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center bg-zinc-50 rounded-[40px] border border-dashed border-black/10 text-center px-6">
          <p className="text-black/30 font-bold uppercase text-[10px] tracking-[0.3em]">{emptyText}</p>
        </div>
      )}
    </div>
  )

  return (
    <main className="bg-white min-h-screen relative font-['Poppins'] selection:bg-black selection:text-[#ccff00]">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-20 pt-32 pb-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20 border-b border-black/5 pb-12">
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-[10px] font-black text-black/40 uppercase tracking-widest hover:text-black transition-colors"
            >
              <FiArrowLeft /> Back to Profile
            </button>
            <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-tight">
              Exclusive <span className="font-serif italic font-light text-zinc-400">Projects</span>
            </h1>
          </div>
        
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Accessing Secure Vault...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Section 
              title="Active Projects" 
              projects={activeProjects} 
              emptyText="No active exclusive assets at this time."
            />
            <Section 
              title="Ongoing Projects" 
              projects={ongoingProjects} 
              emptyText="No ongoing exclusive operations detected."
            />
            <Section 
              title="Completed Projects" 
              projects={completedProjects} 
              emptyText="History is being archived."
            />

            {/* Call to Action Below Sections */}
            <div className="mt-10 py-16 md:py-24 flex flex-col items-center justify-center bg-zinc-50 rounded-[40px] border border-black/5 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-black/5 mb-6 shadow-xl shadow-black/5">
                 <LuCrown className="text-2xl text-black" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-4">Seeking Additional Allocations?</h3>
              <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed max-w-xl mb-10">
                If you are looking to deploy more capital into our exclusive institutional assets, you can request a new allocation and our private team will get in touch with you directly.
              </p>
              <button 
                 onClick={handleRequestAllocationClick}
                 className="group relative flex items-center justify-center gap-4 px-14 py-4 bg-black text-white rounded-full border border-black/10 hover:border-black hover:shadow-2xl transition-all duration-700 w-full md:w-auto"
              >
                 
                 <div className="flex flex-col items-center justify-center ">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest transition-colors">Exclusive Access</span>
                    <span className="text-[13px] font-black uppercase tracking-[0.2em]">
                       Request Allocation
                    </span>
                 </div>
              </button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-20 pt-10 border-t border-black/5 flex flex-col items-center text-center">
           <LuCrown className="text-2xl text-black mb-6" />
           <p className="max-w-md text-black/30 text-[10px] font-black uppercase tracking-[0.3em] leading-loose">
             Med Health Invest Institutional <br/> 
             Tier 1 Security Protocol <br/>
             © 2026 Private Ledger
           </p>
        </div>
      </div>
      <Footer />

      {/* 🔮 Exclusive Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-800/50">
                 <div className="flex items-center gap-3">
                    <LuCrown className="text-[#ccff00] text-xl" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Exclusive Project Request</h2>
                 </div>
                 <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                 >
                    <FiX size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmitEnquiry} className="p-8 space-y-5">

                {/* Pre-filled user credentials (read-only) */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Subject</label>
                    <input
                      type="text"
                      value="Interest in More Exclusive Opportunities"
                      readOnly
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-[#ccff00] outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      {/* Read-only flag + country code */}
                      <div className="flex items-center gap-2 px-3 py-3.5 bg-white/5 border border-white/10 rounded-xl cursor-not-allowed shrink-0">
                        <img
                          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                          alt={selectedCountry.name}
                          className="w-5 h-3.5 object-cover rounded-[2px]"
                        />
                        <span className="text-sm font-bold text-[#ccff00]">{selectedCountry.code}</span>
                      </div>
                      {/* Read-only phone number */}
                      <input
                        type="tel"
                        value={phone}
                        readOnly
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-[#ccff00] outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Your Message</label>
                    <textarea
                      rows="5"
                      placeholder="Describe your investment goals or capital deployment requirements..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-[#ccff00]/50 transition-all placeholder:text-zinc-700 resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full py-5 bg-[#ccff00] text-black rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <FiLoader className="animate-spin text-lg" />
                  ) : (
                    <>Send Request <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>

                <p className="text-[12px] text-zinc-600 text-center font-bold ">
                  Private concierge response within 24 business hours.
                </p>
              </form>
           </div>
        </div>
      )}
    </main>
  )
}
