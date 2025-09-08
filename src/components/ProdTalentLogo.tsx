import React from 'react';

interface ProdTalentLogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export default function ProdTalentLogo({ 
  size = 120, 
  showText = true, 
  variant = 'light' 
}: ProdTalentLogoProps) {
  const primaryColor = variant === 'light' ? '#ffcc00' : '#ffcc00';
  const secondaryColor = variant === 'light' ? '#61bfac' : '#61bfac';
  const textColor = variant === 'light' ? '#f5f5f7' : '#333';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: showText ? 12 : 0
    }}>
      {/* Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background Circle */}
        <circle
          cx="60"
          cy="60"
          r="58"
          fill="url(#gradient)"
          stroke={primaryColor}
          strokeWidth="2"
        />
        
        {/* Inner Design */}
        <g transform="translate(30, 30)">
          {/* Letter P */}
          <path
            d="M10 10 L10 50 M10 10 L35 10 C42 10 45 15 45 22 C45 29 42 34 35 34 L10 34"
            stroke={textColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Talent Symbol - Star/Diamond */}
          <path
            d="M55 20 L60 10 L65 20 L75 22 L65 30 L60 40 L55 30 L45 22 Z"
            fill={primaryColor}
            stroke={textColor}
            strokeWidth="1.5"
          />
        </g>
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1a1a1a', stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: '#333', stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: '#0a0a0a', stopOpacity: 0.9 }} />
          </linearGradient>
          
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: primaryColor }} />
            <stop offset="100%" style={{ stopColor: secondaryColor }} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Logo Text */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{
            margin: 0,
            fontSize: Math.max(size * 0.25, 18),
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffcc00 0%, #61bfac 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textFillColor: 'transparent',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            ProdTalent
          </h1>
          <span style={{
            color: secondaryColor,
            fontSize: Math.max(size * 0.1, 10),
            fontWeight: '500',
            marginTop: 2,
            letterSpacing: '0.5px'
          }}>
            by Edacy
          </span>
        </div>
      )}
    </div>
  );
}