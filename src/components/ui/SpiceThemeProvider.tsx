'use client';

import { createContext, useContext, ReactNode } from 'react';
import { spiceTheme } from '@/lib/theme';

const SpiceThemeContext = createContext(spiceTheme);

export function SpiceThemeProvider({ children }: { children: ReactNode }) {
  return (
    <SpiceThemeContext.Provider value={spiceTheme}>
      <div className="spice-theme">
        {children}
        <style jsx global>{`
          @keyframes spice-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes spice-glow {
            from { box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }
            to { box-shadow: 0 0 30px rgba(249, 115, 22, 0.8); }
          }
          
          @keyframes spice-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .spice-float {
            animation: spice-float 6s ease-in-out infinite;
          }

          .spice-glow {
            animation: spice-glow 2s ease-in-out infinite alternate;
          }

          .spice-pulse {
            animation: spice-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .spice-gradient {
            background: linear-gradient(135deg, #f97316 0%, #dc2626 50%, #eab308 100%);
          }

          .spice-pattern {
            background-image: 
              radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(220, 38, 38, 0.1) 0%, transparent 50%);
          }

          .tamil-text {
            font-family: 'Noto Sans Tamil', sans-serif;
          }
        `}</style>
      </div>
    </SpiceThemeContext.Provider>
  );
}

export const useSpiceTheme = () => useContext(SpiceThemeContext);
