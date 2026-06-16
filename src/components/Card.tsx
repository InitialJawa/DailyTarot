import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TarotCard } from '../data/tarot';
import { cn } from '../utils';

interface CardProps {
  card: TarotCard;
  isFlipped: boolean;
  onClick: () => void;
  index: number;
}

export function Card({ card, isFlipped, onClick, index }: CardProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
      className="relative w-48 md:w-64 aspect-[2/3] cursor-pointer perspective-1000"
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative transform-style-3d round-xl shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,119,6,0.3)]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Back of Card */}
        <div className={cn(
          "absolute w-full h-full backface-hidden rounded-xl bg-mystic-900 border-[4px] border-accent flex items-center justify-center overflow-hidden shadow-2xl",
          ""
        )}>
           <div className="w-[80%] h-[80%] border border-accent/20 rounded relative flex items-center justify-center">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
             <div className="w-12 h-12 rotate-45 border border-accent/40 flex items-center justify-center">
               <div className="w-8 h-8 rotate-45 border border-accent/40 bg-accent/10"></div>
             </div>
           </div>
        </div>

        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden rounded-xl rotate-y-180 bg-mystic-900 border-[4px] border-accent-gold overflow-hidden flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.3)]">
          <div className="w-full h-[85%] relative">
             <img src={card.image} alt={card.name} className="w-full h-full object-cover object-center" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/20 to-transparent opacity-50"></div>
          </div>
          <div className="h-[15%] w-full flex items-center justify-center bg-mystic-900 text-accent-gold font-serif text-sm md:text-base border-t border-accent-gold/40 tracking-widest uppercase font-bold">
            {card.number > 0 ? `${card.number} . ` : ""}{card.name}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
