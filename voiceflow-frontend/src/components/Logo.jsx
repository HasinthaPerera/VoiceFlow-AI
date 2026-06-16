import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 select-none ${selectedSize} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="logoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
            <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
          </linearGradient>
          <linearGradient id="logoSecondaryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#db2777" /> {/* Pink */}
            <stop offset="100%" stopColor="#6366f1" /> {/* Indigo */}
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Inner pulsing core */}
        <circle 
          cx="50" 
          cy="50" 
          r="16" 
          fill="url(#logoPrimaryGrad)" 
          className="animate-pulse" 
          style={{ animationDuration: '2.5s' }} 
        />
        
        {/* Outer infinity loop 1 - rotates clockwise */}
        <path 
          d="M20 50 C20 34, 34 20, 50 50 C66 80, 80 66, 80 50 C80 34, 66 20, 50 50 C34 80, 20 66, 20 50 Z" 
          stroke="url(#logoSecondaryGrad)" 
          strokeWidth="4.5" 
          strokeLinecap="round" 
          filter="url(#logoGlow)"
          className="origin-center animate-spin"
          style={{ animationDuration: '10s', animationTimingFunction: 'linear' }}
        />
        
        {/* Outer loop 2 - rotates counter-clockwise */}
        <path 
          d="M50 20 C66 20, 80 34, 50 50 C20 66, 34 80, 50 80 C66 80, 80 66, 50 50 C20 34, 34 20, 50 20 Z" 
          stroke="url(#logoPrimaryGrad)" 
          strokeWidth="3.5" 
          strokeLinecap="round"
          className="origin-center animate-spin"
          style={{ animationDuration: '14s', animationTimingFunction: 'linear', animationDirection: 'reverse' }}
        />
      </svg>
    </div>
  );
}
