import { useEffect, useRef } from "react";

export function LineWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMouse);

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x - 0.5;
      const my = mouseRef.current.y - 0.5;
      const lineCount = 28;
      const spacing = canvas.height / lineCount;

      for (let i = 0; i < lineCount; i++) {
        const progress = i / lineCount;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${0.025 + progress * 0.015})`;
        ctx.lineWidth = 0.6;

        const segments = 120;
        for (let j = 0; j <= segments; j++) {
          const xp = j / segments;
          const x = xp * canvas.width;
          const baseY = (i + 0.5) * spacing;
          const wave1 = Math.sin(xp * 5 + t + i * 0.3) * 18;
          const wave2 = Math.sin(xp * 2.5 - t * 0.7 + i * 0.15) * 12;
          const mouseDistort = mx * Math.sin(xp * Math.PI) * 25;
          const y = baseY + wave1 + wave2 + mouseDistort;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      frameRef.current = animId;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
