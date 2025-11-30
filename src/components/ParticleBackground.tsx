import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, radius: 200 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.x;
      mouseRef.current.y = e.y;
    };

    const initParticles = () => {
      particlesRef.current = [];
      const numberOfParticles = (canvas.width * canvas.height) / 10000; 
      
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 0.5;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        
        // Deep Space Blue Palette
        const colors = [
          'rgba(34, 211, 238, ',  // Cyan-400 (Bright Cyan)
          'rgba(96, 165, 250, ',  // Blue-400 (Bright Blue)
          'rgba(129, 140, 248, ', // Indigo-400 (Soft Indigo)
          'rgba(255, 255, 255, ', // White (Stars)
          'rgba(56, 189, 248, ',  // Sky-400 (Deep Sky Blue)
        ];
        const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        
        particlesRef.current.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.2, // Slower movement for "space" feel
          vy: (Math.random() - 0.5) * 0.2,
          size,
          density: (Math.random() * 20) + 5,
          color: colorPrefix
        });
      }
    };

    const animate = () => {
      // Deep Space Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#020617'); // Slate-950 (Deepest Black-Blue)
      gradient.addColorStop(0.5, '#0f172a'); // Slate-900 (Mid Deep Blue)
      gradient.addColorStop(1, '#172554'); // Blue-950 (Rich Deep Blue)
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouseRef.current.radius;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * particle.density;
        const directionY = forceDirectionY * force * particle.density;

        if (distance < mouseRef.current.radius) {
          particle.x -= directionX;
          particle.y -= directionY;
        } else {
          if (particle.x !== particle.baseX) {
            const dxBase = particle.x - particle.baseX;
            particle.x -= dxBase / 40;
          }
          if (particle.y !== particle.baseY) {
            const dyBase = particle.y - particle.baseY;
            particle.y -= dyBase / 40;
          }
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx = -particle.vx;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy = -particle.vy;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.closePath();
        
        const opacity = distance < mouseRef.current.radius ? 0.9 : 0.4;
        ctx.fillStyle = particle.color + opacity + ')';
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950">
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
        />
        {/* Overlay Vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
};

export default ParticleBackground;
