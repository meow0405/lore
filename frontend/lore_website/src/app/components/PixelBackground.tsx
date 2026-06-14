import { useEffect, useRef } from "react";

export function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const W = 320;
    const H = 240;
    canvas.width = W;
    canvas.height = H;

    // Pre-generate static noise texture
    const noise: number[] = [];
    for (let i = 0; i < W * H; i++) {
      noise.push(Math.random());
    }

    // Star field
    const stars: { x: number; y: number; b: number; twinkle: number }[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.floor(Math.random() * W),
        y: Math.floor(Math.random() * H),
        b: 0.15 + Math.random() * 0.6,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    // Nebula blobs
    const nebulas = [
      { x: 60, y: 50, rx: 55, ry: 30, color: [40, 20, 90] },
      { x: 220, y: 120, rx: 70, ry: 40, color: [20, 50, 80] },
      { x: 140, y: 190, rx: 80, ry: 35, color: [60, 10, 60] },
    ];

    // Scan-line pattern (horizontal lines every 2px)
    const scanlinePattern = ctx.createPattern(
      (() => {
        const sl = document.createElement("canvas");
        sl.width = 1;
        sl.height = 4;
        const sc = sl.getContext("2d")!;
        sc.fillStyle = "rgba(0,0,0,0.18)";
        sc.fillRect(0, 2, 1, 2);
        return sl;
      })(),
      "repeat"
    )!;

    const draw = () => {
      t += 0.012;

      // Deep space background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#030308");
      bg.addColorStop(0.4, "#060414");
      bg.addColorStop(1, "#02020a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Nebula blobs
      for (const neb of nebulas) {
        const pulse = 0.6 + 0.1 * Math.sin(t * 0.4 + neb.x);
        const g = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.rx);
        const [r, gr, b] = neb.color;
        g.addColorStop(0, `rgba(${r},${gr},${b},${0.18 * pulse})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.save();
        ctx.scale(1, neb.ry / neb.rx);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y * (neb.rx / neb.ry), neb.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Film grain overlay (pixel-level noise)
      const imgData = ctx.getImageData(0, 0, W, H);
      const d = imgData.data;
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const idx = (py * W + px) * 4;
          const n = noise[(py * W + px + Math.floor(t * 30)) % noise.length];
          const grain = (n - 0.5) * 22;
          d[idx] = Math.max(0, Math.min(255, d[idx] + grain));
          d[idx + 1] = Math.max(0, Math.min(255, d[idx + 1] + grain));
          d[idx + 2] = Math.max(0, Math.min(255, d[idx + 2] + grain));
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Stars (twinkling)
      for (const s of stars) {
        const twinkle = s.b * (0.6 + 0.4 * Math.sin(t * 1.2 + s.twinkle));
        const size = twinkle > 0.65 ? 2 : 1;
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fillRect(s.x, s.y, size, size);
      }

      // Horizontal scan lines
      ctx.fillStyle = scanlinePattern;
      ctx.fillRect(0, 0, W, H);

      // CRT vignette
      const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.8);
      vign.addColorStop(0, "rgba(0,0,0,0)");
      vign.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
