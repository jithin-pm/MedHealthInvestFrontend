import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLock, FiClock, FiUserX, FiMail } from 'react-icons/fi';

const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('expired');
  const [customMessage, setCustomMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = (event) => {
      setReason(event.detail?.reason || 'expired');
      setCustomMessage(event.detail?.message || '');
      setIsOpen(true);
    };

    const handleAccountDeactivated = (event) => {
      setReason('deactivated');
      setCustomMessage(event.detail?.message || '');
      setIsOpen(true);
    };

    window.addEventListener('session_expired', handleSessionExpired);
    window.addEventListener('account_deactivated', handleAccountDeactivated);
    return () => {
      window.removeEventListener('session_expired', handleSessionExpired);
      window.removeEventListener('account_deactivated', handleAccountDeactivated);
    };
  }, []);

  if (!isOpen) return null;

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/auth');
  };

  const handleHome = () => {
    setIsOpen(false);
    navigate('/');
  };

  const isInactivity = reason === 'inactivity';
  const isDeactivated = reason === 'deactivated';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Security Pass Style Modal - Clean (No Shadows) */}
      <div className="max-w-[390px] w-full bg-white rounded-[40px] relative overflow-hidden animate-in zoom-in duration-500">
        
        {/* Top Section */}
        <div className="p-10 pb-8 flex flex-col items-center gap-6">
           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
             isDeactivated
               ? 'bg-rose-50 border border-rose-200 text-rose-600'
               : 'bg-black text-[#ccff00]'
           }`}>
              {isDeactivated ? (
                <FiUserX className="text-3xl text-rose-600 animate-pulse" />
              ) : isInactivity ? (
                <FiClock className="text-3xl text-[#ccff00]" />
              ) : (
                <FiLock className="text-3xl text-[#ccff00]" />
              )}
           </div>
           
           <div className="text-center">
             {isDeactivated ? (
               <>
                 <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-none">
                   Account <br/>
                   <span className="text-rose-600">Deactivated</span>
                 </h1>
                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mt-3">Access Suspended</p>
               </>
             ) : (
               <>
                 <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-none">
                   {isInactivity ? 'Inactivity' : 'Session'} <br/>
                   <span className="text-[#99cc00]">Terminated</span>
                 </h1>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-3">Security Notice</p>
               </>
             )}
           </div>
        </div>

        {/* The Ticket Cutouts/Dashed Line */}
        <div className="relative flex items-center justify-between">
           <div className="w-8 h-8 rounded-full bg-black/95 -ml-4" />
           <div className="flex-1 border-t border-dashed border-zinc-200 mx-2" />
           <div className="w-8 h-8 rounded-full bg-black/95 -mr-4" />
        </div>

        {/* Bottom Section */}
        <div className="p-10 pt-8 flex flex-col gap-7">
          <p className="text-zinc-600 text-[12px] text-center leading-relaxed font-medium">
            {isDeactivated
              ? (customMessage || "Your account has been deactivated by administrator. Login and investor actions have been suspended. Please contact support.")
              : isInactivity 
                ? "Your session was terminated after 15 minutes of inactivity. For your safety, access has been locked."
                : "Authentication period has concluded. For your institutional security, please sign in again to continue."}
          </p>

          {isDeactivated ? (
            <div className="flex flex-col gap-3">
              <a
                href="mailto:support@medhealthinvest.com?subject=Account%20Reactivation%20Request"
                className="w-full py-4.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <FiMail className="text-base" />
                <span>Contact Support</span>
              </a>
              
              <button
                onClick={handleHome}
                className="w-full py-3.5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-colors"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogin}
                className="w-full py-5 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#ccff00] hover:text-black transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Sign In Again <FiArrowRight className="text-lg" />
              </button>
              
              <button
                onClick={handleHome}
                className="w-full py-4 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>

        {/* Bottom Bar Accent */}
        <div className={`h-1.5 w-full ${isDeactivated ? 'bg-rose-600' : 'bg-[#ccff00]'}`} />
      </div>
      
    </div>
  );
};

export default SessionExpiredModal;
