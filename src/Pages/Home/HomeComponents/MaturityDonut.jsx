import React from 'react'

export default function MaturityDonut({ percentage, isLoaded }) {
  const size = 70
  const strokeWidth = 8
  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-full h-full group/donut">
      <svg width={size} height={size} className="transform rotate-0">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#ccff00"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: isLoaded ? offset : circumference,
            transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center Percentage Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
         <span className="text-[13px] font-black text-white tracking-tighter leading-none">
           {percentage}%
         </span>
      </div>
    </div>
  )
}
