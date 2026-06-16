import React, { useState } from 'react';
import { Card } from './Card';
import { majorArcana, TarotCard } from '../data/tarot';
import { motion } from 'motion/react';
import { SpreadType } from '../types';
import { RefreshCw } from 'lucide-react';

interface SpreadProps {
  type: SpreadType;
  onReadingComplete: (cards: TarotCard[]) => void;
  isInterpreting: boolean;
}

export function Spread({ type, onReadingComplete, isInterpreting }: SpreadProps) {
  const numCards = type === 'Kartu Harian' ? 1 : 3;
  const [deck, setDeck] = useState<TarotCard[]>(() => {
    // Shuffle the deck initially
    const shuffled = [...majorArcana].sort(() => Math.random() - 0.5);
    return shuffled;
  });
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleDraw = () => {
    if (drawnCards.length >= numCards) return;
    const newCard = deck[drawnCards.length];
    setDrawnCards([...drawnCards, newCard]);
  };

  const handleFlip = (index: number) => {
    setFlippedCards(prev => {
      const next = { ...prev, [index]: true };
      
      // Check if all drawn cards are flipped and we have drawn the right amount
      if (Object.keys(next).length === numCards && drawnCards.length === numCards) {
        setTimeout(() => {
           onReadingComplete(drawnCards);
        }, 800);
      }
      return next;
    });
  };

  const resetSpread = () => {
    setDeck([...majorArcana].sort(() => Math.random() - 0.5));
    setDrawnCards([]);
    setFlippedCards({});
  };

  const labelMap = ['Masa Lalu', 'Masa Kini', 'Masa Depan'];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[500px]">
      
      {drawnCards.length < numCards && (
        <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }}
           className="mb-8 p-6 bg-bg-secondary/80 backdrop-blur rounded-xl border border-text-secondary/20 text-center max-w-md"
        >
          <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] mb-4 text-text-secondary">Pusatkan Pikiran Anda</h3>
          <p className="italic text-sm leading-relaxed mb-3 text-text-primary">
            Bernapaslah dalam-dalam. Pertimbangkan pertanyaan atau fokus Anda hari ini. 
            Tekan dek kartu untuk menarik kartu ke-{drawnCards.length + 1} dari {numCards}.
          </p>
          <button 
            onClick={handleDraw}
            className="w-full py-2 bg-text-secondary text-bg-primary text-[10px] font-sans font-bold uppercase rounded-lg tracking-widest shadow-lg shadow-text-secondary/20 hover:scale-[1.02] transition-transform"
          >
            Tarik Kartu
          </button>
        </motion.div>
      )}

      <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-4">
        {drawnCards.map((card, idx) => (
           <div key={card.id + idx} className="flex flex-col items-center">
              {type === 'Tiga Kartu (Lalu, Kini, Nanti)' && (
                <div className="text-xs font-sans tracking-[0.3em] uppercase opacity-40 mb-4">
                  {labelMap[idx]}
                </div>
              )}
              <Card 
                card={card} 
                index={idx} 
                isFlipped={!!flippedCards[idx]} 
                onClick={() => handleFlip(idx)} 
              />
              {!flippedCards[idx] && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-[10px] font-sans uppercase font-bold text-accent"
                >
                  Ketuk untuk membuka
                </motion.div>
              )}
           </div>
        ))}
      </div>

      {drawnCards.length === numCards && Object.keys(flippedCards).length === numCards && !isInterpreting && (
         <button 
          onClick={resetSpread}
          className="mt-12 flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
         >
           <RefreshCw size={18} />
           <span>Baca Ulang</span>
         </button>
      )}

    </div>
  );
}
