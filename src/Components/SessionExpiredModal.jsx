import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLock, FiClock, FiActivity } from 'react-icons/fi';

const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('expired');
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = (event) => {
      setReason(event.detail?.reason || 'expired');
      setIsOpen(true);
    };

    window.addEventListener('session_expired', handleSessionExpired);
    return () => window.removeEventListener('session_expired', handleSessionExpired);
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* ── Security Pass Style Modal ── */}
      <div className="max-w-[380px] w-full bg-white rounded-[40px] relative overflow-hidden shadow-[0_50px_100px_rgba(204,255,0,0.2)] animate-in zoom-in duration-500">
        
        {/* Top Section */}
        <div className="p-10 pb-8 flex flex-col items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-xl">
              {isInactivity ? (
                <FiClock className="text-3xl text-[#ccff00]" />
              ) : (
                <FiLock className="text-3xl text-[#ccff00]" />
              )}
           </div>
           
           <div className="text-center">
             <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-none">
               {isInactivity ? 'Inactivity' : 'Session'} <br/>
               <span className="text-[#99cc00]">Terminated</span>
             </h1>
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-3">Security Notice</p>
           </div>
        </div>

        {/* The Ticket Cutouts/Dashed Line */}
        <div className="relative flex items-center justify-between">
           <div className="w-8 h-8 rounded-full bg-black/90 -ml-4" />
           <div className="flex-1 border-t border-dashed border-zinc-200 mx-2" />
           <div className="w-8 h-8 rounded-full bg-black/90 -mr-4" />
        </div>

        {/* Bottom Section */}
        <div className="p-10 pt-8 flex flex-col gap-8">
          <p className="text-zinc-600 text-[12px] text-center leading-relaxed font-medium">
            {isInactivity 
              ? "Your session was terminated after 15 minutes of inactivity. For your safety, access has been locked."
              : "Authentication period has concluded. For your institutional security, please sign in again to continue."}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="w-full py-5 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#ccff00] hover:text-black transition-all duration-300 flex items-center justify-center gap-3"
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
        </div>

        {/* Bottom Bar Accent */}
        <div className="h-1.5 w-full bg-[#ccff00]" />
      </div>
      
    </div>
  );
};

export default SessionExpiredModal;
