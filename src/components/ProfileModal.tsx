import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, SpreadType, ThemeOption } from '../types';
import { X, Moon, Sun, History, Leaf, Square, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../lib/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileModal({ isOpen, onClose, profile, updateProfile }: ProfileModalProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

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
          className="bg-bg-primary text-text-primary w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border border-text-secondary/20"
        >
          <div className="flex items-center justify-between p-6 border-b border-text-secondary/10">
            <h2 className="text-xl font-serif font-bold italic flex items-center gap-2 text-accent">
              <History size={20} />
              <span>Profil Spiritual</span>
            </h2>
            <div className="flex items-center gap-4">
              {user ? (
                 <button 
                   onClick={logout}
                   className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-text-secondary hover:text-accent transition-colors"
                 >
                   <LogOut size={14} /> Keluar
                 </button>
              ) : (
                 <button 
                   onClick={loginWithGoogle}
                   className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest bg-accent text-accent-foreground px-3 py-1.5 rounded-full hover:scale-105 transition-transform"
                 >
                   <LogIn size={14} /> Masuk 
                 </button>
              )}
              <button onClick={onClose} className="p-2 rounded-full hover:bg-text-secondary/10 transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-8">
              {/* Personal Info Section */}
              <section>
                <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] mb-4 text-text-secondary">Informasi Pribadi</h3>
                <p className="text-[10px] text-text-secondary mb-4 opacity-70">Informasi ini akan membantu AI memberikan bacaan tarot yang lebih relevan dan akurat untuk Anda.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tanggal Lahir</label>
                    <input 
                      type="date" 
                      value={profile.birthDate || ''}
                      onChange={(e) => updateProfile({ birthDate: e.target.value })}
                      className="bg-bg-secondary border border-text-secondary/20 rounded-lg p-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Status Hubungan</label>
                    <select
                      value={profile.relationshipStatus || ''}
                      onChange={(e) => updateProfile({ relationshipStatus: e.target.value })}
                      className="bg-bg-secondary border border-text-secondary/20 rounded-lg p-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">Pilih Status</option>
                      <option value="Lajang">Lajang</option>
                      <option value="Berpacaran">Berpacaran</option>
                      <option value="Menikah">Menikah</option>
                      <option value="Rumit">Rumit</option>
                      <option value="Bercerai/Berpisah">Bercerai/Berpisah</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Kesibukan/Fokus Saat Ini</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Sedang mencari kerja, fokus kuliah, membangun bisnis..."
                      value={profile.currentActivity || ''}
                      onChange={(e) => updateProfile({ currentActivity: e.target.value })}
                      className="bg-bg-secondary border border-text-secondary/20 rounded-lg p-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </section>

              {/* Settings Section */}
              <section>
                <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] mb-4 text-text-secondary">Visual Theme</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => updateProfile({ theme: 'light' })}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${profile.theme === 'light' ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/50' : 'border-text-secondary/20 text-text-secondary hover:border-accent/50'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#fdfbf7] flex items-center justify-center border border-black/10">
                      <Sun size={14} className={profile.theme === 'light' ? 'text-accent' : 'text-text-secondary'}/>
                    </div>
                    Natural
                  </button>
                  <button 
                    onClick={() => updateProfile({ theme: 'dark-mystic' })}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${profile.theme === 'dark-mystic' ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/50' : 'border-text-secondary/20 text-text-secondary hover:border-accent/50'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/10">
                       <Moon size={14} className={profile.theme === 'dark-mystic' ? 'text-accent' : 'text-white'}/>
                    </div>
                    Mystic
                  </button>
                  <button 
                    onClick={() => updateProfile({ theme: 'minimalis' })}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${profile.theme === 'minimalis' ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/50' : 'border-text-secondary/20 text-text-secondary hover:border-accent/50'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#ffffff] flex items-center justify-center border border-black/10">
                       <Square size={14} className={profile.theme === 'minimalis' ? 'text-accent' : 'text-black'}/>
                    </div>
                    Minimalis
                  </button>
                  <button 
                    onClick={() => updateProfile({ theme: 'alam' })}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${profile.theme === 'alam' ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/50' : 'border-text-secondary/20 text-text-secondary hover:border-accent/50'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#f1f8f5] flex items-center justify-center border border-black/10">
                       <Leaf size={14} className={profile.theme === 'alam' ? 'text-accent' : 'text-[#2d6a4f]'}/>
                    </div>
                    Alam
                  </button>
                </div>
              </section>

              {/* History Section */}
              <section>
                <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] mb-4 text-text-secondary">Riwayat Terakhir</h3>
                {profile.history.length === 0 ? (
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-70">Belum ada riwayat pembacaan.</p>
                ) : (
                  <div className="space-y-4">
                    {[...profile.history].reverse().map(reading => (
                      <div key={reading.id} className="p-4 rounded-xl bg-bg-secondary border border-text-secondary/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-accent">{reading.type}</div>
                          <div className="text-[10px] opacity-50">
                            {format(new Date(reading.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                          </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          {reading.cards.map(c => (
                            <span key={c.id} className="text-[10px] px-2 py-1 bg-accent/10 rounded flex items-center justify-center font-bold text-accent">
                              {c.name}
                            </span>
                          ))}
                        </div>
                        {reading.question && (
                          <p className="text-xs italic text-text-secondary mb-2">"{reading.question}"</p>
                        )}
                        <p className="text-sm line-clamp-3 text-text-primary/80 leading-relaxed font-sans">{reading.interpretation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
