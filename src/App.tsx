/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Spread } from './components/Spread';
import { AudioPlayer } from './components/AudioPlayer';
import { ProfileModal } from './components/ProfileModal';
import { SpreadType, UserProfile, Reading } from './types';
import { generateId } from './utils';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Settings, Sparkles, UserCircle } from 'lucide-react';
import { TarotCard } from './data/tarot';

import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, loginWithGoogle, logout } from './lib/firebase';

const DEFAULT_PROFILE: UserProfile = {
  name: "Pencari Jati Diri",
  theme: 'dark-mystic',
  soundEnabled: true,
  history: []
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tarotProfile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [spreadType, setSpreadType] = useState<SpreadType>('Kartu Harian');
  const [question, setQuestion] = useState('');
  const [currentReading, setCurrentReading] = useState<Reading | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // fetch history
            const historySnapshot = await getDocs(collection(db, 'users', firebaseUser.uid, 'readings'));
            const historyData = historySnapshot.docs.map(d => d.data() as Reading);
            
            setProfile(prev => ({
              ...prev,
              name: data.name || prev.name,
              theme: data.theme || prev.theme,
              soundEnabled: data.soundEnabled !== undefined ? data.soundEnabled : prev.soundEnabled,
              history: historyData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            }));
            
          } else {
            // create initial doc
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              name: firebaseUser.displayName || DEFAULT_PROFILE.name,
              theme: DEFAULT_PROFILE.theme,
              soundEnabled: DEFAULT_PROFILE.soundEnabled,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            if(firebaseUser.displayName) {
                setProfile(prev => ({...prev, name: firebaseUser.displayName!}));
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        // Fallback to local profile when logged out
        const saved = localStorage.getItem('tarotProfile');
        setProfile(saved ? JSON.parse(saved) : DEFAULT_PROFILE);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('tarotProfile', JSON.stringify(profile));
    
    // Clear existing theme classes
    document.documentElement.classList.remove('theme-dark-mystic', 'theme-minimalis', 'theme-alam');
    
    // Switch to dark mode standard for tailwind prose support if 'dark-mystic'
    if (profile.theme === 'dark-mystic') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (profile.theme !== 'light') {
      document.documentElement.classList.add(`theme-${profile.theme}`);
    }
  }, [profile]);

  useEffect(() => {
    // Simulated daily notification
    if ("Notification" in window && Notification.permission === "granted") {
      const lastNotified = localStorage.getItem('tarotLastNotified');
      const today = new Date().toDateString();
      if (lastNotified !== today) {
        new Notification("Sudahkah Anda bermeditasi hari ini?", {
          body: "Buka kartu Tarot harian Anda untuk wawasan baru.",
          icon: "/favicon.ico"
        });
        localStorage.setItem('tarotLastNotified', today);
      }
    }
  }, []);

  const requestNotification = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    
    // Sync config to Firestore
    if (user && (updates.theme || updates.soundEnabled !== undefined || updates.name)) {
      try {
        const toSave: any = { updatedAt: serverTimestamp() };
        if (updates.theme) toSave.theme = updates.theme;
        if (updates.soundEnabled !== undefined) toSave.soundEnabled = updates.soundEnabled;
        if (updates.name) toSave.name = updates.name;
        
        await setDoc(doc(db, 'users', user.uid), toSave, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const handleReadingComplete = async (cards: TarotCard[]) => {
    setIsInterpreting(true);
    try {
      let interpretationText = "";
      try {
        const response = await fetch('/api/interpret-tarot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: spreadType, cards, question })
        });
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        interpretationText = data.text;
      } catch (apiErr) {
        console.warn("Using offline interpretation", apiErr);
        const { generateOfflineInterpretation } = await import('./lib/offline-interpret');
        interpretationText = await generateOfflineInterpretation(cards, spreadType, question);
      }

      const newReading: Reading = {
        id: generateId(),
        date: new Date().toISOString(),
        type: spreadType,
        cards,
        question,
        interpretation: interpretationText
      };

      setCurrentReading(newReading);
      
      // Save to profile history locally
      handleUpdateProfile({
        history: [...profile.history, newReading]
      });

      // Save to Firestore
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'readings', newReading.id), {
            ...newReading,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/readings/${newReading.id}`);
        }
      }

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses kesimpulan.");
    } finally {
      setIsInterpreting(false);
    }
  };

  const shareText = currentReading 
    ? `Bacaan ${currentReading.type} saya hari ini:\n${currentReading.cards.map(c => c.name).join(' | ')}\n\n"Kartu membawa wawasan, kita yang menentukan jalan."` 
    : "";
  const shareUrl = encodeURIComponent(window.location.href);
  const encodedShareText = encodeURIComponent(shareText);

  const handleShare = async () => {
    if (!currentReading) return;
    if (navigator.share) {
      try {
         await navigator.share({
           title: 'Aura Tarot - Bacaan Saya',
           text: shareText,
           url: window.location.href,
         });
      } catch (err) {
         console.log("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Teks berhasil disalin untuk dibagikan!");
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-8 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-text-secondary/10">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-xl font-bold tracking-tight uppercase text-text-primary">Tarot Mystic</h1>
          <p className="text-[10px] uppercase tracking-widest text-text-secondary opacity-70">Wawasan & Panduan Spiritual</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
             onClick={requestNotification}
             className="text-[10px] font-sans font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-text-secondary/20 text-text-secondary hover:text-accent transition-colors hidden md:block"
          >
            Aktifkan Pengingat
          </button>
          <button 
             onClick={() => setIsProfileOpen(true)}
             className="w-10 h-10 rounded-full bg-text-secondary/10 border border-text-secondary/20 flex items-center justify-center text-accent hover:bg-text-secondary/20 transition-colors"
          >
             <UserCircle size={24} />
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        
        {!currentReading && !isInterpreting && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto mb-12 bg-bg-secondary/50 backdrop-blur rounded-2xl p-6 border border-text-secondary/10"
          >
            <div className="mb-6">
              <label className="block text-[10px] font-sans font-bold mb-3 text-text-secondary uppercase tracking-[0.2em]">Tipe Pembacaan</label>
              <div className="flex gap-2">
                {(['Kartu Harian', 'Tiga Kartu (Lalu, Kini, Nanti)'] as SpreadType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSpreadType(type)}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${spreadType === type ? 'bg-accent text-accent-foreground shadow-md' : 'bg-bg-primary text-text-primary hover:bg-bg-secondary border border-text-secondary/10'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-sans font-bold mb-2 text-text-secondary uppercase tracking-[0.2em]">Fokus atau Pertanyaan (Opsional)</label>
              <input 
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Apa yang ingin alam semesta sampaikan pada saya?"
                className="w-full bg-bg-primary border border-text-secondary/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
              />
            </div>
          </motion.div>
        )}

        {/* Spread Area */}
        <AnimatePresence mode="wait">
          {!currentReading && (
            <motion.div key="spread" exit={{ opacity: 0 }} className="w-full">
               <Spread 
                  type={spreadType} 
                  onReadingComplete={handleReadingComplete} 
                  isInterpreting={isInterpreting} 
               />
               
               {isInterpreting && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="mt-12 flex flex-col items-center gap-4 text-accent"
                 >
                   <Sparkles className="animate-spin" size={32} />
                   <p className="font-serif italic text-lg text-text-secondary">Menyusun benang-benang takdir...</p>
                 </motion.div>
               )}
            </motion.div>
          )}

          {/* Reading Result */}
          {currentReading && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl mx-auto rounded-3xl bg-bg-secondary p-8 md:p-12 border border-text-secondary/10 shadow-2xl relative"
            >
               <button 
                 onClick={() => {
                   setCurrentReading(null);
                   setQuestion('');
                 }}
                 className="absolute top-6 right-6 text-[10px] font-sans font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors"
               >
                 Tutup
               </button>

               <div className="flex flex-col items-center mb-10 text-center">
                 <h2 className="text-4xl font-light italic text-accent mb-2">{currentReading.type}</h2>
                 <p className="text-xs font-sans tracking-[0.3em] uppercase opacity-40">"{currentReading.question || 'Fokus pada intuisi'}"</p>
               </div>

               <div className="max-w-none mb-10 text-text-primary">
                 <div className="markdown-body">
                   <Markdown>{currentReading.interpretation || ''}</Markdown>
                 </div>
               </div>

               <div className="flex flex-col items-center border-t border-text-secondary/10 pt-8 gap-4 mt-8">
                 <button 
                   onClick={handleShare}
                   className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-sans font-bold text-xs uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-transform w-[220px] justify-center"
                 >
                   Bagikan Hasil
                   <Share2 size={14} />
                 </button>
                 
                 <div className="flex items-center gap-4 mt-2">
                   <a 
                     href={`https://twitter.com/intent/tweet?text=${encodedShareText}&url=${shareUrl}`}
                     target="_blank" 
                     rel="noreferrer"
                     className="text-[10px] font-sans font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors border border-text-secondary/20 px-3 py-1.5 rounded-full"
                   >
                     Twitter
                   </a>
                   <a 
                     href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodedShareText}`}
                     target="_blank" 
                     rel="noreferrer"
                     className="text-[10px] font-sans font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors border border-text-secondary/20 px-3 py-1.5 rounded-full"
                   >
                     Facebook
                   </a>
                   <a 
                     href={`https://wa.me/?text=${encodedShareText}%20${shareUrl}`}
                     target="_blank" 
                     rel="noreferrer"
                     className="text-[10px] font-sans font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors border border-text-secondary/20 px-3 py-1.5 rounded-full"
                   >
                     WhatsApp
                   </a>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AudioPlayer enabled={profile.soundEnabled} />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        updateProfile={handleUpdateProfile}
      />
    </div>
  );
}
