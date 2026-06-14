import { useEffect, useRef } from "react";

// Pixel art Earth map — 0=space, 1=ocean, 2=land, 3=ice/cloud, 4=land-dark
// 32x16 pixel map projected onto sphere
const MAP: number[][] = [
  [0,0,0,1,1,1,1,2,2,2,1,1,2,2,2,2,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,2,2,2,2,2,2,2,2,4,2,2,2,1,1,1,1,2,2,2,2,1,1,1,1,1,0,0],
  [0,1,1,2,2,2,2,2,4,4,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,1,1,1,1,1,0],
  [1,1,2,2,2,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1],
  [1,2,2,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1],
  [1,2,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1],
  [1,2,4,4,4,4,4,4,4,4,2,2,2,2,2,2,1,1,1,1,2,2,2,2,2,2,2,2,2,2,1,1],
  [1,1,2,2,4,4,4,4,4,2,2,2,2,2,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1],
  [0,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,2,2,2,2,2,2,2,2,2,2,1,1,1,0],
  [0,0,1,1,2,2,2,2,2,2,2,2,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,0,0],
  [0,0,1,1,2,2,2,2,2,2,2,4,4,4,4,4,2,2,2,2,2,2,2,2,2,1,1,1,1,0,0,0],
  [0,0,0,1,1,2,2,2,2,2,4,4,4,4,4,4,4,2,2,2,2,2,2,2,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,2,2,4,4,4,4,4,4,4,4,4,2,2,2,2,2,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,2,2,4,4,4,4,4,4,4,2,2,2,2,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,2,2,2,2,2,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0],
];

const COLORS = {
  0: null,
  1: "#1a4d7a", // deep ocean
  2: "#2a7abf", // ocean
  3: "#d4e8f0", // ice/cloud
  4: "#2d6e35", // land
};

const LAND_LIGHT = "#3a8a44";
const LAND_DARK  = "#1e4d26";
const OCEAN_LIGHT = "#3090d0";
const OCEAN_DARK  = "#0f3a60";

export function PixelEarth({ size = 200 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const RADIUS = Math.floor(size / 2);
    const PX = 4; // pixels per "pixel"
    const W = size;
    const H = size;
    canvas.width = W;
    canvas.height = H;

    let angle = 0;
    let animId: number;

    const mapH = MAP.length;       // 16
    const mapW = MAP[0].length;    // 32

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw sphere pixel-by-pixel
      for (let py = -RADIUS; py <= RADIUS; py++) {
        const cy = py;
        const rRow = Math.sqrt(RADIUS * RADIUS - cy * cy);
        if (rRow <= 0) continue;

        for (let px = -RADIUS; px <= RADIUS; px++) {
          const cx = px;
          if (cx * cx + cy * cy > RADIUS * RADIUS) continue;

          // Sphere coords
          const lat = Math.asin(cy / RADIUS);
          const lng = Math.asin(Math.max(-1, Math.min(1, cx / rRow)));

          // Map lat/lng to texture with rotation
          const u = ((lng / Math.PI + angle) % 1 + 1) % 1;
          const v = lat / Math.PI + 0.5;

          const mx = Math.floor(u * mapW);
          const my = Math.floor(v * mapH);
          const tile = MAP[Math.min(mapH - 1, Math.max(0, my))]?.[Math.min(mapW - 1, Math.max(0, mx))];

          if (tile === undefined || tile === 0) continue;

          // Lighting: diffuse from top-left
          const nx = cx / RADIUS;
          const ny = cy / RADIUS;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          const light = Math.max(0.1, 0.6 * nz + 0.4 * (-nx * 0.3 + -ny * 0.5 + nz * 0.8));

          let baseR = 0, baseG = 0, baseB = 0;
          if (tile === 2 || tile === 1) { // ocean
            const shade = tile === 1 ? 0.7 : 1.0;
            baseR = 30 * shade; baseG = 100 * shade; baseB = 190 * shade;
          } else if (tile === 4) { // land
            baseR = 40; baseG = 110; baseB = 50;
          } else if (tile === 3) { // ice
            baseR = 210; baseG = 230; baseB = 240;
          }

          const r = Math.min(255, baseR * light * 1.2);
          const g = Math.min(255, baseG * light * 1.2);
          const b = Math.min(255, baseB * light * 1.2);

          ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
          const sx = RADIUS + px;
          const sy = RADIUS + py;
          ctx.fillRect(sx, sy, 1, 1);
        }
      }

      // Atmosphere glow
      const atm = ctx.createRadialGradient(RADIUS, RADIUS, RADIUS * 0.85, RADIUS, RADIUS, RADIUS * 1.05);
      atm.addColorStop(0, "rgba(60,140,255,0)");
      atm.addColorStop(0.7, "rgba(60,140,255,0.12)");
      atm.addColorStop(1, "rgba(80,160,255,0.25)");
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(RADIUS, RADIUS, RADIUS * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // Cloud wisps (simple white arcs)
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(RADIUS * 0.6, RADIUS * 0.35, RADIUS * 0.2, 0.2, 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(RADIUS * 1.3, RADIUS * 0.65, RADIUS * 0.15, Math.PI + 0.4, Math.PI + 1.2);
      ctx.stroke();
      ctx.restore();

      angle += 0.001;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: "pixelated", width: size, height: size }}
    />
  );
}
