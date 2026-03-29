
import React, { useState } from 'react';

export const ChurchLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative rounded-full bg-white flex items-center justify-center p-0.5 shadow-xl overflow-hidden ${className}`}>
      {!imgError ? (
        <img 
          src="https://drive.google.com/uc?export=view&id=1IQrH7rMgENdOEPTIN19BqbaZoK5n6cjl" 
          alt="Church Logo" 
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Blue Ring */}
          <circle cx="100" cy="100" r="96" fill="none" stroke="#003594" strokeWidth="5" />
          
          {/* Inner Blue Ring */}
          <circle cx="100" cy="100" r="70" fill="none" stroke="#003594" strokeWidth="3" />

          {/* Top Text Arc: FAMILLE CHRETIENNE */}
          <path id="topTextPath" d="M 40,100 A 60,60 0 1,1 160,100" fill="transparent" />
          <text className="font-bold" fill="#003594" style={{ fontSize: '20px', letterSpacing: '1px' }}>
            <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
              FAMILLE CHRETIENNE
            </textPath>
          </text>

          {/* Bottom Text Arc: FOI PARFAITE */}
          <path id="bottomTextPath" d="M 40,100 A 60,60 0 0,0 160,100" fill="transparent" />
          <text className="font-bold" fill="#003594" style={{ fontSize: '24px', letterSpacing: '2px' }}>
            <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
              FOI PARFAITE
            </textPath>
          </text>

          {/* Decorative Orange Dots */}
          <circle cx="25" cy="100" r="6" fill="#E08E39" />
          <circle cx="175" cy="100" r="6" fill="#E08E39" />

          {/* Center Content Group */}
          <g transform="translate(10, 10) scale(0.9)">
            {/* Flame */}
            <path d="M 100,90 Q 115,60 100,30 Q 85,60 100,90 Z" fill="#FF4500" />
            <path d="M 100,85 Q 110,65 100,45 Q 90,65 100,85 Z" fill="#FFD700" />
            
            {/* Open Bible */}
            <path d="M 60,105 Q 100,90 140,105 L 140,115 Q 100,100 60,115 Z" fill="#723223" />
            <path d="M 60,105 Q 100,90 140,105 L 140,107 Q 100,92 60,107 Z" fill="white" stroke="#723223" strokeWidth="1" />
            <line x1="100" y1="95" x2="100" y2="110" stroke="#723223" strokeWidth="1" />

            {/* Trumpets (Crossed behind Bible) */}
            <path d="M 75,100 L 50,85 L 55,78 L 80,93 Z" fill="#D4AF37" stroke="#967117" strokeWidth="0.5" />
            <path d="M 125,100 L 150,85 L 145,78 L 120,93 Z" fill="#D4AF37" stroke="#967117" strokeWidth="0.5" />
            
            {/* Scripture Verse */}
            <text x="100" y="135" textAnchor="middle" fill="#003594" fontSize="12" fontWeight="bold">
              Ephésiens 4:11-13
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};

