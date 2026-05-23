import { FiArrowRight, FiTarget, FiShield, FiPercent, FiLoader } from 'react-icons/fi';
import { LuCoins } from 'react-icons/lu';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createPaymentOrderApi, verifyPaymentApi } from '../../../Services/allApi';
import InvestmentModal from '../../../Components/InvestmentModal';

export default function ActiveProjectCard({ project }) {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef(null);
  const progress = (Number(project.collected || 0) / Number(project.target || 1)) * 100 || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLoaded(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

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
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error('Razorpay SDK failed to load.');

      const savedUser = JSON.parse(localStorage.getItem('medhealthinvestuser'));
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
              text: err.message || 'Payment received but verification failed. Contact support.',
              background: '#09090b',
              color: '#fff',
              confirmButtonColor: '#000000'
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred.';
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: errorMsg,
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#000000'
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div 
      ref={cardRef}
      className="group relative h-full flex flex-col bg-zinc-900 rounded-[32px] p-6 border border-white/5 hover:border-[#ccff00]/50 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
    >
      {/* Horizontal Accent Bar - Pill Style */}
      <div className="absolute top-0 left-10 right-10 h-[6px] rounded-b-full bg-white transition-all duration-500" />

      {/* Project Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
             <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#ccff00]">
               {project.projectCategory}
             </span>
           </div>
           {project.activeDeadline && (
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
               <span className="w-1 h-1 rounded-full bg-[#ccff00] animate-pulse" />
               <span className="text-[10px] font-bold text-zinc-400 uppercase">
                 {(() => {
                   const diff = new Date(project.activeDeadline) - new Date();
                   const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                   return days > 0 ? `${days} Days Left` : 'Ending Soon';
                 })()}
               </span>
             </div>
           )}
        </div>
        <h3 className="text-2xl font-bold text-white leading-tight mb-2">
          {project.title}
        </h3>
      </div>

      {/* Financial Metrics */}
      <div className="flex flex-col gap-2 mb-4 py-3 border-y border-white/5 font-bold">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Target ROI :</span>
          <span className="text-[#ccff00] whitespace-nowrap">{project.roi}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Duration :</span>
          <span className="text-white whitespace-nowrap">{project.duration}</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-auto pt-4">
        <div className="relative w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden mb-3">
           <div 
             className="absolute top-0 left-0 h-full bg-[#ccff00] transition-all duration-[2000ms] ease-out shadow-[0_0_10px_#ccff00]"
             style={{ width: isLoaded ? `${Math.min(progress, 100)}%` : '0%' }}
           />
        </div>

        <div className="flex justify-between items-center mb-6">
           <span className="text-lg md:text-xl font-black text-white">
             ₹{Number(project.collected).toLocaleString('en-IN')}
           </span>
           <span className="text-xs md:text-sm font-medium text-zinc-500">
             of ₹{Number(project.target).toLocaleString('en-IN')}
           </span>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleInvestNowClick}
            disabled={paymentLoading}
            className="group/btn relative w-full py-5 bg-white text-black rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {paymentLoading ? (
                <><FiLoader className="animate-spin text-lg" /> Processing...</>
              ) : (
                <>Invest Now <LuCoins className="text-[18px] text-black/50 group-hover/btn:rotate-12 group-hover/btn:text-black transition-all duration-500" /></>
              )}
            </span>
            {!paymentLoading && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_50%)] via-[#ccff00]/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            )}
          </button>
          
          <Link to={`/project/${project.id}`} className="text-center text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors duration-300">
            Know More
          </Link>
        </div>
      </div>

      <InvestmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleInvestNow}
        projectTitle={project.title}
        projectCategory={project.projectCategory}
        targetAmount={project.target}
        collectedAmount={project.collected}
        minAmount={project.minAmount}
      />
    </div>
  );
}
