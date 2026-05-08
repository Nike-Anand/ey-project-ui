import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 120;
const FRAME_PATH = '/street-frames/frame-';

export default function ScrollVideoCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const loadedImages = [];
      let loadedCount = 0;

      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameIndex = i.toString().padStart(3, '0');
        img.src = `${FRAME_PATH}${frameIndex}.jpg`;
        
        img.onload = () => {
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) {
            setImages(loadedImages);
            setIsLoaded(true);
          }
        };
        loadedImages.push(img);
      }
    };

    preloadImages();
  }, []);

  // Animation logic
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    const renderFrame = (index) => {
      if (images[index]) {
        const img = images[index];
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Cover calculation
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (canvasRatio > imgRatio) {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imgRatio;
          drawX = 0;
          drawY = (canvasHeight - drawHeight) / 2;
        } else {
          drawWidth = canvasHeight * imgRatio;
          drawHeight = canvasHeight;
          drawX = (canvasWidth - drawWidth) / 2;
          drawY = 0;
        }

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }
    };

    // Initialize first frame
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(0);

    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=600%', // High granularity
      pin: true,
      scrub: 0.5, // Frame-based scrubbing is naturally smoother
      onUpdate: (self) => {
        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(self.progress * TOTAL_FRAMES)
        );
        renderFrame(frameIndex);
        setProgress(self.progress);
      }
    });

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const currentFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(scrollTrigger.progress * TOTAL_FRAMES)
      );
      renderFrame(currentFrame);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      scrollTrigger.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded, images]);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Optimizing Neural Stream...</p>
          </div>
        </div>
      )}
      
      <canvas 
        ref={canvasRef}
        className="block w-full h-full object-cover opacity-60"
      />

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        
        {/* Story Phase 1: Idle (0-30%) */}
        {progress < 0.3 && isLoaded && (
          <div className="text-center px-4">
            <h2 className="text-6xl md:text-8xl text-primary font-display font-black uppercase tracking-[0.3em] animate-pulse text-outline-black">
              System Idle
            </h2>
            <p className="text-xl md:text-2xl text-white font-mono mt-6 uppercase tracking-widest font-bold text-outline-black">
              Awaiting Uplink...
            </p>
          </div>
        )}

        {/* Story Phase 2: Analysis (30-70%) */}
        {progress >= 0.3 && progress < 0.7 && (
          <div className="text-center px-4">
            <h2 className="text-6xl md:text-8xl text-secondary font-display font-black uppercase tracking-[0.2em] text-outline-black">
              Analyzing Data Lakes
            </h2>
            <div className="flex gap-2 justify-center mt-8">
               <div className="h-3 w-48 bg-secondary/20 rounded-full overflow-hidden border-2 border-secondary/40 shadow-[0_0_15px_rgba(191,0,255,0.4)]">
                  <div className="h-full bg-secondary animate-[shimmer_2s_infinite]" />
               </div>
            </div>
            <p className="text-xl md:text-2xl text-white font-mono mt-8 uppercase tracking-widest font-bold text-outline-black">
              Scanning for Anomalies
            </p>
          </div>
        )}

        {/* Story Phase 3: Optimization (70-100%) */}
        {progress >= 0.7 && (
          <div className="text-center px-4">
            <h2 className="text-primary font-display text-6xl md:text-8xl font-black uppercase tracking-[0.2em] text-outline-black drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]">
              Optimizing Systems
            </h2>
            <p className="text-xl md:text-2xl text-white font-mono mt-8 uppercase tracking-widest font-extrabold text-outline-black">
              Injecting Cost Efficiency Payloads
            </p>
          </div>
        )}

        {/* Dynamic HUD decoration */}
        <div className="absolute top-10 left-10 border-l border-t border-white/20 w-20 h-20 p-4">
           <div className="text-[10px] font-mono text-white/30 uppercase">Core Status: Active</div>
           <div className="text-[10px] font-mono text-white/30 uppercase">Sync: {Math.round(progress * 100)}%</div>
        </div>
        <div className="absolute bottom-10 right-10 border-r border-b border-white/20 w-20 h-20 flex flex-col justify-end items-end p-4">
           <div className="text-[10px] font-mono text-white/30 uppercase">V-SYNC: 0.99</div>
           <div className="text-[10px] font-mono text-white/30 uppercase">FPS: 60</div>
        </div>
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] pointer-events-none" />
    </div>
  );
}
