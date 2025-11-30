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
        
        // Aurora / Nebula Palette (Brighter & Colorful)
        const colors = [
          'rgba(255, 255, 255, ', // White (Stars)
          'rgba(167, 139, 250, ', // Violet-400
          'rgba(244, 114, 182, ', // Pink-400
          'rgba(56, 189, 248, ',  // Sky-400
          'rgba(45, 212, 191, ',  // Teal-400
        ];
        const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        
        particlesRef.current.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.3, 
          vy: (Math.random() - 0.5) * 0.3,
          size,
          density: (Math.random() * 20) + 5,
          color: colorPrefix
        });
      }
    };

    const animate = () => {
      // Aurora Gradient Background
      // Using a rich, vibrant gradient instead of deep black
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#4c1d95');   // Violet-900 (Top Left)
      gradient.addColorStop(0.4, '#312e81'); // Indigo-900
      gradient.addColorStop(0.7, '#1e3a8a'); // Blue-900
      gradient.addColorStop(1, '#0f766e');   // Teal-700 (Bottom Right)
      
      // Alternative brighter approach:
      // const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      // gradient.addColorStop(0, '#312e81'); // Indigo-900
      // gradient.addColorStop(1, '#be185d'); // Pink-700
      
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
    <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-violet-900 via-indigo-900 to-teal-800">
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full mix-blend-screen"
        />
        {/* Lighter Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
    </div>
  );
};

export default ParticleBackground;
