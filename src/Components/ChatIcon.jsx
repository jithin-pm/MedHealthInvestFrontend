import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PiChatTeardropDotsBold } from 'react-icons/pi'
import io from 'socket.io-client'
import { getUnreadCountApi } from '../Services/allApi'
import { BASE_URL } from '../Services/baseUrl'

export default function ChatIcon() {
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
        // If message is from admin and we are NOT on the chat page
        if (data.senderType === 'admin' && location.pathname !== '/chat') {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => socket.disconnect();
    }
  }, [user?.id, location.pathname]);

  if (location.pathname === '/chat' || !user || !user.accessToken) {
    return null;
  }

  return (
    <>
      {/* The Help Button */}
      <button 
        onClick={() => {
          setUnreadCount(0);
          navigate('/chat');
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
    </>
  )
}
