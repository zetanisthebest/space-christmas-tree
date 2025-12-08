
import React from 'react';
import { TreeState } from '../types';

interface UIOverlayProps {
  currentState: TreeState;
  onToggle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ currentState, onToggle, isMuted, onToggleMute }) => {
  const isTree = currentState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      
      {/* Top Title - Gold Dust Reveal Animation with Shimmer */}
      <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none">
        <h1 
          className={`
            relative
            font-serif text-center tracking-[0.2em]
            text-3xl md:text-5xl lg:text-6xl
            bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B]
            text-transparent bg-clip-text
            transition-all duration-2000 ease-out
            ${isTree ? 'animate-reveal opacity-100' : 'opacity-0 blur-lg scale-110'}
          `}
          style={{
            // Fallback drop shadow to simulate glow/ink bleed
            filter: isTree ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' : 'none'
          }}
        >
          {/* Shimmer overlay */}
          {isTree && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer-text opacity-30" 
                  style={{
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text'
                  }}
            />
          )}
          MERRY CHRISTMAS
        </h1>
      </div>

      {/* Mute Toggle Button - Top Right with Audio Visualizer */}
      <div className="absolute top-10 right-10 pointer-events-auto">
        <button
          onClick={onToggleMute}
          className={`
            relative group p-3 rounded-full 
            border border-arix-gold/30 bg-arix-dark/50 
            text-arix-gold/70 hover:text-arix-gold hover:bg-arix-dark/80 hover:border-arix-gold
            backdrop-blur-sm transition-all duration-300
            ${!isMuted && 'shadow-[0_0_15px_rgba(212,175,55,0.3)]'}
          `}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {/* Audio Visualizer Ring - Always show to indicate audio is playing in background */}
          <div className="absolute inset-0 rounded-full">
            {/* Pulsing ring 1 */}
            <div className={`absolute inset-0 rounded-full border-2 animate-[pulse-ring_2s_ease-in-out_infinite] ${isMuted ? 'border-arix-gold/20' : 'border-arix-gold/40'}`} />
            {/* Pulsing ring 2 - delayed */}
            <div className={`absolute inset-0 rounded-full border-2 animate-[pulse-ring_2s_ease-in-out_0.5s_infinite] ${isMuted ? 'border-arix-gold/15' : 'border-arix-gold/30'}`} />
            {/* Pulsing ring 3 - more delayed */}
            <div className={`absolute inset-0 rounded-full border-2 animate-[pulse-ring_2s_ease-in-out_1s_infinite] ${isMuted ? 'border-arix-gold/10' : 'border-arix-gold/20'}`} />
          </div>
          
          {isMuted ? (
            // Muted Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 relative z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          ) : (
            // Sound Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 relative z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Assemble Button Positioned Bottom Center */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          onClick={onToggle}
          className={`
            relative overflow-hidden group
            px-10 py-3 
            border border-arix-gold
            bg-arix-dark/80 backdrop-blur-md
            font-serif text-lg text-arix-gold tracking-widest
            transition-all duration-500
            hover:bg-arix-gold hover:text-arix-dark hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]
          `}
        >
          <span className="relative z-10">
            {isTree ? "DISASSEMBLE" : "ASSEMBLE"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer { 
          100% { transform: translateX(100%); } 
        }
        @keyframes shimmer-text {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes reveal-swipe {
          0% { 
            clip-path: polygon(0 0, 0 100%, 0 100%, 0 0);
            transform: translateY(10px);
            filter: blur(10px);
          }
          100% { 
            clip-path: polygon(0 0, 0 100%, 100% 100%, 100% 0);
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .animate-reveal {
          animation: reveal-swipe 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-shimmer-text {
          animation: shimmer-text 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UIOverlay;