import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowRight, FiLock, FiClock, FiActivity } from 'react-icons/fi';

const SessionExpired = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInactivity = location.state?.reason === 'inactivity';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-['Poppins']">
      
      {/* ── Security Pass Style Card (Light Version) ── */}
      <div className="max-w-[380px] w-full bg-white rounded-[40px] relative overflow-hidden shadow-[0_50px_100px_rgba(204,255,0,0.15)] animate-in fade-in zoom-in duration-500">
        
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
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-3">Security ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
           </div>
        </div>

        {/* The Ticket Cutouts/Dashed Line */}
        <div className="relative flex items-center justify-between">
           <div className="w-8 h-8 rounded-full bg-black -ml-4" />
           <div className="flex-1 border-t border-dashed border-zinc-200 mx-2" />
           <div className="w-8 h-8 rounded-full bg-black -mr-4" />
        </div>

        {/* Bottom Section */}
        <div className="p-10 pt-8 flex flex-col gap-8">
          <p className="text-zinc-600 text-[12px] text-center leading-relaxed font-medium">
            {isInactivity 
              ? "Your secure session was terminated after 15 minutes of inactivity. Access to your investment portfolio has been locked."
              : "Authentication period has concluded. For your institutional security, please sign in again to resume access."}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-5 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#ccff00] hover:text-black transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              Sign In Again <FiArrowRight className="text-lg" />
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Bottom Bar Accent */}
        <div className="h-1.5 w-full bg-[#ccff00]" />
      </div>
      
      {/* Decorative Branding */}
      <div className="fixed bottom-12 flex items-center gap-4 opacity-30">
         <FiActivity className="text-[#ccff00] text-xs" />
         <span className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Institutional Protocol Active</span>
      </div>
    </div>
  );
};

export default SessionExpired;
