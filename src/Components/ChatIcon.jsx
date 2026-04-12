import React from 'react'
import { BiMessageRoundedDots } from 'react-icons/bi'
import { PiChatTeardropDotsBold } from 'react-icons/pi'

export default function ChatIcon() {
  return (
    <button 
      onClick={() => window.location.href = '#'}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[200] bg-zinc-900 text-white w-14 py-5 pl-2 pr-4 rounded-l-2xl border-2 border-r-0 border-white/10 shadow-none flex flex-col items-center gap-2 transition-all duration-300 translate-x-3 hover:translate-x-0 group cursor-pointer"
    >
      <span 
        className="text-[12px] font-black tracking-[0.2em] uppercase text-[#ccff00]"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        Help
      </span>
      <PiChatTeardropDotsBold className="text-xl text-[#ccff00]" />
    </button>
  )
}
