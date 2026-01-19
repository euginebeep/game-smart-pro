import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface Connection {
  from: number;
  to: number;
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 20000));
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const connections: Connection[] = [];

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += particle.pulseSpeed;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Calculate pulsing opacity
        const pulsingOpacity = particle.opacity + Math.sin(particle.pulse) * 0.15;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(185, 100%, 50%, ${pulsingOpacity})`;
        ctx.fill();

        // Draw glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, `hsla(185, 100%, 50%, ${pulsingOpacity * 0.3})`);
        gradient.addColorStop(1, 'hsla(185, 100%, 50%, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Find connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            connections.push({ from: i, to: j });
          }
        }
      });

      // Draw connections (circuit lines)
      connections.forEach(({ from, to }) => {
        const p1 = particles[from];
        const p2 = particles[to];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const opacity = (1 - distance / 150) * 0.3;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        
        // Create angular circuit-like path
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          ctx.lineTo(midX, p1.y);
          ctx.lineTo(midX, p2.y);
        } else {
          ctx.lineTo(p1.x, midY);
          ctx.lineTo(p2.x, midY);
        }
        
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `hsla(185, 100%, 50%, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw connection nodes
        ctx.beginPath();
        ctx.arc(midX, Math.abs(dx) > Math.abs(dy) ? p1.y : midY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(185, 100%, 50%, ${opacity * 1.5})`;
        ctx.fill();
      });

      // Draw floating circuit traces
      const time = Date.now() * 0.001;
      for (let i = 0; i < 5; i++) {
        const x = (Math.sin(time * 0.3 + i * 1.5) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.2 + i * 2) * 0.5 + 0.5) * canvas.height;
        const size = 3 + Math.sin(time * 2 + i) * 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, 'hsla(260, 80%, 60%, 0.4)');
        gradient.addColorStop(1, 'hsla(260, 80%, 60%, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
