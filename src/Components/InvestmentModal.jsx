import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCheck, FiInfo, FiShield, FiTrendingUp } from 'react-icons/fi';
import { LuCoins } from 'react-icons/lu';

const InvestmentModal = ({ isOpen, onClose, onConfirm, projectTitle, projectCategory, minAmount = 1000, targetAmount = 0, collectedAmount = 0, isExclusive = false }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const remainingBalance = Math.max(0, targetAmount - collectedAmount);

  // Tiers for quick selection
  const tiers = [50000, 100000, 500000].filter(t => t <= remainingBalance);

  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (isExclusive) {
        setAmount(remainingBalance.toString());
      }
    } else {
      document.body.style.overflow = 'unset';
      setAmount('');
      setError('');
      setShowTerms(false);
    }
  }, [isOpen, isExclusive, remainingBalance]);

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (!val || val < minAmount) {
      setError(`Minimum investment is ₹${minAmount.toLocaleString()}`);
      return;
    }
    if (val > remainingBalance) {
      setError(`Maximum allowable investment is ₹${remainingBalance.toLocaleString()}`);
      return;
    }
    onConfirm(val);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden font-['Poppins',sans-serif]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" 
        onClick={onClose}
      />

      {/* Modal Content - Compact Unified White */}
      <div className="relative w-full max-w-sm bg-white rounded-none overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 border-2 border-zinc-900">
        
        {/* Unified Content Section */}
        <div className="p-8 space-y-8">
           
           {/* Header */}
           <div className="flex flex-col items-start gap-3">
              
              <div className="space-y-1">
                 <h2 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">{projectCategory || 'Project Category'}</h2>
                 <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-tight uppercase">
                    {projectTitle}
                 </h3>
              </div>
           </div>

           {/* Input Section */}
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-end">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Allocation Amount</label>
               </div>
               <div className="relative">
                 <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-200">₹</span>
                 <input
                    type="number"
                    autoFocus={!isExclusive}
                    value={amount}
                    readOnly={isExclusive}
                    onChange={(e) => {
                      if (!isExclusive) {
                        setAmount(e.target.value);
                        setError('');
                      }
                    }}
                    placeholder={isExclusive ? '' : `Min: ₹${minAmount.toLocaleString()}`}
                    className={`w-full bg-transparent border-b-2 border-zinc-100 py-4 pl-8 text-4xl font-black text-zinc-900 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isExclusive ? 'cursor-not-allowed opacity-80' : ''}`}
                 />
               </div>

              {error && (
                <p className="text-red-600 text-[11px] font-black uppercase tracking-[0.05em] leading-tight">{error}</p>
              )}
           </div>

          

           {/* Actions Interface - High Impact Buttons */}
           <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleConfirm}
                disabled={!amount || isNaN(amount) || parseFloat(amount) <= 0}
                className="w-full py-5 bg-zinc-900 text-white rounded-none text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all active:scale-[0.98] border-2 border-zinc-900 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Pay with Razorpay
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-5 bg-white text-zinc-900 rounded-none text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-50 transition-all active:scale-[0.98] border-2 border-zinc-900"
              >
                Cancel Transaction
              </button>

              <div className="flex justify-center pt-2">
                 <button 
                   onClick={() => setShowTerms(true)}
                   className="text-[8px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-[0.3em] transition-colors underline underline-offset-4"
                 >
                   Review Terms & Conditions
                 </button>
              </div>
           </div>
        </div>

        {/* Nested Terms Overlay */}
        {showTerms && (
          <div className="absolute inset-0 bg-white z-50 animate-in slide-in-from-right duration-300 flex flex-col">
             <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                <h4 className="text-[14px] text-black font-black uppercase tracking-[0.4em]">Terms & Condition</h4>
                <button onClick={() => setShowTerms(false)} className="text-zinc-400 hover:text-black">
                   <FiX size={20} />
                </button>
             </div>
             <div className="p-8 overflow-y-auto flex-1 ">
                <div className="space-y-8 text-sm leading-relaxed text-zinc-600 font-medium">
                   <section>
                      <h5 className="text-[11px] font-black text-zinc-900 uppercase mb-3 tracking-widest">01. Principal Allocation</h5>
                      <p>By clicking Authorize, you agree to allocate the specified principal amount to the {projectTitle} project. This capital is subject to project-specific lock-in periods.</p>
                   </section>
                   <section>
                      <h5 className="text-[11px] font-black text-zinc-900 uppercase mb-3 tracking-widest">02. Risk Disclosure</h5>
                      <p>Investments in private projects carry inherent risks. Past performance does not guarantee future returns. Ensure you have read the project prospectus thoroughly.</p>
                   </section>
                   <section>
                      <h5 className="text-[11px] font-black text-zinc-900 uppercase mb-3 tracking-widest">03. Transaction Finality</h5>
                      <p>Once authorized, the transaction is processed via the Razorpay gateway and cannot be reversed. Fees may apply depending on your payment method.</p>
                   </section>
                </div>
             </div>
             <div className="p-8 border-t border-zinc-50">
                <button 
                   onClick={() => setShowTerms(false)}
                   className="w-full py-4 border-2 border-zinc-900 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white text-black transition-all"
                >
                   Back to Investment
                </button>
             </div>
          </div>
        )}

      </div>
    </div>,
    document.body
   );
};

export default InvestmentModal;
