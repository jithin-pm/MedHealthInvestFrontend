import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShield, FiTrendingUp, FiSettings, FiPlay, FiImage, FiLoader } from 'react-icons/fi';
import Navbar from '../Home/HomeComponents/Navbar';
import Footer from '../../Components/Footer';
import { getAllProjectsApi, createPaymentOrderApi, verifyPaymentApi, extendSessionApi } from '../../Services/allApi';
import { BASE_URL } from '../../Services/baseUrl';
import Swal from 'sweetalert2';
import InvestmentModal from '../../Components/InvestmentModal';
import { io } from 'socket.io-client';

/* ────────────────────────── Profit Calculator Component ────────────────────────── */

function ProfitCalculator({ investment = 0, roi = "0%", duration = "0" }) {
   const inv = parseFloat(investment) || 0;
   const monthlyROI = (parseFloat(roi) || 0) / 100;
   const months = parseInt(duration) || 0;
   
   const accumulatedProfit = inv * monthlyROI * months;
   const totalValue = inv + accumulatedProfit;

   return (
      <div className="flex flex-col gap-10 w-full font-['Poppins']">
         
         {inv > 0 ? (
            <div className="w-full bg-[#050804] rounded-[40px] p-8 md:p-14 border border-white/5 relative overflow-hidden group shadow-[0_0_100px_rgba(204,255,0,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-10">
               <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#ccff00]/20 to-transparent" />

               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500">Principal</span>
                  <span className="text-2xl md:text-3xl font-black text-white">₹{inv.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
               </div>
               
               <div className="hidden md:block w-px h-16 bg-white/10" />
               <div className="md:hidden w-full h-px bg-white/10" />
               
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#ccff00]">Total Profit</span>
                  <span className="text-2xl md:text-3xl font-black text-[#ccff00]">
                     + ₹{accumulatedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
               </div>

               <div className="hidden md:block w-px h-16 bg-white/10" />
               <div className="md:hidden w-full h-px bg-white/10" />
               
               <div className="flex flex-col gap-2 md:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500">Maturity Value</span>
                  <span className="text-2xl md:text-3xl font-black text-white">
                     ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
               </div>
            </div>
         ) : (
            <div className="w-full bg-[#0c0c0c] rounded-[40px] p-10 border border-white/5 text-center flex items-center justify-center">
               <span className="text-zinc-600 font-medium italic text-sm">Enter an investment amount above to calculate your returns.</span>
            </div>
         )}

         <div className="grid md:grid-cols-2 gap-8 bg-zinc-900/20 p-8 rounded-[32px] border border-white/5">
            <div className="flex gap-6">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <FiShield className="text-[#ccff00] text-xl" />
               </div>
               <div className="flex flex-col gap-1">
                  <h6 className="text-[11px] font-black uppercase tracking-widest text-white">No-Loss Interest Guarantee</h6>
                  <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">
                     If the project completes earlier than the planned tenure, you will still receive interest for the <strong>full initial duration</strong>.
                  </p>
               </div>
            </div>
            <div className="flex gap-6">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <FiTrendingUp className="text-[#ccff00] text-xl" />
               </div>
               <div className="flex flex-col gap-1">
                  <h6 className="text-[11px] font-black uppercase tracking-widest text-white">Full Capital Refund Policy</h6>
                  <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">
                     In the rare event the total fund is not collected, your full capital amount is <strong>refunded immediately</strong>.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

/* ────────────────────────── Main Details Page ────────────────────────── */

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

   useEffect(() => {
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
      fetchProject();
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

      const isPanVerified = savedUser.isPanVerified === 1 || savedUser.isPanVerified === true;
      const isBankVerified = savedUser.isBankVerified === 1 || savedUser.isBankVerified === true;

      if (!isPanVerified || !isBankVerified) {
         Swal.fire({
            title: 'Verification Required',
            text: 'To secure your investments and automate payouts, you must complete your Identity (PAN) and Bank Account verification first.',
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

   const handleInvestNow = async (amount) => {
      setIsModalOpen(false);
      setPaymentLoading(true);
      try {
         // Check if session needs extension (less than 10 mins left)
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

   if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-['Poppins']">Loading project data...</div>;
   if (!project) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-['Poppins']">Project not found</div>;

   const progress = (Number(project.collected || 0) / Number(project.target || 1)) * 100 || 0;

   // Calculate timeline for ongoing projects
   let daysRemaining = 0;
   let maturityDateStr = 'Not Available';
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

   return (
      <div className="min-h-screen bg-black font-['Poppins'] text-white selection:bg-[#ccff00] selection:text-black">
         <Navbar />

         <main className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-20 pt-24 md:pt-32 pb-24">

            <div className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-10">
               <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest">Active</span>
                  <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[#ccff00] text-[9px] md:text-[10px] font-black uppercase tracking-widest">{project.projectCategory}</span>
               </div>
               <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  {project.title}
               </h1>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 mb-12 md:mb-16">
               <div className="relative w-full aspect-video rounded-[32px] md:rounded-[48px] overflow-hidden bg-zinc-900 border border-white/10 group shadow-2xl">
                  {activeMedia?.type === 'video' ? (
                     <video src={activeMedia.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                     <img src={activeMedia?.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={project.title} />
                  )}
               </div>

               <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x touch-pan-x">
                  {project.gallery.map((media, i) => (
                     <div
                        key={i}
                        onClick={() => setActiveMedia(media)}
                        className={`relative w-36 md:w-48 h-20 md:h-28 rounded-xl md:rounded-2xl overflow-hidden bg-zinc-900 border-2 cursor-pointer transition-all shrink-0 snap-center ${activeMedia?.url === media.url ? 'border-[#ccff00]' : 'border-white/5 opacity-60 hover:opacity-100'}`}
                     >
                        <img src={media.thumbnail} className="w-full h-full object-cover" alt="Thumb" />
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-16 md:mb-20 items-stretch w-full">
               <div className="flex-1 bg-zinc-900 rounded-[32px] p-8 md:p-10 border border-white/10 shadow-3xl flex flex-col justify-between gap-8 transition-all hover:border-white/20">
                  <div className="flex flex-col gap-8">
                     <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Amount Raised</span>
                           <span className="text-3xl font-black text-white ">₹{project.collected.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Total Fund</span>
                           <span className="text-3xl font-black text-white ">₹{project.target.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="relative w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-[#ccff00] transition-all duration-2000" style={{ width: isLoaded ? `${progress}%` : '0%' }} />
                     </div>

                     {project.status === 'ACTIVE' ? (
                        <button 
                           onClick={handleInvestNowClick}
                           disabled={paymentLoading}
                           className="group/btn relative w-full py-6 bg-white text-black rounded-2xl text-[14px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                           <span className="relative z-10 flex items-center justify-center gap-2">
                              {paymentLoading ? <><FiLoader className="animate-spin text-lg" /> Processing...</> : 'Invest Now'}
                           </span>
                           {!paymentLoading && (
                              <div className="absolute inset-0 bg-[#ccff00] translate-y-full lg:group-hover/btn:translate-y-0 transition-transform duration-300" />
                           )}
                        </button>
                     ) : (
                        <div className="w-full py-6 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] rounded-2xl text-[14px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3">
                           <FiShield className="text-xl" />
                           Fully Funded
                        </div>
                     )}
                  </div>
               </div>

               <div className="flex-1 bg-white rounded-[32px] p-8 md:p-10 flex flex-col justify-between gap-8">
                  <div className="flex flex-col gap-6">
                     <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-black/40 uppercase">Project Yield</span>
                        <div className="flex items-baseline gap-2">
                           <span className="text-5xl font-black text-black ">{project.roi}</span>
                        </div>
                     </div>
                     <div className="w-full h-px bg-black/10" />
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                           <span className="text-[10px] font-black text-black/40 uppercase">Capital Tenure</span>
                           <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-black">{project.duration}</span>
                           </div>
                        </div>

                        {project.status === 'ONGOING' && (
                           <>
                              <div className="flex flex-col gap-2">
                                 <span className="text-[10px] font-black text-black/40 uppercase">Days Left</span>
                                 <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-black">{daysRemaining} Days</span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                 <span className="text-[10px] font-black text-black/40 uppercase">End Date</span>
                                 <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-black whitespace-nowrap">{maturityDateStr}</span>
                                 </div>
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {project.status === 'ACTIVE' && (
               <div className="flex flex-col gap-10 md:gap-16 items-start">
                  <div className="w-full flex flex-col md:flex-row justify-between items-end gap-8 bg-zinc-900/40 rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-white/5">
                     <div className="flex flex-col gap-3 max-w-xl">
                        <div className="flex items-center gap-2">
                           <FiSettings className="text-[#ccff00]" />
                           <h3 className="text-xl md:text-3xl font-bold text-white tracking-tight">Your Payout Simulator</h3>
                        </div>
                     </div>

                     <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto items-center">
                        <div className="flex flex-col gap-2 w-full md:w-64">
                           <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Investment Amount (₹)</label>
                           <input
                              type="number"
                              value={investmentInput}
                              onChange={(e) => setInvestmentInput(e.target.value)}
                              placeholder="Enter amount"
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 md:px-5 py-3 md:py-4 text-center text-lg md:text-xl font-black text-[#ccff00] focus:border-[#ccff00] outline-none"
                           />
                        </div>
                     </div>
                  </div>

                  <ProfitCalculator investment={investmentInput} roi={project.roi} duration={project.duration} />
               </div>
            )}

         </main>
         <Footer />

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
