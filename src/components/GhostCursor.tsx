import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'star' | 'dot' | 'petal';
  rotation: number;
  rotationSpeed: number;
}

export const GhostCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const ghostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnTime = useRef(0);

  const isInteractiveRef = useRef(false);

  useEffect(() => {
    // Detect touch-only devices or prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsTouchDevice(isTouch || prefersReducedMotion);
      if (isTouch || prefersReducedMotion) return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const colors = ['#e63946', '#f59e0b', '#ff758f', '#ffffff', '#fbbf24'];

    const spawnSparkles = (x: number, y: number, speed: number) => {
      if (particlesRef.current.length > 20) return; // Prevent particle build-up
      const count = Math.min(Math.floor(speed * 0.5) + 1, 2);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocityMag = Math.random() * 1.2 + 0.2;
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * velocityMag,
          vy: Math.sin(angle) * velocityMag - 0.2,
          size: Math.random() * 2.5 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.5,
          decay: Math.random() * 0.03 + 0.025,
          type: Math.random() > 0.5 ? 'star' : 'dot',
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if mouse is over an interactive element without forcing unneeded state changes
      const targetEl = e.target as HTMLElement | null;
      if (targetEl) {
        const interactive = !!targetEl.closest(
          'button, a, input, textarea, select, [role="button"], .cursor-pointer, label, option, summary'
        );
        if (isInteractiveRef.current !== interactive) {
          isInteractiveRef.current = interactive;
          setIsInteractive(interactive);
        }
      }

      // Spawn trail sparkles on movement
      const now = performance.now();
      if (now - lastSpawnTime.current > 40) {
        const speed = Math.hypot(velocity.current.x, velocity.current.y);
        spawnSparkles(e.clientX, e.clientY, speed);
        lastSpawnTime.current = now;
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    let animationFrameId: number;
    let time = 0;

    const draw4PointStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      rot: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        c.lineTo(Math.cos((i * Math.PI) / 2) * r, Math.sin((i * Math.PI) / 2) * r);
        c.lineTo(
          Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (r * 0.35),
          Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (r * 0.35)
        );
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    const animate = () => {
      time += 0.05;
      const lerpFactor = 0.32; // Snappy, non-laggy cursor tracking

      const prevX = currentPos.current.x;
      const prevY = currentPos.current.y;

      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpFactor;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpFactor;

      velocity.current.x = currentPos.current.x - prevX;
      velocity.current.y = currentPos.current.y - prevY;

      const tilt = Math.max(-12, Math.min(12, velocity.current.x * 1.2));
      const floatY = Math.sin(time) * 3;

      if (ghostRef.current) {
        const posX = currentPos.current.x + 12;
        const posY = currentPos.current.y + 12 + floatY;
        ghostRef.current.style.transform = `translate3d(${posX}px, ${posY}px, 0) rotate(${tilt}deg)`;
      }

      // Fast, zero-shadow canvas render loop
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          p.rotation += p.rotationSpeed;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.type === 'star') {
            draw4PointStar(ctx, p.x, p.y, p.size, p.rotation);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Canvas layer for glowing sparkle trail */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998]"
        style={{ willChange: 'contents' }}
      />

      {/* Floating Ghost Cursor Companion */}
      <div
        ref={ghostRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99999] transition-opacity duration-300 ease-out ${
          isVisible && !isInteractive ? 'opacity-90 scale-100' : 'opacity-0 scale-50'
        }`}
        style={{
          willChange: 'transform, opacity',
        }}
      >
        <div className="relative group">
          {/* Cute Ghost (Boo Tao style) */}
          <div className="relative filter drop-shadow-[0_0_12px_rgba(230,57,70,0.85)]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
            >
              {/* Soft outer spirit aura */}
              <path
                d="M 20 4 C 11 4 6 11 6 19 C 6 26 8 30 11 34 C 13 36 16 33 18 31 C 19 30 21 30 22 31 C 24 33 27 36 29 34 C 32 30 34 26 34 19 C 34 11 29 4 20 4 Z"
                fill="#ffffff"
              />
              {/* Ghost eyes */}
              <circle cx="15" cy="16" r="2.2" fill="#180a0b" />
              <circle cx="25" cy="16" r="2.2" fill="#180a0b" />
              <circle cx="15.6" cy="15.2" r="0.7" fill="#ffffff" />
              <circle cx="25.6" cy="15.2" r="0.7" fill="#ffffff" />

              {/* Ghost mouth (open smile) */}
              <path
                d="M 17 21 Q 20 26 23 21 Z"
                fill="#e63946"
                stroke="#180a0b"
                strokeWidth="1"
              />

              {/* Cute pink cheek blush */}
              <ellipse cx="11.5" cy="19" rx="2.2" ry="1.2" fill="#ff758f" opacity="0.8" />
              <ellipse cx="28.5" cy="19" rx="2.2" ry="1.2" fill="#ff758f" opacity="0.8" />

              {/* Tak red plum blossom hat flower accent */}
              <circle cx="20" cy="7" r="2" fill="#d63838" />
              <circle cx="20" cy="7" r="0.8" fill="#f59e0b" />
            </svg>
          </div>

          {/* Floating tiny spark trail behind ghost */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400/80 blur-[2px] animate-pulse" />
        </div>
      </div>
    </>
  );
};

