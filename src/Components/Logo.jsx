import React from 'react';
import { Link } from 'react-router-dom';
import logoWhite from '../assets/MHI-LOGO-WHITE.png';
import logoBlack from '../assets/MHI-LOGO-BLACK.png';

/**
 * Reusable Logo and Branding component
 * @param {string} variant - 'light' (white text/logo) or 'dark' (black text/logo)
 * @param {string} size - 'sm', 'md', 'lg', or 'xl'
 * @param {boolean} showText - Whether to show the "Med Health Invest" text
 * @param {string} className - Additional CSS classes for the container
 */
const Logo = ({ variant = 'light', size = 'md', showText = true, className = "" }) => {
  const isDark = variant === 'dark';
  const logoSrc = isDark ? logoBlack : logoWhite;
  
  // Size configurations
  const sizes = {
    sm: {
      img: 'h-8 lg:h-9',
      text: 'text-sm',
      spacing: '-space-y-[5px]',
      gap: 'gap-2'
    },
    md: {
      img: 'h-10 lg:h-12',
      text: 'text-xl',
      spacing: '-space-y-[8px]',
      gap: 'gap-3 lg:gap-4'
    },
    lg: {
      img: 'h-14 lg:h-16',
      text: 'text-2xl',
      spacing: '-space-y-[10px]',
      gap: 'gap-4 lg:gap-5'
    },
    xl: {
      img: 'h-20 lg:h-24',
      text: 'text-4xl',
      spacing: '-space-y-[14px]',
      gap: 'gap-6'
    }
  };

  const config = sizes[size] || sizes.md;
  const textColor = isDark ? 'text-black' : 'text-white';
  const accentColor = isDark ? 'text-zinc-800' : 'text-[#ccff00]';

  return (
    <Link to="/" className={`flex items-center ${config.gap} group cursor-pointer font-['Outfit'] ${className}`}>
      <img 
        src={logoSrc} 
        alt="Med Health Invest" 
        className={`${config.img} w-auto object-contain transition-transform duration-500 group-hover:scale-105`} 
      />
      
      {showText && (
        <div className={`flex flex-col justify-center ${config.spacing} leading-[0.8]`}>
          <span className={`${config.text} font-bold tracking-tight ${textColor} uppercase`}>
            Med Health
          </span>
          <span className={`${config.text} font-medium ${accentColor} uppercase`}>
            Invest
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
