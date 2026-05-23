import React, { useState, useEffect } from 'react';
import Navbar from '../Home/HomeComponents/Navbar';
import Footer from '../../Components/Footer';
import { getUserInvestmentsApi } from '../../Services/allApi';
import { BASE_URL } from '../../Services/baseUrl';
import {
   FiArrowLeft,
   FiArrowUpRight,
   FiArrowDownLeft,
   FiPaperclip,
   FiDownload,
   FiX,
   FiCheckCircle,
   FiSearch,
   FiFilter,
   FiCalendar
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { generateInvestmentReceipt } from '../../Utils/generateReceipt';

const TransactionHistory = () => {
   const navigate = useNavigate();
   const [transactions, setTransactions] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isProofModalOpen, setIsProofModalOpen] = useState(false);
   const [selectedProof, setSelectedProof] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');

   useEffect(() => {
      const fetchHistory = async () => {
         try {
            const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
            if (user) {
               const res = await getUserInvestmentsApi(user.id);
               if (res.status === 200) {
                  setTransactions(res.data.investments || []);
               }
            }
         } catch (err) {
            console.error("Error fetching transaction history:", err);
         } finally {
            setIsLoading(false);
         }
      };
      fetchHistory();
      window.scrollTo(0, 0);
   }, []);

   const handleDownload = async (fileUrl) => {
      try {
         const response = await fetch(fileUrl);
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         const filename = fileUrl.split('/').pop() || 'receipt.jpg';
         link.setAttribute('download', filename);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
      } catch (err) {
         console.error("Download failed:", err);
         window.open(fileUrl, '_blank');
      }
   };

   // Process transactions to show separate entries for Investment and Payback
   const processedTransactions = React.useMemo(() => {
      const ledger = [];
      transactions.forEach(inv => {
         // 1. Always add the Investment (Debit) entry
         ledger.push({
            ...inv,
            ledgerType: 'DEBIT',
            ledgerDate: inv.created_at,
            ledgerAmount: Number(inv.amount),
            ledgerRef: `INV-${String(inv.id).padStart(6, '0')}`
         });

         // 2. If paid back, add the Settlement (Credit) entry
         if (inv.paybackStatus === 'PAID') {
            const isRefund = inv.project?.status === 'EXPIRED' || 
                           (inv.project?.status === 'COMPLETED' && Number(inv.project?.collectedAmount) < Number(inv.project?.targetAmount));
            const roi = isRefund ? 0 : Number(inv.project?.roi || 0);
            const duration = isRefund ? 1 : Number(inv.project?.duration || 1);
            const principal = Number(inv.amount);
            const interest = (principal * roi * duration) / 100;
            const totalMaturity = principal + interest;

            ledger.push({
               ...inv,
               ledgerType: 'CREDIT',
               isRefund: isRefund,
               ledgerDate: inv.updated_at || inv.created_at,
               ledgerAmount: totalMaturity,
               ledgerRef: `PAY-${String(inv.id).padStart(6, '0')}`
            });
         }
      });

      // Sort by date descending
      return ledger.sort((a, b) => new Date(b.ledgerDate) - new Date(a.ledgerDate));
   }, [transactions]);

   const filteredTransactions = processedTransactions.filter(inv =>
      inv.project?.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.ledgerAmount.toString().includes(searchQuery)
   );

   return (
      <div className="min-h-screen bg-black font-['Poppins'] text-white">
         <Navbar />

         <main className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-20 pt-32 pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
               <div className="space-y-4">
                  <button
                     onClick={() => navigate('/profile')}
                     className="flex items-center gap-2 text-zinc-500 hover:text-[#ccff00] transition-colors text-[10px] font-black uppercase tracking-widest"
                  >
                     <FiArrowLeft /> Back to Profile
                  </button>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                     Transaction <span className="text-zinc-700">History</span>
                  </h1>
                  <p className="text-zinc-500 text-sm font-medium max-w-md">
                     Complete institutional record of all capital deployments and settled payouts within the MedHealth Invest ecosystem.
                  </p>
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full sm:w-80">
                     <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                     <input
                        type="text"
                        placeholder="Search Projects or Amounts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-[#ccff00]/30 outline-none transition-all"
                     />
                  </div>
                  <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-zinc-400 hover:text-white transition-all">
                     <FiFilter /> Filter
                  </button>
               </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] space-y-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Deployments</span>
                  <p className="text-3xl font-black text-white">₹{transactions.reduce((acc, inv) => acc + Number(inv.amount), 0).toLocaleString('en-IN')}</p>
               </div>
               <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] space-y-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Settled Payouts</span>
                  <p className="text-3xl font-black text-[#ccff00]">₹{processedTransactions.filter(inv => inv.ledgerType === 'CREDIT').reduce((acc, inv) => acc + Number(inv.ledgerAmount), 0).toLocaleString('en-IN')}</p>
               </div>
               <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[32px] space-y-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Record Count</span>
                  <p className="text-3xl font-black text-white">{processedTransactions.length} Verified Logs</p>
               </div>
            </div>

            {/* Table/List View */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] overflow-hidden">
               <div className="hidden lg:grid grid-cols-5 gap-4 px-10 py-6 border-b border-white/5 bg-zinc-900/50">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transaction Date</span>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest col-span-2">Project Particulars</span>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount</span>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Audit Status</span>
               </div>

               <div className="divide-y divide-white/5">
                  {isLoading ? (
                     <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-2 border-[#ccff00]/20 border-t-[#ccff00] rounded-full animate-spin" />
                        <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">Fetching Immutable Records...</p>
                     </div>
                  ) : filteredTransactions.length > 0 ? (
                     filteredTransactions.map((inv, idx) => (
                        <div key={`${inv.id}-${inv.ledgerType}`} className="group hover:bg-white/[0.02] transition-all duration-300">
                           <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center px-8 lg:px-10 py-8">

                              {/* Date & Icon */}
                              <div className="flex items-center gap-6">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${inv.ledgerType === 'CREDIT'
                                    ? 'bg-[#ccff00]/5 text-[#ccff00]'
                                    : 'bg-white/5 text-zinc-500'
                                    }`}>
                                    {inv.ledgerType === 'CREDIT' ? <FiArrowDownLeft size={24} /> : <FiArrowUpRight size={24} />}
                                 </div>
                                 <div className="flex flex-col">
                                    <div className='flex flex-col items-start gap-1' >
                                       <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest leading-none ">
                                          {new Date(inv.ledgerDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                       </span>
                                       <span className='text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none ' >{new Date(inv.ledgerDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                    </div>

                                    <div className="lg:hidden">
                                       <h4 className="font-bold text-white text-lg">{inv.project?.projectName}</h4>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest lg:hidden">
                                       {inv.ledgerType === 'CREDIT' ? `Credit • ${inv.isRefund ? 'Refund' : 'Payout'}` : 'Debit • Invested'}
                                    </span>
                                 </div>
                              </div>

                              {/* Project Details (Desktop) */}
                              <div className="hidden lg:flex flex-col col-span-2">
                                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                                    {inv.project?.projectType === 'Exclusive' ? 'Exclusive Asset' : 'Standard Asset'}
                                 </span>
                                 <h4 className="text-lg font-bold text-white tracking-tight">{inv.project?.projectName}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${inv.ledgerType === 'CREDIT' ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'bg-white/5 text-zinc-500'
                                       }`}>
                                       {inv.ledgerType === 'CREDIT' ? (inv.isRefund ? 'Refund' : 'Payout') : 'Invested'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                    <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                                       Ref: {inv.ledgerRef}
                                    </span>
                                 </div>
                              </div>

                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 lg:hidden">Financial Settlement</span>

                                 <div className="flex flex-col gap-1">
                                    {inv.ledgerType === 'CREDIT' && (
                                       <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Principal:</span>
                                             <span className="text-[10px] font-bold text-white">₹ {Number(inv.amount).toLocaleString()}</span>
                                          </div>
                                          {!inv.isRefund && (
                                             <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Yield:</span>
                                                <span className="text-[10px] font-bold text-[#ccff00]">
                                                   ₹ {Math.round(inv.ledgerAmount - inv.amount).toLocaleString()}
                                                </span>
                                             </div>
                                          )}
                                       </div>
                                    )}
                                    <span className={`text-xl font-bold tabular-nums ${inv.ledgerType === 'CREDIT' ? 'text-[#ccff00]' : 'text-white'}`}>
                                       ₹ {Number(inv.ledgerAmount).toLocaleString('en-IN')}
                                    </span>


                                 </div>
                              </div>

                              {/* Status & Actions */}
                              <div className="flex items-center justify-between lg:justify-end gap-6">
                                 <div className="flex gap-2">
                                    {/* 1. VIEW ACTION (Paperclip) */}
                                    <button
                                       onClick={() => {
                                          const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                                          if (inv.ledgerType === 'CREDIT') {
                                             generateInvestmentReceipt({
                                                amount: inv.ledgerAmount,
                                                paymentId: inv.ledgerRef,
                                                projectTitle: inv.project?.projectName,
                                                duration: inv.project?.duration,
                                                isPayout: !inv.isRefund,
                                                isRefund: inv.isRefund,
                                                paybackProof: inv.paybackProof ? `${BASE_URL}/${inv.paybackProof}` : null
                                             }, user, 'view');
                                          } else {
                                             generateInvestmentReceipt({
                                                amount: inv.amount,
                                                paymentId: inv.paymentId,
                                                projectTitle: inv.project?.projectName,
                                                duration: inv.project?.duration
                                             }, user, 'view');
                                          }
                                       }}
                                       className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-all"
                                       title={inv.ledgerType === 'CREDIT' ? (inv.isRefund ? "View Refund Receipt" : "View Payout Receipt") : "View Investment Receipt"}
                                    >
                                       <FiPaperclip size={20} />
                                    </button>

                                    {/* 2. DOWNLOAD ACTION (Download Icon) */}
                                    <button
                                       onClick={() => {
                                          const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                                          if (inv.ledgerType === 'CREDIT') {
                                             generateInvestmentReceipt({
                                                amount: inv.ledgerAmount,
                                                paymentId: inv.ledgerRef,
                                                projectTitle: inv.project?.projectName,
                                                duration: inv.project?.duration,
                                                isPayout: !inv.isRefund,
                                                isRefund: inv.isRefund,
                                                paybackProof: inv.paybackProof ? `${BASE_URL}/${inv.paybackProof}` : null
                                             }, user, 'download');
                                          } else {
                                             generateInvestmentReceipt({
                                                amount: inv.amount,
                                                paymentId: inv.paymentId,
                                                projectTitle: inv.project?.projectName,
                                                duration: inv.project?.duration
                                             }, user, 'download');
                                          }
                                       }}
                                       className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                                       title={inv.isRefund ? "Download Refund Receipt" : "Download PDF Document"}
                                    >
                                       <FiDownload size={20} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))

                  ) : (
                     <div className="py-40 text-center space-y-4">
                        <div className="w-20 h-20 bg-zinc-900 border border-dashed border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                           <FiCalendar className="text-3xl text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-400">No Transactions Found</h3>
                        <p className="text-zinc-600 text-sm max-w-xs mx-auto">Your institutional activity log is currently empty. Active deployments will appear here once finalized.</p>
                     </div>
                  )}
               </div>
            </div>
         </main>

         {/* 🖼️ Proof Modal */}
         {isProofModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <div className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">

                  <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-800/50">
                     <div className="flex items-center gap-3">
                        <FiCheckCircle className="text-[#ccff00] text-xl" />
                        <h2 className="text-lg font-bold text-white tracking-tight">Audit Verification Proof</h2>
                     </div>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => handleDownload(selectedProof)}
                           className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-[#ccff00] transition-all"
                           title="Download Receipt"
                        >
                           <FiDownload size={20} />
                        </button>
                        <button
                           onClick={() => setIsProofModalOpen(false)}
                           className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                        >
                           <FiX size={20} />
                        </button>
                     </div>
                  </div>

                  <div className="p-8 flex flex-col items-center justify-center bg-black/20">
                     <div className="relative group/img max-h-[60vh] overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                        <img
                           src={selectedProof}
                           alt="Payment Proof"
                           className="max-w-full h-auto object-contain"
                        />
                     </div>
                     <div className="mt-8 flex flex-col items-center text-center">
                        <div className="px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 mb-3">
                           <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-[0.2em]">Verified Transaction</span>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Digital Transfer Receipt • Secured via MedHealth Invest Protocol</p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         <Footer />
      </div>
   );
};

export default TransactionHistory;
