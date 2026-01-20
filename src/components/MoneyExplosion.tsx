import { useEffect, useRef, useState } from 'react';
import { DollarSign } from 'lucide-react';

interface MoneyExplosionProps {
  isActive: boolean;
}

export default function MoneyExplosion({ isActive }: MoneyExplosionProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rotation: number; delay: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (isActive && !hasPlayedRef.current) {
      // Generate particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: -Math.random() * 150 - 50,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      // Play cash register sound
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5eXl5eXl8vLy8vLy////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALQAK0MAAABJQABzBIBWBgMDAwcOGTAwsDBg4cM/kA4OHDhxw4ZBg4dPn/+MYxA0MQA6sCAAAAoHD58+TBAQED5AQPn/ygfBAEP//qAg//9QEBAEAQBAEBAQBAf/+MYxBYMSBK0EAAAAICD5AQEA+QEBAQD5AQEA+QEP//6gfICA//8gIP//UCDwQDwQD/+MYxB4LyA60EAAAAKBBwICAgHgQEA8CA8CA8EB/gQEA8f//9AQH///0BAf///8oE/+MYxCcAAADSAAAAAP/qAg///UCAgH///8EBAQf////UCA8EBAQEA+QEBAQD5AQEA/+MYxDoAAADSAAAAAP6AgICAgP//ICAg////ygICAgHyAgICAfICA//qAg///0BA/+MYxEsAAADSAAAAAPqB/+QECAQEA8EA+QD///8gIP///0BA/+QEP/+oCAgHggICAgH/+MYxF4AAADSAAAAAICAgICAgICAg///ICAg///kBAQD5AQD5AQEBAP/+oCAgH//qAg/+MYxHAAAADSAAAAAHgg+QEBAQQEBA///+oH///0BAf//+QEH//0BAfICAgfICAgICAgIP/+MYxIEAAADSAAAAAICA////6gf///QEA////8oH//ygQDwQD5AQPBAQDwQD5AQD5Af/+MYxJIAAADSAAAAAP//UBAf//UBAfICD5AQHggHggHyAgfICA+f//qAgH//qAgIB8/+MYxKQAAADSAAAAAP/+gIDwIDwQD//+oCAg///6gfICAg///0BAQD/+QEBAfICAfICA/+MYxLUAAADSAAAAAP//8gICAfP/+oH//6gQD5AQEBAPkBAQEA+QEBAQEA+QEBAQD5AQ/+MYxMYAAADSAAAAAP//UBA///ygf//qAgP/+gICAgICAgICAgICAgICAgHyAgICA=');
        audioRef.current.volume = 0.3;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // Ignore autoplay errors
      hasPlayedRef.current = true;
    } else if (!isActive) {
      hasPlayedRef.current = false;
      setParticles([]);
    }
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute left-1/2 top-1/2"
          style={{
            animation: `moneyFall 1s ease-out forwards`,
            animationDelay: `${particle.delay}s`,
            transform: `translate(-50%, -50%)`,
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
            '--rot': `${particle.rotation}deg`,
          } as React.CSSProperties}
        >
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg">
            <DollarSign className="w-5 h-5 text-success-foreground" />
          </div>
        </div>
      ))}
      
      {/* Coins */}
      {particles.slice(0, 10).map((particle) => (
        <div
          key={`coin-${particle.id}`}
          className="absolute left-1/2 top-1/2"
          style={{
            animation: `moneyFall 0.8s ease-out forwards`,
            animationDelay: `${particle.delay + 0.1}s`,
            transform: `translate(-50%, -50%)`,
            '--tx': `${particle.x * 0.7}px`,
            '--ty': `${particle.y * 0.8}px`,
            '--rot': `${particle.rotation * 2}deg`,
          } as React.CSSProperties}
        >
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: '2px solid #DAA520'
            }}
          >
            <span className="text-xs font-bold text-amber-900">$</span>
          </div>
        </div>
      ))}
    </div>
  );
}
