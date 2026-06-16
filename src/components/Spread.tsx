import React, { useState, useEffect } from 'react';
import { majorArcana, TarotCard } from '../data/tarot';
import { motion } from 'motion/react';
import { SpreadType } from '../types';
import { RefreshCw } from 'lucide-react';
import { cn } from '../utils';

interface SpreadProps {
  type: SpreadType;
  onReadingComplete: (cards: TarotCard[]) => void;
  isInterpreting: boolean;
}

const FAN_DEGREES = 80;

export function Spread({ type, onReadingComplete, isInterpreting }: SpreadProps) {
  const numCards = type === 'Kartu Harian' ? 1 : 3;
  const [deck, setDeck] = useState<TarotCard[]>(() => {
    return [...majorArcana].sort(() => Math.random() - 0.5);
  });
  
  // Array of indices from deck that have been drawn
  const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
  // Indices that have been fully flipped
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // Calculate remaining indices
  const fanIndices = deck.map((_, i) => i).filter(i => !drawnIndices.includes(i));

  const handleCardClick = (index: number) => {
    if (drawnIndices.length < numCards) {
      if (!drawnIndices.includes(index)) {
        setDrawnIndices(prev => [...prev, index]);
      }
    } else if (drawnIndices.includes(index)) {
      if (!flippedIndices.includes(index)) {
        flipCard(index);
      }
    }
  };

  const flipCard = (index: number) => {
    setFlippedIndices(prev => {
      const next = [...prev, index];
      if (next.length === numCards) {
        setTimeout(() => {
           onReadingComplete(drawnIndices.map(i => deck[i]));
        }, 800);
      }
      return next;
    });
  };

  const resetSpread = () => {
    setDeck([...majorArcana].sort(() => Math.random() - 0.5));
    setDrawnIndices([]);
    setFlippedIndices([]);
  };

  const labelMap = ['Masa Lalu', 'Masa Kini', 'Masa Depan'];

  // Card view helper
  const renderCard = (card: TarotCard, i: number) => {
    const isDrawn = drawnIndices.includes(i);
    const drawSlot = drawnIndices.indexOf(i);
    const isFlipped = flippedIndices.includes(i);
    
    // Position for fan
    const fanIdx = fanIndices.indexOf(i);
    const totalFan = fanIndices.length;
    const mid = (totalFan - 1) / 2;
    const offset = fanIdx - mid;
    const rotation = totalFan > 1 ? offset * (FAN_DEGREES / totalFan) : 0;
    
    // Animated styles
    let x = 0;
    let y = 0;
    let rotate = 0;
    let scale = 1;
    let zIndex = i;

    if (isDrawn) {
      // Calculate position in the drawn slots.
      // We'll roughly center them.
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const slotWidth = isMobile ? 80 : 120; // Desktop vs Mobile slot allocation width
      const gap = isMobile ? 20 : 40;
      const totalWidth = (slotWidth * numCards) + (gap * (numCards - 1));
      const startX = -(totalWidth / 2) + (slotWidth / 2);
      
      x = startX + (drawSlot * (slotWidth + gap));
      y = isMobile ? -230 : -220; // Move up to reading area
      rotate = 0; // Straigthen
      scale = isMobile ? 1.4 : 1.2; // Make bigger (since actual w is 80 or 110)
      zIndex = 100 + drawSlot; // Bring above fan
      
      // A slight varied rotation for dramatic flair like the reference image
      if (drawSlot === 0 && numCards === 3) rotate = -8;
      if (drawSlot === 2 && numCards === 3) rotate = 8;
      
    } else {
      // Fan position
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const xFactor = isMobile ? 11 : 16;
      x = offset * xFactor; 
      y = Math.abs(offset) * 2; 
      rotate = rotation;
    }

    return (
      <motion.div
        key={card.id + i}
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
           opacity: 1, 
           x, 
           y, 
           rotate,
           scale
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ zIndex }}
        className="absolute bottom-0 w-[80px] md:w-[110px] aspect-[2/3] cursor-pointer origin-bottom drop-shadow-xl hover:z-50"
        onClick={() => handleCardClick(i)}
        whileHover={!isDrawn ? { y: y - 20, scale: 1.1, zIndex: 90 } : {}}
      >
        <motion.div
          className="w-full h-full relative transform-style-3d rounded-lg shadow-2xl transition-all duration-300"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {/* Back of Card */}
          <div className="absolute w-full h-full backface-hidden rounded-md bg-blue-900 border-2 border-white flex flex-col items-center overflow-hidden">
             {/* Simple star pattern back like in the screenshot */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60"></div>
             {/* The reference has blue background with gold stars and white border */}
             <div className="w-full h-full flex flex-col items-center justify-evenly py-2 relative z-10 px-1 opacity-50">
               {Array.from({length: 6}).map((_, j) => (
                 <div key={j} className="w-1 h-1 bg-yellow-400 rotate-45 self-center"></div>
               ))}
             </div>
          </div>

          {/* Front of Card */}
          <div className="absolute w-full h-full backface-hidden rounded-md rotate-y-180 bg-mystic-900 border-2 border-accent-gold overflow-hidden flex flex-col">
            <div className="w-full h-[85%] relative">
               <img src={card.image} alt={card.name} className="w-full h-full object-cover object-center" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/20 to-transparent opacity-50"></div>
            </div>
            <div className="h-[15%] w-full flex items-center justify-center bg-[#fdfbf7] text-black font-serif text-[6px] md:text-[8px] border-t border-gray-300 tracking-widest uppercase font-bold text-center leading-none p-0.5">
              {card.name}
            </div>
            
            {/* Dark badge circle like in image */}
            <div className="absolute top-1 left-1 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[8px] font-bold">
               {drawSlot + 1}
            </div>
          </div>
        </motion.div>
        
        {/* Draw slots label */}
        {isDrawn && !isFlipped && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="absolute -bottom-6 w-full text-center text-[8px] md:text-[10px] font-sans font-bold uppercase text-accent whitespace-nowrap"
          >
            Buka Kartu
          </motion.div>
        )}
        {isDrawn && type === 'Tiga Kartu (Lalu, Kini, Nanti)' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="absolute -bottom-10 w-full text-center text-[8px] md:text-[9px] font-sans tracking-[0.2em] uppercase opacity-60 text-text-primary whitespace-nowrap"
          >
            {labelMap[drawSlot]}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[500px]">
      
      {drawnIndices.length < numCards && (
        <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }}
           className="mb-8 p-6 text-center max-w-md z-[100]"
        >
          <p className="font-serif italic text-lg leading-relaxed mb-3 text-text-primary">
            Silakan pilih {numCards} kartu dari tebaran ini.
          </p>
        </motion.div>
      )}

      {/* Spreading Stage */}
      <div className="relative w-full h-[400px] flex items-end justify-center mb-10 overflow-visible mt-20">
        {deck.map((card, i) => renderCard(card, i))}
      </div>

      {drawnIndices.length === numCards && flippedIndices.length === numCards && !isInterpreting && (
         <button 
          onClick={resetSpread}
          className="mt-6 border border-text-secondary/20 bg-bg-secondary/50 px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-sans uppercase font-bold tracking-widest text-text-secondary hover:text-accent transition-colors"
         >
           <RefreshCw size={14} />
           <span>Tebar Ulang</span>
         </button>
      )}

    </div>
  );
}
