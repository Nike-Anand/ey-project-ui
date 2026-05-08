import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLE_COUNT = 15;

export default function CursorTrail() {
  const [mousePos, setMousePos] = useState(null);
  const [particles, setParticles] = useState([]);
  const requestRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateParticles = () => {
      if (!mousePos) return;

      setParticles((prev) => {
        const newParticle = {
          id: Math.random(), // more unique than Date.now() for high-rate frames
          x: mousePos.x,
          y: mousePos.y,
          size: Math.random() * 5 + 2,
          color: Math.random() > 0.5 ? '#00f0ff' : '#ff3366',
        };
        
        return [newParticle, ...prev].slice(0, PARTICLE_COUNT);
      });
      requestRef.current = requestAnimationFrame(updateParticles);
    };

    requestRef.current = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mousePos]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 1, opacity: 0.8, x: p.x, y: p.y }}
            animate={{ 
                scale: 0, 
                opacity: 0,
                x: p.x + (Math.random() - 0.5) * 40, 
                y: p.y + (Math.random() - 0.5) * 40 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: -p.size / 2,
              top: -p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              filter: `blur(${p.size / 3}px)`,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
