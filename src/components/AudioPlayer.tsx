import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AudioPlayer({ enabled }: { enabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(enabled);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // We use a public domain or free ambient sound link
    const audio = audioRef.current;
    
    if (enabled && isPlaying) {
      audio.play().catch(e => console.log('Audio autoplay prevented', e));
    } else {
      audio.pause();
    }
  }, [enabled, isPlaying]);

  useEffect(() => {
    setIsPlaying(enabled);
  }, [enabled]);

  return (
    <div 
       className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 p-3 bg-bg-primary/90 backdrop-blur border border-text-secondary/10 rounded-xl shadow-xl flex items-center gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer" 
       onClick={() => setIsPlaying(!isPlaying)}
       title="Toggle Audio"
    >
      <audio 
        ref={audioRef} 
        src="https://upload.wikimedia.org/wikipedia/commons/0/05/Nature_sounds_-_birds%2C_wind%2C_stream_-_1_min.ogg" 
        loop
      />
      
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-text-secondary text-bg-primary' : 'bg-text-secondary/10 text-text-secondary'}`}>
        {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </div>
      
      <div className="overflow-hidden pr-2">
        <p className="text-[10px] font-bold text-text-primary uppercase tracking-widest truncate">Nature Ambience</p>
        <p className="text-[8px] uppercase tracking-widest text-text-secondary opacity-70 mt-0.5">{isPlaying ? "Active" : "Muted"}</p>
      </div>

      {isPlaying && (
        <div className="flex gap-1 items-end h-4 ml-1">
          <div className="w-1 h-3 bg-text-secondary/30 rounded-full animate-pulse"></div>
          <div className="w-1 h-full bg-text-secondary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-2 bg-text-secondary/30 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1 h-3 bg-text-secondary/60 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
        </div>
      )}
    </div>
  );
}
