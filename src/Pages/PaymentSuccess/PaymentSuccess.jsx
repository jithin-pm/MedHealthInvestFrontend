import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiDownload, FiHome, FiLoader } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import Navbar from '../Home/HomeComponents/Navbar';
import Footer from '../../Components/Footer';
import logo from '../../assets/MHI-LOGO-BLACK.png';

import { generateInvestmentReceipt } from '../../Utils/generateReceipt';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  // Retrieve data from secure state instead of URL
  const { amount, paymentId, projectTitle, duration } = location.state || {};

  // If no state exists (e.g., direct URL access), redirect to home
  useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true });
    }
    window.scrollTo(0, 0);
  }, [location.state, navigate]);

  const userData = JSON.parse(localStorage.getItem('medhealthinvestuser') || '{}');

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    generateInvestmentReceipt(
      { amount, paymentId, projectTitle, duration },
      userData
    );
    setIsGenerating(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-['Poppins',sans-serif] selection:bg-black selection:text-white">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left Section: Message & Branding */}
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
             
             {/* Institutional Seal Design */}
             <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-[3px] border-black rounded-full animate-[spin_10s_linear_infinite] opacity-10" />
                <div className="absolute inset-2 border-2 border-black rounded-full opacity-5" />
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl relative z-10">
                   <FiCheck className="text-white text-3xl stroke-[4]" />
                </div>
             </div>
             
             <div className="space-y-6">
                <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-zinc-400">Transaction Finalized</h2>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
                  Payment <br/>
                  <span className="text-zinc-300">Successful</span>
                </h1>
                <p className="text-zinc-400 text-base md:text-lg font-medium max-w-md leading-relaxed">
                  Your allocation has been secured and logged into the institutional blockchain. A digital record has been generated for your portfolio.
                </p>
             </div>

             <div className="flex flex-col sm:flex-row gap-5 pt-8">
                <button 
                  onClick={() => navigate('/profile')}
                  className="px-12 py-5 bg-black text-white font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98]"
                >
                  View Ledger
                  <FiArrowRight className="text-lg" />
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="px-12 py-5 border-2 border-black text-black font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all active:scale-[0.98]"
                >
                  <FiHome className="text-lg" />
                  Home
                </button>
                
                <button 
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="px-12 py-5 border-2 border-black text-black font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all active:scale-[0.98] disabled:opacity-50 sm:col-span-2 lg:col-span-1"
                >
                  {isGenerating ? <FiLoader className="text-lg animate-spin" /> : <FiDownload className="text-lg" />}
                  {isGenerating ? 'Generating...' : 'Download Receipt'}
                </button>
             </div>
          </div>

          {/* Right Section: Architectural Receipt */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
             <div className="w-full bg-zinc-50 border-2 border-black p-8 md:p-14 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 -mr-12 -mt-12 rotate-45" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 -ml-16 -mb-16 rotate-45" />
                
                <div className="relative space-y-12">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Receipt No.</span>
                         <p className="text-sm font-mono text-black">MHI-{paymentId?.slice(-6).toUpperCase() || 'TX-9921'}</p>
                      </div>
                      <div className="text-right space-y-1">
                         <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Date</span>
                         <p className="text-sm font-black text-black">{new Date().toLocaleDateString('en-GB')}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-end border-b-2 border-black pb-4">
                         <div className="space-y-1">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Project Allocation</span>
                            <p className="text-2xl font-black text-black uppercase tracking-tight">{projectTitle || 'Project Alpha'}</p>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Principal Amount</span>
                            <span className="text-black font-black">₹{Number(amount || 0).toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
                            <span className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[11px]">Total Settled</span>
                            <span className="text-3xl font-black text-black">₹{Number(amount || 0).toLocaleString('en-IN')}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 pt-10">
                      <div className="space-y-2">
                         <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Transaction ID</span>
                         <div className="bg-black/5 px-3 py-2 border-l-2 border-black inline-block w-full">
                            <p className="text-[11px] font-mono text-black font-bold break-all leading-none">{paymentId}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] pt-2">
                         <div className="w-1.5 h-1.5 bg-black" />
                         Immutable Ledger Verified
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
