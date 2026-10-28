import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
   FiShield,
   FiTrendingUp,
   FiSettings,
   FiLoader,
   FiDownload,
   FiPaperclip,
   FiCheckCircle,
   FiClock,
   FiArrowUpRight
} from 'react-icons/fi';
import { HiX } from 'react-icons/hi';
import Navbar from '../Home/HomeComponents/Navbar';
import Footer from '../../Components/Footer';
import {
   getAllProjectsApi,
   createPaymentOrderApi,
   verifyPaymentApi,
   extendSessionApi,
   getUserInvestmentsApi
} from '../../Services/allApi';
import { BASE_URL } from '../../Services/baseUrl';
import Swal from 'sweetalert2';
import InvestmentModal from '../../Components/InvestmentModal';
import { generateInvestmentReceipt } from '../../Utils/generateReceipt';
import { io } from 'socket.io-client';

export default function ActiveProjectDetails() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [project, setProject] = useState(null);
   const [activeMedia, setActiveMedia] = useState(null);
   const [investmentInput, setInvestmentInput] = useState('');
   const [isLoaded, setIsLoaded] = useState(false);
   const [loading, setLoading] = useState(true);
   const [paymentLoading, setPaymentLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // User authentication & reactive state
   const [currentUser, setCurrentUser] = useState(() => {
      try {
         return JSON.parse(localStorage.getItem('medhealthinvestuser'));
      } catch (e) {
         return null;
      }
   });

   useEffect(() => {
      const handleUserUpdate = () => {
         try {
            setCurrentUser(JSON.parse(localStorage.getItem('medhealthinvestuser')));
         } catch (e) {
            setCurrentUser(null);
         }
      };
      window.addEventListener('user_update', handleUserUpdate);
      window.addEventListener('storage', handleUserUpdate);
      return () => {
         window.removeEventListener('user_update', handleUserUpdate);
         window.removeEventListener('storage', handleUserUpdate);
      };
   }, []);

   const isLoggedIn = !!(currentUser && currentUser.id);

   // User investment records & proof preview state
   const [userInvestments, setUserInvestments] = useState([]);
   const [investmentsLoading, setInvestmentsLoading] = useState(false);
   const [isProofModalOpen, setIsProofModalOpen] = useState(false);
   const [selectedProof, setSelectedProof] = useState(null);

   const fetchProject = async () => {
      try {
         const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
         const res = await getAllProjectsApi(user?.id);
         if (res.status === 200) {
            const foundProject = res.data.projects.find(p => p.id == id);
            if (foundProject) {
               const gallery = JSON.parse(foundProject.projectImages || '[]').map(img => {
                  const url = `${BASE_URL}/${img.replace(/\\/g, '/')}`;
                  return {
                     type: img.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
                     url: url,
                     thumbnail: url
                  };
               });

               setProject({
                  ...foundProject,
                  title: foundProject.projectName,
                  target: parseFloat(foundProject.targetAmount),
                  collected: parseFloat(foundProject.collectedAmount || 0),
                  minAmount: parseFloat(foundProject.minInvestmentAmount || 1000),
                  investors: 0,
                  roi: foundProject.roi.toString().includes('%') ? foundProject.roi : `${foundProject.roi}% Monthly`,
                  duration: foundProject.duration.toString().includes('Month') ? foundProject.duration : `${foundProject.duration} Months`,
                  gallery: gallery
               });
               setActiveMedia(gallery[0]);
            }
         }
         setLoading(false);
      } catch (err) {
         console.error("Error fetching project:", err);
         setLoading(false);
      }
   };

   const fetchUserInvestments = async () => {
      try {
         const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
         if (user?.id) {
            setInvestmentsLoading(true);
            const res = await getUserInvestmentsApi(user.id);
            if (res.status === 200 && res.data?.investments) {
               const projectInvs = res.data.investments.filter(inv => String(inv.projectId) === String(id));
               setUserInvestments(projectInvs);
            }
         }
      } catch (err) {
         console.error("Error fetching user investments for project:", err);
      } finally {
         setInvestmentsLoading(false);
      }
   };

   useEffect(() => {
      fetchProject();
      fetchUserInvestments();
      window.scrollTo(0, 0);
   }, [id]);

   useEffect(() => {
      if (project) {
         setTimeout(() => setIsLoaded(true), 100);
      }
   }, [project]);

   // Listen for real-time updates
   useEffect(() => {
      const socket = io(BASE_URL);

      socket.on('project_updated', (data) => {
         console.log('Detail page real-time update:', data);
         if (project && data.projectId === project.id) {
            setProject(prev => ({ 
               ...prev, 
               collected: parseFloat(data.collectedAmount) 
            }));
            fetchUserInvestments();
         }
      });

      return () => {
         socket.disconnect();
      };
   }, [project?.id]);

   const loadRazorpayScript = () => {
      return new Promise((resolve) => {
         if (document.getElementById('razorpay-sdk')) {
            resolve(true);
            return;
         }
         const script = document.createElement('script');
         script.id = 'razorpay-sdk';
         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
         script.onload = () => resolve(true);
         script.onerror = () => resolve(false);
         document.body.appendChild(script);
      });
   };

   const handleInvestNowClick = () => {
      const savedUser = JSON.parse(localStorage.getItem('medhealthinvestuser'));
      if (!savedUser || !savedUser.id) {
         Swal.fire({
            title: 'Login Required',
            text: 'Please log in to your MedHealth Invest account to allocate investment capital.',
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

      setIsModalOpen(true);
   };

   const handleInvestNow = async (amount) => {
      setIsModalOpen(false);
      setPaymentLoading(true);
      try {
         const savedUser = JSON.parse(localStorage.getItem('medhealthinvestuser'));
         if (savedUser && savedUser.accessToken) {
            try {
               const base64Url = savedUser.accessToken.split('.')[1];
               const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
               const payload = JSON.parse(window.atob(base64));
               
               const expTimestamp = payload.exp * 1000;
               const now = Date.now();
               const remainingMins = (expTimestamp - now) / (1000 * 60);

               if (remainingMins < 10) {
                  console.log("Session low (<10 mins), extending...");
                  const extendRes = await extendSessionApi();
                  if (extendRes.status === 200 && extendRes.data.accessToken) {
                     savedUser.accessToken = extendRes.data.accessToken;
                     localStorage.setItem('medhealthinvestuser', JSON.stringify(savedUser));
                  }
               }
            } catch (e) {
               console.error("Session check failed", e);
            }
         }

         const sdkLoaded = await loadRazorpayScript();
         if (!sdkLoaded) throw new Error('Razorpay SDK failed to load.');

         const orderRes = await createPaymentOrderApi({
            amount: parseFloat(amount),
            projectId: project.id,
            userId: savedUser?.id,
         });

         if (!orderRes || orderRes.status !== 200) {
            throw new Error(orderRes?.data?.message || 'Could not create payment order.');
         }

         const { orderId, amount: orderAmount, currency, keyId } = orderRes.data;

         const options = {
            key: keyId,
            amount: orderAmount,
            currency,
            name: 'Med Health Invest',
            description: `Investment in ${project.title}`,
            order_id: orderId,
            prefill: {
               name: savedUser?.username || '',
               email: savedUser?.email || '',
               contact: savedUser?.mobile || '',
            },
            theme: { color: '#000000' },
            handler: async (response) => {
               try {
                  const verifyRes = await verifyPaymentApi({
                     razorpay_order_id: response.razorpay_order_id,
                     razorpay_payment_id: response.razorpay_payment_id,
                     razorpay_signature: response.razorpay_signature,
                     projectId: project.id,
                     userId: savedUser?.id,
                     amount: parseFloat(amount),
                  });

                  if (verifyRes?.data?.success) {
                     fetchUserInvestments();
                     navigate('/payment-success', { 
                        state: { 
                           amount, 
                           paymentId: response.razorpay_payment_id, 
                           projectTitle: project.title, 
                           duration: project.duration 
                        } 
                     });
                  } else {
                     throw new Error('Verification failed.');
                  }
               } catch (err) {
                  Swal.fire({
                     icon: 'error',
                     title: 'Verification Failed',
                     text: err.message || 'Payment received but verification failed.',
                     background: '#09090b',
                     color: '#fff',
                     confirmButtonColor: '#000000'
                  });
               }
            },
            modal: {
               ondismiss: () => setPaymentLoading(false)
            }
         };

         const rzp = new window.Razorpay(options);
         rzp.open();

      } catch (err) {
         console.error('Payment error:', err);
         const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'An unexpected error occurred.';
         Swal.fire({
            icon: 'error',
            title: 'Payment Error',
            text: errorMsg,
            background: '#09090b',
            color: '#fff',
            confirmButtonColor: '#ccff00'
         });
      } finally {
         setPaymentLoading(false);
      }
   };

   const handleDownloadReceipt = (inv) => {
      const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
      generateInvestmentReceipt(
         {
            amount: parseFloat(inv.amount),
            paymentId: inv.paymentId,
            projectTitle: project.title,
            duration: project.duration,
            projectType: project.projectType || 'STANDARD'
         },
         user,
         'download'
      );
   };

   if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-['Poppins']">Loading project data...</div>;
   if (!project) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-['Poppins']">Project not found</div>;

   const progress = (Number(project.collected || 0) / Number(project.target || 1)) * 100 || 0;
   const isExclusive = project.projectType === 'Exclusive';

   // Calculate timeline for ongoing projects
   let daysRemaining = 0;
   let maturityDateStr = '';
   if (project.status === 'ONGOING') {
      const maturityDate = project.completionDate ? new Date(project.completionDate) : 
                          (project.ongoingStartDate ? new Date(new Date(project.ongoingStartDate).getTime() + (parseInt(project.duration) * 30 * 24 * 60 * 60 * 1000)) : null);
      
      if (maturityDate) {
         const now = new Date();
         const diffTime = maturityDate - now;
         daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
         maturityDateStr = maturityDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
         });
      }
   }

   // Format Completed Date
   const completedDateRaw = project.completionDate || project.updated_at || project.completion_date;
   const completedDateStr = completedDateRaw
      ? new Date(completedDateRaw).toLocaleDateString('en-GB', {
         day: '2-digit',
         month: 'short',
         year: 'numeric'
      })
      : 'N/A';

   // Simulator metrics calculations
   const invInputVal = parseFloat(investmentInput) || 0;
   const cleanRoiRate = (parseFloat(project.roi) || 0) / 100;
   const durationMonths = parseInt(project.duration) || 12;

   return (
      <div className="min-h-screen bg-black font-['Poppins'] text-white selection:bg-[#ccff00] selection:text-black">
         <Navbar />

         <main className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12 pt-24 md:pt-32 pb-24">

            {/* Split Layout: Left side images, Right side other sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">

               {/* ── LEFT SIDE: Media & Images Gallery ── */}
               <div className="lg:col-span-7 flex flex-col gap-4">
                  {/* Main Active Media */}
                  <div className="relative w-full aspect-[16/10] rounded-[28px] overflow-hidden bg-zinc-900 border border-white/10 group shadow-2xl">
                     {activeMedia?.type === 'video' ? (
                        <video 
                           src={activeMedia.url} 
                           autoPlay 
                           loop 
                           muted 
                           playsInline 
                           className="w-full h-full object-cover" 
                        />
                     ) : (
                        <img 
                           src={activeMedia?.url} 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                           alt={project.title} 
                           onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop'; }} 
                        />
                     )}
                  </div>

                  {/* Thumbnails */}
                  {project.gallery && project.gallery.length > 1 && (
                     <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x touch-pan-x">
                        {project.gallery.map((media, i) => (
                           <div
                              key={i}
                              onClick={() => setActiveMedia(media)}
                              className={`relative w-24 md:w-28 h-16 md:h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 cursor-pointer transition-all shrink-0 snap-center ${activeMedia?.url === media.url ? 'border-[#ccff00]' : 'border-white/5 opacity-60 hover:opacity-100'}`}
                           >
                              <img 
                                 src={media.thumbnail} 
                                 className="w-full h-full object-cover" 
                                 alt="Thumb" 
                                 onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop'; }} 
                              />
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* ── RIGHT SIDE: Project Information & Actions ── */}
               <div className="lg:col-span-5 flex flex-col gap-5">

                  {/* Header / Badges & Title */}
                  <div className="flex flex-col gap-2">
                     <div className="flex flex-wrap items-center gap-2.5">
                        {/* 1. Primary Status Pill */}
                        {project.status === 'COMPLETED' ? (
                           <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                              <FiCheckCircle className="text-xs text-black" />
                              Completed
                           </span>
                        ) : project.status === 'ONGOING' ? (
                           <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Ongoing
                           </span>
                        ) : (
                           <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                           </span>
                        )}

                        {/* 2. Classy Status Detail Label Pill */}
                        {project.status === 'COMPLETED' && (
                           <span className="px-3 py-1 rounded-full bg-zinc-900/90 border border-white/15 text-zinc-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-inner">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                              <span>Completed On:</span>
                              <span className="text-white font-mono">{completedDateStr}</span>
                           </span>
                        )}

                        {project.status === 'ONGOING' && (
                           <span className="px-3 py-1 rounded-full bg-zinc-900/90 border border-white/15 text-zinc-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-inner">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                              <span>Ends On:</span>
                              <span className="text-white font-mono">{maturityDateStr}</span>
                              <span className="text-zinc-600 font-mono">·</span>
                              <span className="text-amber-400 font-mono">{daysRemaining}d left</span>
                           </span>
                        )}

                        {project.status === 'ACTIVE' && (
                           <span className="px-3 py-1 rounded-full bg-zinc-900/90 border border-white/15 text-zinc-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-inner">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
                              <span>Status:</span>
                              <span className="text-[#ccff00] font-bold">Open for Funding</span>
                           </span>
                        )}

                        {/* 3. Category Pill */}
                        <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[#ccff00] text-[9px] font-bold uppercase tracking-widest">
                           {project.projectCategory}
                        </span>
                     </div>
                     <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                           Project Name
                        </span>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                           {project.title}
                        </h1>
                     </div>
                  </div>

                  {/* Funding Progress Card */}
                  <div className="bg-zinc-900 rounded-[24px] p-6 border border-white/10 shadow-xl flex flex-col gap-5">
                     <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Amount Raised</span>
                           <span className="text-base md:text-lg font-bold text-white">
                              <span className="mr-0.5 font-sans">₹</span>{project.collected.toLocaleString()}
                           </span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Total Fund</span>
                           <span className="text-base md:text-lg font-bold text-white">
                              <span className="mr-0.5 font-sans">₹</span>{project.target.toLocaleString()}
                           </span>
                        </div>
                     </div>

                     <div className="relative w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                           className="absolute top-0 left-0 h-full bg-[#ccff00] transition-all duration-1000" 
                           style={{ width: isLoaded ? `${progress}%` : '0%' }} 
                        />
                     </div>

                     {project.status === 'ACTIVE' ? (
                        <button 
                           onClick={handleInvestNowClick}
                           disabled={paymentLoading}
                           className="group/btn relative w-full py-3.5 bg-white text-black rounded-xl text-xs font-bold tracking-[0.15em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                           <span className="relative z-10 flex items-center justify-center gap-2">
                              {paymentLoading ? <><FiLoader className="animate-spin text-base" /> Processing...</> : 'Invest Now'}
                           </span>
                           {!paymentLoading && (
                              <div className="absolute inset-0 bg-[#ccff00] translate-y-full lg:group-hover/btn:translate-y-0 transition-transform duration-300" />
                           )}
                        </button>
                     ) : project.status === 'COMPLETED' ? (
                        <div className="w-full py-3.5 px-5 bg-gradient-to-r from-zinc-900 via-zinc-800/70 to-zinc-900 border border-white/10 rounded-xl flex items-center justify-between shadow-lg">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ccff00] shrink-0">
                                 <FiCheckCircle className="text-sm" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Project Status</span>
                                 <span className="text-xs font-bold text-white tracking-wide">Successfully Completed</span>
                              </div>
                           </div>
                           <div className="flex flex-col items-end pl-4 border-l border-white/10">
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Completed On</span>
                              <span className="text-xs font-bold text-[#ccff00] font-mono tracking-tight">{completedDateStr}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="w-full py-3.5 px-5 bg-gradient-to-r from-zinc-900 via-zinc-800/70 to-zinc-900 border border-white/10 rounded-xl flex items-center justify-between shadow-lg">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ccff00] shrink-0">
                                 <FiShield className="text-sm" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Project Status</span>
                                 <span className="text-xs font-bold text-white tracking-wide">Fully Funded · Ongoing</span>
                              </div>
                           </div>
                           <div className="flex flex-col items-end pl-4 border-l border-white/10">
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Days Remaining</span>
                              <span className="text-xs font-bold text-[#ccff00] font-mono tracking-tight">{daysRemaining} Days</span>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Project Yield & Tenure Card */}
                  <div className="bg-white rounded-[24px] p-6 flex flex-col gap-4 text-black shadow-xl">
                     <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Project Yield</span>
                           <span className="text-xl md:text-2xl font-bold text-black">{project.roi}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-black/70 uppercase tracking-wider bg-black/5 px-2.5 py-1 rounded-md border border-black/5">
                           {(parseFloat(project.roi) * 12).toFixed(1).replace(/\.0$/, '')}% Yearly ROI
                        </span>
                     </div>

                     <div className="w-full h-px bg-black/10" />

                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Capital Tenure</span>
                           <span className="text-sm font-bold text-black">{project.duration}</span>
                        </div>

                        {project.status === 'ONGOING' && (
                           <>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Days Left</span>
                                 <div className="mt-0.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 font-mono tracking-tight">
                                       <FiClock className="text-xs text-amber-600" />
                                       <span>{daysRemaining} Days</span>
                                    </span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">End Date</span>
                                 <div className="mt-0.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black text-white text-xs font-bold font-mono tracking-tight shadow-sm">
                                       <span>{maturityDateStr}</span>
                                    </span>
                                 </div>
                              </div>
                           </>
                        )}

                        {project.status === 'ACTIVE' && (
                           <>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Funding Status</span>
                                 <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">Active</span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Min. Investment</span>
                                 <div className="mt-0.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black text-white text-xs font-bold font-mono tracking-tight shadow-sm">
                                       <span><span className="font-sans mr-0.5">₹</span>{project.minAmount.toLocaleString('en-IN')}</span>
                                    </span>
                                 </div>
                              </div>
                           </>
                        )}

                        {project.status === 'COMPLETED' && (
                           <>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Settlement</span>
                                 <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">100% Settled</span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Completed On</span>
                                 <div className="mt-0.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black text-white text-xs font-bold font-mono tracking-tight shadow-sm">
                                       <FiCheckCircle className="text-[#ccff00] text-[11px]" />
                                       <span>{completedDateStr}</span>
                                    </span>
                                 </div>
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Full-Width Payout Simulator (Standard Active Projects) */}
            {!isExclusive && project.status === 'ACTIVE' && (() => {
               const displayAmount = invInputVal || 0;
               const monthlyReturn = Math.round(displayAmount * cleanRoiRate);
               const totalProfit = Math.round(monthlyReturn * durationMonths);
               const totalMaturity = displayAmount + totalProfit;
               const cleanRoiText = project.roi.includes('%') ? project.roi : `${project.roi}%`;

               return (
                  <div className="relative mb-16 rounded-[32px] p-6 md:p-10 border border-black/10 bg-white text-black shadow-2xl overflow-hidden">
                     <div className="relative z-10 flex flex-col gap-8">
                        {/* 1. Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-black/10">
                           <div>
                              <div className="flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-black/50">
                                    Interactive Yield Calculator
                                 </span>
                              </div>
                              <h3 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">
                                 Payout Simulator
                              </h3>
                           </div>
                           <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-full border border-black/5 self-start sm:self-auto">
                              <FiTrendingUp className="text-emerald-600 text-sm" />
                              <span className="text-xs font-bold text-black/80 font-mono">
                                 {cleanRoiText} / Month
                              </span>
                           </div>
                        </div>

                        {/* 2. Interactive Input Controls & Quick Chips */}
                        <div className="flex flex-col gap-5 bg-zinc-50 rounded-2xl p-5 md:p-6 border border-black/5">
                           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex flex-col gap-1">
                                 <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider">
                                    Investment Amount (<span className="font-sans">₹</span>)
                                 </label>
                                 <div className="flex items-center gap-2">
                                    <button
                                       type="button"
                                       onClick={() => {
                                          const current = parseFloat(investmentInput) || 0;
                                          const nextVal = Math.max(0, current - 5000);
                                          setInvestmentInput(nextVal === 0 ? '' : nextVal.toString());
                                       }}
                                       className="w-10 h-10 rounded-xl bg-black/5 hover:bg-black/10 active:scale-95 text-black font-black text-lg flex items-center justify-center transition-all cursor-pointer border border-black/5"
                                       title="Decrease ₹5,000"
                                    >
                                       −
                                    </button>
                                    <div className="relative">
                                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base md:text-lg font-bold text-black/40 font-mono">
                                          <span className="font-sans">₹</span>
                                       </span>
                                       <input
                                          type="number"
                                          value={investmentInput}
                                          onChange={(e) => setInvestmentInput(e.target.value)}
                                          placeholder="Enter the amount"
                                          className="w-48 sm:w-56 pl-8 pr-4 py-3 bg-white border border-black/15 rounded-xl text-lg md:text-xl font-extrabold text-black font-mono focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-sm"
                                       />
                                    </div>
                                    <button
                                       type="button"
                                       onClick={() => {
                                          const current = parseFloat(investmentInput) || 0;
                                          const nextVal = current + 5000;
                                          setInvestmentInput(nextVal.toString());
                                       }}
                                       className="w-10 h-10 rounded-xl bg-black/5 hover:bg-black/10 active:scale-95 text-black font-black text-lg flex items-center justify-center transition-all cursor-pointer border border-black/5"
                                       title="Increase ₹5,000"
                                    >
                                       +
                                    </button>
                                 </div>
                              </div>

                              {/* Quick Select Preset Buttons */}
                              <div className="flex flex-col gap-1.5">
                                 <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                                    Quick Presets
                                 </span>
                                 <div className="flex flex-wrap items-center gap-2">
                                    {[10000, 25000, 50000, 100000, 250000].map((preset) => {
                                       const isSelected = invInputVal === preset;
                                       return (
                                          <button
                                             key={preset}
                                             type="button"
                                             onClick={() => setInvestmentInput(preset.toString())}
                                             className={`text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer font-mono border ${
                                                isSelected
                                                   ? 'bg-black text-white border-black shadow-md'
                                                   : 'bg-white hover:bg-black/5 text-black/70 hover:text-black border-black/10'
                                             }`}
                                          >
                                             <span className="font-sans mr-0.5">₹</span>{(preset / 1000).toFixed(0)}k
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                           </div>

                           {/* Slider */}
                           <div className="flex flex-col gap-2 pt-2 border-t border-black/5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-black/40 font-mono">
                                 <span><span className="font-sans">₹</span>5,000</span>
                                 <span className="text-black/40 font-sans uppercase tracking-widest text-[10px]">Drag slider to adjust amount</span>
                                 <span><span className="font-sans">₹</span>5,00,000</span>
                              </div>
                              <input
                                 type="range"
                                 min="0"
                                 max="500000"
                                 step="5000"
                                 value={invInputVal || 0}
                                 onChange={(e) => setInvestmentInput(e.target.value === '0' ? '' : e.target.value)}
                                 className="w-full accent-black cursor-pointer h-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
                              />
                           </div>
                        </div>

                        {/* 3. Metric Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                           {/* 1. Principal Allocation */}
                           <div className="bg-zinc-50 rounded-2xl p-5 md:p-6 border border-black/5 flex flex-col justify-between gap-3 hover:border-black/15 transition-all">
                              <span className="text-[11px] font-bold text-black/50 uppercase tracking-wider">
                                 Principal Investment
                              </span>
                              <div className="text-2xl md:text-3xl font-extrabold text-black font-mono tracking-tight">
                                 {invInputVal > 0 ? (
                                    <><span className="mr-0.5 font-sans">₹</span>{invInputVal.toLocaleString('en-IN')}</>
                                 ) : (
                                    <span className="text-black/30 font-sans text-xl md:text-2xl font-semibold">Enter amount</span>
                                 )}
                              </div>
                              <span className="text-[11px] text-black/50 font-medium flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                 100% Capital Guaranteed
                              </span>
                           </div>

                           {/* 2. Total Profit */}
                           <div className="bg-zinc-50 rounded-2xl p-5 md:p-6 border border-black/5 flex flex-col justify-between gap-3 hover:border-black/15 transition-all">
                              <span className="text-[11px] font-bold text-black/50 uppercase tracking-wider">
                                 Total Net Profit
                              </span>
                              <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
                                 {invInputVal > 0 ? (
                                    <>+<span className="mr-0.5 font-sans">₹</span>{totalProfit.toLocaleString('en-IN')}</>
                                 ) : (
                                    <span className="text-black/30 font-sans text-xl md:text-2xl font-semibold">—</span>
                                 )}
                              </div>
                              <span className="text-[11px] text-black/50 font-medium">
                                 Over {project.duration} tenure ({cleanRoiText} yield)
                              </span>
                           </div>

                           {/* 3. Total Maturity Value (Hero Card) */}
                           <div className="bg-black text-white rounded-2xl p-5 md:p-6 border border-black flex flex-col justify-between gap-3 shadow-xl">
                              <div className="flex items-center justify-between">
                                 <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                                    Net Maturity Value
                                 </span>
                                 <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                                    Total Realized
                                 </span>
                              </div>
                              <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
                                 {invInputVal > 0 ? (
                                    <><span className="mr-0.5 font-sans">₹</span>{totalMaturity.toLocaleString('en-IN')}</>
                                 ) : (
                                    <span className="text-white/40 font-sans text-xl md:text-2xl font-semibold">—</span>
                                 )}
                              </div>
                              <span className="text-[11px] text-white/70 font-medium">
                                 Principal + Total Profit
                              </span>
                           </div>
                        </div>

                        {/* 4. Bottom Action & Guarantee Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                           <div className="flex items-center gap-2 text-xs text-black/60 font-medium">
                              <FiShield className="text-emerald-600 text-base shrink-0" />
                              <span>Fully secured healthcare equipment investment under contract terms.</span>
                           </div>
                           <button
                              type="button"
                              onClick={handleInvestNowClick}
                              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl active:scale-95 cursor-pointer shrink-0"
                           >
                              <span>Proceed to Invest</span>
                              <FiArrowUpRight className="text-base" />
                           </button>
                        </div>
                     </div>
                  </div>
               );
            })()}

            {/* Bottom Policy & Guarantee Badges (Full Width) */}
            <div className="grid md:grid-cols-2 gap-4 bg-zinc-900/30 p-6 md:p-8 rounded-[28px] border border-white/5 mb-16">
               <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                     <FiShield className="text-[#ccff00] text-lg" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                     <h6 className="text-[11px] font-bold uppercase tracking-wider text-white">No-Loss Interest Guarantee</h6>
                     <p className="text-[12px] text-zinc-400 leading-snug">
                        If the project completes earlier than the planned tenure, you will still receive interest for the <strong className="text-zinc-300">full initial duration</strong>.
                     </p>
                  </div>
               </div>
               <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                     <FiTrendingUp className="text-[#ccff00] text-lg" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                     <h6 className="text-[11px] font-bold uppercase tracking-wider text-white">Full Capital Refund Policy</h6>
                     <p className="text-[12px] text-zinc-400 leading-snug">
                        In the rare event the total fund is not collected, your full capital amount is <strong className="text-zinc-300">refunded immediately</strong>.
                     </p>
                  </div>
               </div>
            </div>

            {/* Table: Investment & Settlement Ledger (Only displayed when logged in) */}
            {isLoggedIn && (
               <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                     <div>
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                           <span>Investment & Settlement Ledger</span>
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                           Verified record of your invested capital, expected yields, and settlement distributions
                        </p>
                     </div>

                     <div className="text-xs font-bold text-zinc-400 bg-white/[0.03] border border-white/5 px-4 py-1.5 rounded-xl w-fit">
                        {userInvestments.length} {userInvestments.length === 1 ? 'Investment' : 'Investments'}
                     </div>
                  </div>

                  <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 rounded-[24px] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
                     <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-b border-white/10 bg-white/[0.02]">
                                 <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Investment Date</th>
                                 <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right">Amount Invested</th>
                                 <th className="py-4 px-6 text-[10px] font-black text-[#ccff00] uppercase tracking-widest text-right">Expected Returns</th>
                                 <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Settlement Status</th>
                                 <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Receipt / Proof</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {investmentsLoading ? (
                                 <tr>
                                    <td colSpan="5" className="py-12 text-center text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                       Loading investment records...
                                    </td>
                                 </tr>
                              ) : userInvestments.length === 0 ? (
                                 <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                       <div className="flex flex-col items-center justify-center gap-2">
                                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                                             <FiClock className="text-lg" />
                                          </div>
                                          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">No investments recorded yet</span>
                                          <span className="text-[11px] text-zinc-600 max-w-sm">
                                             Your investment distributions and capital details will appear here once you invest.
                                          </span>
                                       </div>
                                    </td>
                                 </tr>
                              ) : (
                                 userInvestments.map((inv, idx) => {
                                    const dateObj = new Date(inv.created_at);
                                    const amount = parseFloat(inv.amount || 0);
                                    const monthlyROI = (parseFloat(project?.roi) || 0) / 100;
                                    const months = parseInt(project?.duration) || 0;
                                    const totalProfit = amount * monthlyROI * months;
                                    const maturityValue = amount + totalProfit;
                                    const isSettled = inv.paybackStatus === 'PAID';

                                    return (
                                       <tr key={inv.id || idx} className="hover:bg-white/[0.03] transition-colors group">
                                          {/* 1. Date & Time */}
                                          <td className="py-5 px-6">
                                             <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-white tracking-wide">
                                                   {dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[11px] font-mono text-zinc-400 mt-0.5">
                                                   {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </span>
                                             </div>
                                          </td>

                                          {/* 2. Amount Invested */}
                                          <td className="py-5 px-6 text-right">
                                             <span className="text-xs md:text-sm font-bold text-white font-mono">
                                                <span className="mr-0.5 font-sans">₹</span>{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                             </span>
                                          </td>

                                          {/* 3. Expected Returns */}
                                          <td className="py-5 px-6 text-right">
                                             <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-[#ccff00] font-mono">
                                                   +<span className="mr-0.5 font-sans">₹</span>{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                                <span className="text-[10px] text-zinc-400">
                                                   Maturity: <span className="mr-0.5 font-sans">₹</span>{maturityValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                             </div>
                                          </td>

                                          {/* 4. Settlement Status */}
                                          <td className="py-5 px-6 text-center">
                                             {isSettled ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[10px] font-bold uppercase tracking-wider">
                                                   <FiCheckCircle className="text-xs" />
                                                   Settled
                                                </span>
                                             ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                                   <FiClock className="text-xs" />
                                                   Active / Accruing
                                                </span>
                                             )}
                                          </td>

                                          {/* 5. Receipt / Proof */}
                                          <td className="py-5 px-6 text-right">
                                             <div className="flex items-center justify-end gap-2">
                                                <button
                                                   onClick={() => handleDownloadReceipt(inv)}
                                                   className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
                                                   title="Download Investment Receipt"
                                                >
                                                   <FiDownload className="text-xs text-[#ccff00]" />
                                                   <span>Receipt</span>
                                                </button>

                                                {inv.paybackProof && (
                                                   <button
                                                      onClick={() => {
                                                         setSelectedProof(`${BASE_URL}/${inv.paybackProof.replace(/\\/g, '/')}`);
                                                         setIsProofModalOpen(true);
                                                      }}
                                                      className="flex items-center gap-1.5 text-xs font-semibold text-[#ccff00] hover:text-white bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/20 px-3 py-1.5 rounded-lg transition-all"
                                                      title="View Settlement Proof"
                                                   >
                                                      <FiPaperclip className="text-xs" />
                                                      <span>Proof</span>
                                                   </button>
                                                )}
                                             </div>
                                          </td>
                                       </tr>
                                    );
                                 })
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

         </main>
         <Footer />

         {/* Proof Image Modal */}
         {isProofModalOpen && selectedProof && (
            <div 
               className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
               onClick={() => setIsProofModalOpen(false)}
            >
               <div 
                  className="bg-[#121214] border border-white/10 rounded-2xl max-w-2xl w-full p-4 relative shadow-2xl"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-white/10">
                     <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FiPaperclip className="text-[#ccff00]" />
                        Settlement Payment Proof
                     </h3>
                     <button 
                        onClick={() => setIsProofModalOpen(false)} 
                        className="text-zinc-400 hover:text-white transition-colors"
                     >
                        <HiX className="text-lg" />
                     </button>
                  </div>
                  <div className="max-h-[70vh] overflow-auto rounded-xl bg-black flex items-center justify-center p-2">
                     <img 
                        src={selectedProof} 
                        alt="Settlement Proof" 
                        className="max-h-[65vh] w-auto object-contain rounded-lg" 
                     />
                  </div>
                  <div className="mt-3 flex justify-end">
                     <button
                        onClick={() => window.open(selectedProof, '_blank')}
                        className="text-xs font-bold px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                     >
                        Open Full Image
                     </button>
                  </div>
               </div>
            </div>
         )}

         <InvestmentModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleInvestNow}
            projectTitle={project.title}
            projectCategory={project.projectCategory}
            targetAmount={project.target}
            collectedAmount={project.collected}
            minAmount={project.minAmount}
            isExclusive={project.projectType === 'Exclusive'}
         />
      </div>
   );
}
