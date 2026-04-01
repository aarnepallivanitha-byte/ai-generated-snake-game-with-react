import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-[#00ffff] flex flex-col items-center font-digital selection:bg-[#ff00ff]/30 overflow-x-hidden relative screen-tear">
      <div className="fixed inset-0 static-noise" />
      <div className="fixed inset-0 scanlines" />
      
      <header className="w-full p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-[#ff00ff] mb-4 sm:mb-8 bg-black z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00ffff] border-2 border-[#ff00ff] shadow-[4px_4px_0px_#ff00ff] flex items-center justify-center">
            <div className="w-6 h-6 bg-black border border-[#00ffff]"></div>
          </div>
          <h1 
            className="text-3xl sm:text-4xl font-pixel tracking-widest text-[#00ffff] glitch-effect uppercase"
            data-text="SYS.SNAKE"
          >
            SYS.SNAKE
          </h1>
        </div>
        <MusicPlayer />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-12 z-10 relative">
        <SnakeGame />
      </main>
    </div>
  );
}
