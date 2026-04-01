import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'SYS.AUDIO.01_RAW', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'SYS.AUDIO.02_CORRUPT', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'SYS.AUDIO.03_OVERRIDE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-black p-3 sm:px-5 border-2 border-[#00ffff] shadow-[4px_4px_0px_#ff00ff] relative overflow-hidden">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={nextTrack}
        loop={false}
      />
      
      <div className="flex flex-col mr-2 text-center sm:text-left z-10">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-xs text-[#ff00ff] font-pixel tracking-widest mb-1 uppercase">
          <Terminal size={12} className={isPlaying ? "animate-pulse" : ""} />
          <span>[AUDIO_SUBSYSTEM_ACTIVE]</span>
        </div>
        <div className="text-xl sm:text-2xl font-digital text-[#00ffff] truncate w-40 sm:w-48">
          {'>'} {currentTrack.title}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 z-10">
        <button onClick={prevTrack} className="p-2 bg-black border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-colors shadow-[2px_2px_0px_#ff00ff]">
          <SkipBack size={20} />
        </button>
        <button 
          onClick={togglePlay} 
          className="p-3 bg-[#ff00ff] border-2 border-[#00ffff] text-black hover:bg-black hover:text-[#ff00ff] transition-colors shadow-[4px_4px_0px_#00ffff]"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={nextTrack} className="p-2 bg-black border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-colors shadow-[2px_2px_0px_#ff00ff]">
          <SkipForward size={20} />
        </button>
        <div className="w-1 h-6 bg-[#ff00ff] mx-1 sm:mx-2"></div>
        <button onClick={toggleMute} className="p-2 bg-black border border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black transition-colors shadow-[2px_2px_0px_#00ffff]">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}
