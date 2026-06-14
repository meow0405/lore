import { useState, useEffect } from "react";

type MoodState = "calm" | "alert" | "panic";

const PIXEL_CALM = [
  "  ███  ",
  " █   █ ",
  " █ █ █ ",
  "  ███  ",
  " ████  ",
  "██  ██ ",
  "   █   ",
  "  █ █  ",
];

const PIXEL_ALERT = [
  "  ███  ",
  " █   █ ",
  " █ ● █ ",
  "  ███  ",
  " ████  ",
  "██  ██ ",
  "   █!  ",
  "  █ █  ",
];

const PIXEL_PANIC = [
  "  ███  ",
  " █>.<█ ",
  " █   █ ",
  "  ███  ",
  " ████  ",
  "██  ██ ",
  "  !!!  ",
  " █   █ ",
];

function PixelGrid({ pattern, color }: { pattern: string[]; color: string }) {
  return (
    <div className="flex flex-col gap-0">
      {pattern.map((row, ri) => (
        <div key={ri} className="flex">
          {row.split("").map((ch, ci) => (
            <div
              key={ci}
              style={{
                width: 4,
                height: 4,
                backgroundColor: ch !== " " ? color : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface ByteMascotProps {
  riskLevel?: number; // 0–100
}

export function ByteMascot({ riskLevel = 20 }: ByteMascotProps) {
  const mood: MoodState = riskLevel > 70 ? "panic" : riskLevel > 40 ? "alert" : "calm";
  const pattern = mood === "panic" ? PIXEL_PANIC : mood === "alert" ? PIXEL_ALERT : PIXEL_CALM;
  const color = mood === "panic" ? "#e53535" : mood === "alert" ? "#f59e0b" : "#4a9eff";

  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ opacity: blink ? 0.4 : 1, transition: "opacity 0.08s" }}>
        <PixelGrid pattern={pattern} color={color} />
      </div>
      <div className="text-center">
        <div
          className="text-[9px] tracking-[0.2em] uppercase mb-1"
          style={{ fontFamily: "'Geist Mono', monospace", color }}
        >
          BYTE · {mood.toUpperCase()}
        </div>
        <div
          className="text-[10px] text-white/30 max-w-[120px] leading-relaxed"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          {mood === "calm" && "All quiet."}
          {mood === "alert" && "Something's off."}
          {mood === "panic" && "Don't touch that."}
        </div>
      </div>
    </div>
  );
}
