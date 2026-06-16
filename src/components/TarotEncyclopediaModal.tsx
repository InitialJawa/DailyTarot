import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { majorArcana, TarotCard } from '../data/tarot';
import { Book, X, ChevronRight, ChevronLeft, Sparkles, RefreshCw, Bird } from 'lucide-react';
import Markdown from 'react-markdown';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface TarotEncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TarotEncyclopediaModal({ isOpen, onClose }: TarotEncyclopediaModalProps) {
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterpretation = async (card: TarotCard, reversed: boolean) => {
    setIsLoading(true);
    setInterpretation(null);
    setError(null);
    try {
      const cardId = `${card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${reversed ? 'reversed' : 'upright'}`;
      
      // 1. Check Firestore Cache
      const docRef = doc(db, 'encyclopedia_cache', cardId);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().interpretation) {
           setInterpretation(docSnap.data().interpretation);
           setIsLoading(false);
           return;
        }
      } catch (cacheErr) {
        console.warn("Firestore cache fetch failed, falling back to API:", cacheErr);
      }

      // 2. Not in cache, fetch from API
      const response = await fetch('/api/interpret-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardName: card.name,
          arcana: card.arcana,
          isReversed: reversed
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const newInterpretation = data.text;
      setInterpretation(newInterpretation);

      // 3. Save to Cache if user is signed in
      if (auth.currentUser) {
         try {
            await setDoc(docRef, {
               interpretation: newInterpretation,
               createdAt: serverTimestamp()
            });
         } catch (saveErr) {
            console.warn("Failed to cache interpretation to firestore:", saveErr);
         }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil interpretasi kartu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (card: TarotCard) => {
    setSelectedCard(card);
    setIsReversed(false);
    fetchInterpretation(card, false);
  };

  const handleToggleReversed = () => {
    if (!selectedCard) return;
    const newReversed = !isReversed;
    setIsReversed(newReversed);
    fetchInterpretation(selectedCard, newReversed);
  };

  const handleBack = () => {
    setSelectedCard(null);
    setInterpretation(null);
    setIsReversed(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-primary text-text-primary w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border border-text-secondary/20"
        >
          <div className="flex flex-shrink-0 items-center justify-between p-6 border-b border-text-secondary/10">
            <div className="flex items-center gap-4">
              {selectedCard && (
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-text-secondary/10 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <h2 className="text-xl font-serif font-bold italic flex items-center gap-2 text-accent">
                <Book size={20} />
                <span>Ensiklopedia Tarot</span>
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-text-secondary/10 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {!selectedCard ? (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <div className="mb-8">
                     <h3 className="text-sm font-sans font-bold uppercase tracking-[0.2em] mb-4 text-text-secondary">Major Arcana</h3>
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {majorArcana.map((card) => (
                           <button 
                             key={card.id}
                             onClick={() => handleCardClick(card)}
                             className="group flex flex-col items-center gap-2"
                           >
                             <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-text-secondary/20 group-hover:border-accent transition-colors shadow-sm group-hover:shadow-md">
                               <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                             </div>
                             <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-text-secondary group-hover:text-accent text-center mt-1">
                               {card.number}. {card.name}
                             </span>
                           </button>
                        ))}
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 md:p-10 flex flex-col md:flex-row gap-10 h-full"
                >
                   <div className="flex flex-col items-center flex-shrink-0 w-full md:w-auto">
                     <motion.div 
                       animate={{ rotate: isReversed ? 180 : 0 }}
                       transition={{ duration: 0.6, ease: "easeInOut" }}
                       className="w-48 sm:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-text-secondary/20 relative"
                     >
                       <img src={selectedCard.image} alt={selectedCard.name} className="w-full h-full object-cover" />
                     </motion.div>
                     
                     <button
                       onClick={handleToggleReversed}
                       className="mt-6 flex items-center justify-center gap-2 px-6 py-2 rounded-full border border-text-secondary/20 hover:border-accent hover:text-accent transition-colors text-[10px] font-bold uppercase tracking-widest"
                     >
                       <RefreshCw size={14} className={isReversed ? "rotate-180 transition-transform" : "transition-transform"} />
                       {isReversed ? "Ubah ke Posisi Tegak" : "Ubah ke Posisi Terbalik"}
                     </button>
                   </div>
                   
                   <div className="flex-1 w-full flex flex-col">
                     <h3 className="text-3xl font-serif italic text-accent mb-2">
                       {selectedCard.name} <span className="opacity-50 text-xl">({isReversed ? 'Terbalik' : 'Tegak'})</span>
                     </h3>
                     <div className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-8 pb-4 border-b border-text-secondary/10">
                       {selectedCard.arcana} Arcana • Nomor {selectedCard.number}
                     </div>

                     {isLoading ? (
                       <div className="flex-1 flex flex-col items-center justify-center gap-4 text-accent h-64">
                         <motion.div
                           animate={{ y: [0, -10, 0] }}
                           transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                         >
                           <Bird size={36} className="opacity-80" strokeWidth={1.5} />
                         </motion.div>
                         <p className="font-serif italic text-sm text-text-secondary">Menyelami makna rahasia dari {selectedCard.name}...</p>
                       </div>
                     ) : error ? (
                       <div className="flex-1 flex flex-col items-center justify-center gap-2 h-64 text-red-500">
                         <p>{error}</p>
                         <button onClick={() => fetchInterpretation(selectedCard, isReversed)} className="underline text-sm mt-2">Coba Lagi</button>
                       </div>
                     ) : interpretation ? (
                       <div className="markdown-body flex-1 w-full text-text-primary/90">
                         <Markdown>{interpretation}</Markdown>
                       </div>
                     ) : null}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
