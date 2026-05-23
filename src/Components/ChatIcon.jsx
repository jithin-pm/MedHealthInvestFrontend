import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PiChatTeardropDotsBold } from 'react-icons/pi'
import { FiX } from 'react-icons/fi'
import { MdSupportAgent } from 'react-icons/md'
import io from 'socket.io-client'
import { getUnreadCountApi } from '../Services/allApi'
import { BASE_URL } from '../Services/baseUrl'

export default function ChatIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));

  useEffect(() => {
    if (user && user.id) {
      // Fetch initial unread count
      const fetchUnread = async () => {
        try {
          const res = await getUnreadCountApi(user.id);
          if (res.status === 200) {
            setUnreadCount(res.data.unreadCount);
          }
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      };
      fetchUnread();

      // Listen for real-time messages to increment badge
      const socket = io(BASE_URL || 'http://localhost:5000');
      socket.emit('join_room', user.id);

      socket.on('receive_message', (data) => {
        // If message is from admin and we are NOT on the chat page and NOT already open
        if (data.senderType === 'admin' && location.pathname !== '/chat' && !isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => socket.disconnect();
    }
  }, [user?.id, location.pathname, isOpen]);

  if (location.pathname === '/chat' || !user || !user.accessToken) {
    return null;
  }

  return (
    <>
      {/* The Help Button */}
      {!isOpen && (
        <button 
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0); // Reset locally when opening help info
          }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[200] bg-zinc-900 text-white w-14 py-5 pl-2 pr-4 rounded-l-2xl border-2 border-r-0 border-white/10 shadow-none flex flex-col items-center gap-2 transition-all duration-300 translate-x-3 hover:translate-x-0 group cursor-pointer"
        >
          {unreadCount > 0 && (
            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#ccff00] text-black text-[10px] font-bold font-['Outfit'] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.4)] animate-bounce z-[201]">
              {unreadCount}
            </div>
          )}
          <span 
            className="text-[12px] font-black tracking-[0.2em] uppercase text-[#ccff00]"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Help
          </span>
          <PiChatTeardropDotsBold className="text-xl text-[#ccff00]" />
        </button>
      )}

      {/* The Help Modal */}
      {isOpen && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[200] w-[350px] bg-zinc-900 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 animate-in fade-in zoom-in duration-300 font-['Outfit']">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          >
            <FiX className="text-xl" />
          </button>
          
          <div className="mb-6">
            <p className="text-[10px] font-bold text-[#ccff00] uppercase tracking-[0.2em] mb-2">Support</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-4 tracking-tighter">How can we<br/>help you?</h2>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Have questions about our projects or need to know more or any doubt ? Chat with our team.
            </p>
          </div>

          <button 
            onClick={() => {
              setIsOpen(false);
              navigate('/chat');
            }}
            className="w-full group bg-black hover:bg-[#111] border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-[#ccff00]/50 text-left active:scale-[0.98]"
          >
            <div className="w-11 h-11 bg-[#ccff00] rounded-full flex items-center justify-center shrink-0">
              <MdSupportAgent className="text-black text-xl" />
            </div>
            <div>
              <p className="font-bold text-white text-sm group-hover:text-[#ccff00] transition-colors">Chat to Official</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">Usually replies instantly</p>
            </div>
          </button>
        </div>
      )}
    </>
  )
}
