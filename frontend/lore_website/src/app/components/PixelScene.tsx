import { useEffect, useRef } from "react";
import { PixelEarth } from "./PixelEarth";

// Pixel art satellite
function PixelSatellite({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="32"
      viewBox="0 0 48 32"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Solar panels */}
      <rect x="0" y="12" width="14" height="8" fill="#4a7abf" opacity="0.9" />
      <rect x="2" y="12" width="2" height="8" fill="#2a5a9f" />
      <rect x="6" y="12" width="2" height="8" fill="#2a5a9f" />
      <rect x="10" y="12" width="2" height="8" fill="#2a5a9f" />
      {/* Body */}
      <rect x="18" y="10" width="12" height="12" fill="#888" />
      <rect x="20" y="12" width="8" height="8" fill="#aaa" />
      <rect x="22" y="14" width="4" height="4" fill="#4a9eff" opacity="0.8" />
      {/* Right panels */}
      <rect x="34" y="12" width="14" height="8" fill="#4a7abf" opacity="0.9" />
      <rect x="36" y="12" width="2" height="8" fill="#2a5a9f" />
      <rect x="40" y="12" width="2" height="8" fill="#2a5a9f" />
      <rect x="44" y="12" width="2" height="8" fill="#2a5a9f" />
      {/* Connector */}
      <rect x="14" y="15" width="4" height="2" fill="#666" />
      <rect x="30" y="15" width="4" height="2" fill="#666" />
      {/* Antenna */}
      <rect x="23" y="4" width="2" height="6" fill="#999" />
      <rect x="21" y="2" width="6" height="2" fill="#999" />
    </svg>
  );
}

// Pixel art moon
function PixelMoon({ size = 40 }: { size?: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="5" y="1" width="6" height="1" fill="#c8c8b0" />
      <rect x="3" y="2" width="10" height="1" fill="#d8d8c0" />
      <rect x="2" y="3" width="12" height="1" fill="#d0d0b8" />
      <rect x="1" y="4" width="13" height="1" fill="#c8c8b0" />
      <rect x="1" y="5" width="14" height="1" fill="#d0d0b8" />
      <rect x="1" y="6" width="14" height="1" fill="#c0c0a8" />
      <rect x="1" y="7" width="14" height="1" fill="#c8c8b0" />
      <rect x="1" y="8" width="14" height="1" fill="#d0d0b8" />
      <rect x="1" y="9" width="13" height="1" fill="#c8c8b0" />
      <rect x="2" y="10" width="12" height="1" fill="#c0c0a8" />
      <rect x="3" y="11" width="10" height="1" fill="#b8b8a0" />
      <rect x="5" y="12" width="6" height="1" fill="#c0c0a8" />
      {/* Craters */}
      <rect x="4" y="5" width="2" height="2" fill="#a8a898" opacity="0.6" />
      <rect x="9" y="7" width="3" height="2" fill="#a8a898" opacity="0.5" />
      <rect x="6" y="9" width="2" height="2" fill="#b0b0a0" opacity="0.5" />
    </svg>
  );
}

// Pixel art city skyline
function PixelCity() {
  // Building shapes as rects
  const buildings = [
    { x: 0, w: 18, h: 60, color: "#111318" },
    { x: 20, w: 25, h: 90, color: "#0e1015" },
    { x: 47, w: 15, h: 50, color: "#13141a" },
    { x: 64, w: 30, h: 110, color: "#0c0d12" },
    { x: 96, w: 20, h: 70, color: "#111318" },
    { x: 118, w: 22, h: 130, color: "#0e0f14", antenna: true },
    { x: 142, w: 28, h: 80, color: "#12131a" },
    { x: 172, w: 18, h: 55, color: "#111218" },
    { x: 192, w: 35, h: 100, color: "#0d0e13" },
    { x: 229, w: 20, h: 65, color: "#111318" },
    { x: 251, w: 26, h: 95, color: "#0f1015" },
    { x: 279, w: 15, h: 45, color: "#13141a" },
    { x: 296, w: 30, h: 115, color: "#0c0d12", antenna: true },
    { x: 328, w: 22, h: 75, color: "#111318" },
    { x: 352, w: 18, h: 50, color: "#12131a" },
  ];

  const baseY = 160;

  return (
    <svg width="380" height="160" viewBox="0 0 380 160" style={{ imageRendering: "pixelated" }}>
      {buildings.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={baseY - b.h}
            width={b.w}
            height={b.h}
            fill={b.color}
          />
          {/* Windows grid */}
          {Array.from({ length: Math.floor(b.h / 12) }).map((_, row) =>
            Array.from({ length: Math.floor(b.w / 8) }).map((_, col) => {
              const lit = Math.random() > 0.6;
              return lit ? (
                <rect
                  key={`${row}-${col}`}
                  x={b.x + col * 8 + 2}
                  y={baseY - b.h + row * 12 + 3}
                  width={4}
                  height={6}
                  fill={Math.random() > 0.3 ? "#ffcc66" : "#4a9eff"}
                  opacity={0.4 + Math.random() * 0.4}
                />
              ) : null;
            })
          )}
          {/* Antenna */}
          {b.antenna && (
            <>
              <rect x={b.x + b.w / 2 - 1} y={baseY - b.h - 20} width={2} height={20} fill="#333" />
              <rect x={b.x + b.w / 2 - 3} y={baseY - b.h - 22} width={6} height={2} fill="#e53535" opacity="0.8" />
            </>
          )}
        </g>
      ))}
      {/* Ground / horizon glow */}
      <rect x="0" y={baseY} width="380" height="10" fill="#0a0a10" />
      <rect
        x="0"
        y={baseY - 2}
        width="380"
        height="4"
        fill="rgba(74,158,255,0.06)"
      />
    </svg>
  );
}

export function PixelScene() {
  return (
    <div className="relative w-full" style={{ height: 320 }}>
      {/* Earth — centered, large */}
      <div className="absolute" style={{ right: "8%", top: "20px" }}>
        <PixelEarth size={220} />
      </div>

      {/* Moon — top left */}
      <div className="absolute" style={{ left: "15%", top: "30px" }}>
        <PixelMoon size={56} />
      </div>

      {/* Satellite — floating */}
      <div
        className="absolute"
        style={{
          left: "35%",
          top: "40px",
          animation: "float 6s ease-in-out infinite",
        }}
      >
        <PixelSatellite />
      </div>

      {/* City skyline at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <PixelCity />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
