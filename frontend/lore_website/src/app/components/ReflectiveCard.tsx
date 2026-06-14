import { useRef, useState } from "react";
import { Fingerprint, Lock, Activity } from "lucide-react";

export function ReflectiveCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width;
    const cy = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (cy - 0.5) * 20, y: (cx - 0.5) * -20 });
    setShine({ x: cx * 100, y: cy * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.1s ease-out",
      }}
      className="relative w-64 h-40 rounded-xl overflow-hidden cursor-pointer select-none"
    >
      {/* Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#2a2a2a] to-[#111]" />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Shine */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
          transition: "background 0.05s",
        }}
      />

      {/* Reflective border */}
      <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none" />
      <div className="absolute inset-[1px] rounded-xl border border-white/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={10} className="text-[#4a9eff]" />
            <span
              className="text-[9px] tracking-[0.2em] text-[#4a9eff]/80"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              SECURE ACCESS
            </span>
          </div>
          <span
            className="text-[8px] text-white/20"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            LORE//SYS
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div
              className="text-[8px] text-white/30 mb-1 tracking-widest"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              OPERATOR
            </div>
            <div
              className="text-xs text-white/70 tracking-wider"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              DEV_UNIT_01
            </div>
            <div
              className="text-[7px] text-white/20 mt-1 tracking-widest"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              ID: L0R3–4891–A9
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Fingerprint size={18} className="text-white/25" />
            <Activity size={10} className="text-[#4a9eff]/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
