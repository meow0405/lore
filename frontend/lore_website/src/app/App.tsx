import { useState, useEffect } from "react";
import { PixelBackground } from "./components/PixelBackground";
import { PixelScene } from "./components/PixelScene";
import { ScrambledText } from "./components/ScrambledText";
import { ReflectiveCard } from "./components/ReflectiveCard";
import { CodeDemo } from "./components/CodeDemo";
import { ByteMascot } from "./components/ByteMascot";
import {
  GitCommit,
  Database,
  Zap,
  ExternalLink,
  Github,
  BookOpen,
  MessageSquare,
  Trophy,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";


// ─── Sigil decoration ─────────────────────────────────────────────────────────
function Sigil({ className }: { className?: string }) {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      style={{ opacity: 0.04 }}
    >
      <circle cx="40" cy="40" r="38" stroke="white" strokeWidth="0.5" />
      <circle cx="40" cy="40" r="25" stroke="white" strokeWidth="0.5" />
      <line x1="40" y1="2" x2="40" y2="78" stroke="white" strokeWidth="0.5" />
      <line x1="2" y1="40" x2="78" y2="40" stroke="white" strokeWidth="0.5" />
      <line x1="12" y1="12" x2="68" y2="68" stroke="white" strokeWidth="0.5" />
      <line x1="68" y1="12" x2="12" y2="68" stroke="white" strokeWidth="0.5" />
      <polygon
        points="40,5 55,30 75,32 59,48 63,70 40,58 17,70 21,48 5,32 25,30"
        stroke="white"
        strokeWidth="0.4"
        fill="none"
      />
    </svg>
  );
}

// ─── Mono label ───────────────────────────────────────────────────────────────
function MonoLabel({ children, color = "rgba(255,255,255,0.2)" }: { children: string; color?: string }) {
  return (
    <span
      style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: "9px",
        letterSpacing: "0.2em",
        color,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="h-px flex-1 max-w-8 bg-white/10" />
      <ScrambledText
        className="text-[10px] tracking-[0.3em] text-white/30 uppercase"
        style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        {children}
      </ScrambledText>
      <span className="h-px flex-1 max-w-8 bg-white/10" />
    </div>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative group px-6 py-3 rounded-sm overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(74,158,255,0.12)",
        border: "1px solid rgba(74,158,255,0.4)",
        fontFamily: "'Geist Mono', monospace",
        fontSize: "13px",
        letterSpacing: "0.05em",
        color: "#4a9eff",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "rgba(74,158,255,0.08)" }}
      />
      <span className="relative flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}

// ─── Secondary button ─────────────────────────────────────────────────────────
function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative group px-6 py-3 rounded-sm transition-all duration-200"
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        fontFamily: "'Geist Mono', monospace",
        fontSize: "13px",
        letterSpacing: "0.05em",
        color: "rgba(255,255,255,0.45)",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "rgba(255,255,255,0.03)" }}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}

// ─── Interactive Try-It demo ───────────────────────────────────────────────────
function TryItDemo() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActive(e.target.value.length > 3);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="What are you trying to do?"
          className="w-full px-4 py-3 rounded-sm outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${active ? "rgba(74,158,255,0.4)" : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'Geist Mono', monospace",
            fontSize: "13px",
            color: "rgba(255,255,255,0.8)",
          }}
        />
        {active && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4a9eff] animate-pulse" />
            <MonoLabel color="rgba(74,158,255,0.6)">analyzing</MonoLabel>
          </div>
        )}
      </div>

      <CodeDemo task={query} animate={false} />

      {active && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {[
            {
              icon: <Zap size={12} className="text-[#4a9eff]" />,
              text: "Dims everything except what matters for your task.",
            },
            {
              icon: <AlertTriangle size={12} className="text-[#e53535]" />,
              text: "Flags the spot that looks tempting but isn't safe.",
            },
            {
              icon: <GitCommit size={12} className="text-white/40" />,
              text: "Every score traces to a real commit or PR — click to verify.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="p-3 rounded-sm"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{card.icon}</div>
                <p
                  className="text-white/40 leading-relaxed"
                  style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px" }}
                >
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "#080808",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#e8e8e6",
      }}
    >
      {/* Pixel background — textured space */}
      <PixelBackground />

      {/* Decorative sigils */}
      <Sigil className="absolute top-32 right-16 hidden lg:block" />
      <Sigil className="absolute top-[60%] left-8 hidden lg:block" />
      <Sigil className="absolute bottom-32 right-32 hidden lg:block" />

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-sm flex items-center justify-center"
              style={{
                background: "rgba(74,158,255,0.1)",
                border: "1px solid rgba(74,158,255,0.3)",
              }}
            >
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#4a9eff" }}>L</span>
            </div>
            <ScrambledText className="tracking-widest text-white/80" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "13px" }}>
              LORE
            </ScrambledText>
          </div>
          <div className="flex items-center gap-6">
            <a href="#try" className="text-white/40 hover:text-white/70 transition-colors" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px" }}>
              try it
            </a>
            <a href="#how" className="text-white/40 hover:text-white/70 transition-colors" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px" }}>
              how it works
            </a>
            <PrimaryButton>Install for VS Code</PrimaryButton>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <MonoLabel color="rgba(74,158,255,0.5)">vs code extension</MonoLabel>
              <span
                className="px-2 py-0.5 rounded-sm text-[9px] tracking-wider"
                style={{
                  background: "rgba(74,158,255,0.1)",
                  border: "1px solid rgba(74,158,255,0.2)",
                  fontFamily: "'Geist Mono', monospace",
                  color: "rgba(74,158,255,0.7)",
                }}
              >
                EARLY ACCESS
              </span>
            </div>

            <h1
              className="mb-6 leading-tight"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 600,
                color: "#e8e8e6",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Know where not to touch{" "}
              <span style={{ color: "rgba(255,255,255,0.35)" }}>before you touch it.</span>
            </h1>

            <p
              className="mb-10 max-w-md"
              style={{
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
                fontSize: "16px",
              }}
            >
              Open a massive file. Tell Lore what you're trying to do. See exactly which part
              matters — and which part you'd regret touching.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <PrimaryButton>
                <Zap size={13} />
                Install for VS Code
              </PrimaryButton>
              <SecondaryButton>
                Try it without installing
                <ChevronRight size={13} />
              </SecondaryButton>
            </div>

            <div className="flex items-center gap-6">
              <MonoLabel color="rgba(255,255,255,0.15)">no cloud · no telemetry · runs local</MonoLabel>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            <PixelScene />
            {/* Floating label */}
            <div
              className="absolute bottom-16 left-4 px-2 py-1 rounded-sm"
              style={{
                background: "rgba(74,158,255,0.08)",
                border: "1px solid rgba(74,158,255,0.2)",
              }}
            >
              <MonoLabel color="rgba(74,158,255,0.5)">lore · scanning orbit</MonoLabel>
            </div>
            <div className="mt-4 flex justify-end w-full pr-4">
              <ReflectiveCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <SectionLabel>the problem</SectionLabel>
            <div
              className="space-y-6"
              style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.85, fontSize: "16px" }}
            >
              <p>
                A junior developer opens <code style={{ fontFamily: "'Geist Mono', monospace", fontSize: "13px", color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: "2px" }}>DatabasePool.java</code>. It's 1,200 lines. The original author left two years ago. There are no comments that mean anything. There's one warning buried on line 847 that says "don't touch."
              </p>
              <p>
                She searches for the method she needs. She finds three that look right. She picks one. She deploys. Production goes down for four hours.
              </p>
              <p>
                The warning was in a different method. The one that looked safe was the one that broke.
              </p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                Other tools help you write the next line. Lore helps you find the right place to write it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Try It ───────────────────────────────────────────────────────────── */}
      <section id="try" className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <SectionLabel>try it</SectionLabel>
          <div className="max-w-3xl mx-auto">
            <h2
              className="mb-3"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 600, color: "#e8e8e6", letterSpacing: "-0.02em", lineHeight: 1.2 }}
            >
              Type what you're doing.
            </h2>
            <p className="mb-8" style={{ color: "rgba(255,255,255,0.35)", fontSize: "15px" }}>
              Lore narrows the file down to what's relevant — and flags what you'd regret.
            </p>
            <TryItDemo />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section id="how" className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <SectionLabel>how it works</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Database size={16} className="text-[#4a9eff]/60" />,
                step: "01",
                title: "Reads your history",
                body: "Lore reads your repo's history overnight — commits, pull requests, issues. Nothing leaves your infrastructure.",
              },
              {
                icon: <GitCommit size={16} className="text-[#4a9eff]/60" />,
                step: "02",
                title: "Scores every file",
                body: "Every file gets a risk score, an expert, and a story — why it works the way it does.",
              },
              {
                icon: <Zap size={16} className="text-[#4a9eff]/60" />,
                step: "03",
                title: "Points when you ask",
                body: "You ask, Lore points. Type what you're doing, see where it lives and where not to go.",
              },
            ].map((col) => (
              <div
                key={col.step}
                className="p-6 rounded-sm group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  {col.icon}
                  <MonoLabel color="rgba(255,255,255,0.1)">{col.step}</MonoLabel>
                </div>
                <h3
                  className="mb-3"
                  style={{ fontSize: "15px", fontWeight: 500, color: "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}
                >
                  {col.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", lineHeight: 1.7 }}>
                  {col.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Byte mascot + Who it's for ────────────────────────────────────────── */}
      <section className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            {/* Byte */}
            <div
              className="p-6 rounded-sm flex flex-col items-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <ByteMascot riskLevel={20} />
              <p
                className="mt-4 text-center leading-relaxed"
                style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.25)", maxWidth: "110px" }}
              >
                Byte lives in your sidebar and feels the risk before you read it. Some things are better felt than read.
              </p>
            </div>

            {/* Who it's for */}
            <div className="lg:col-span-3">
              <SectionLabel>who it's for</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Onboarding a new hire",
                    body: "Day 1. 3 million lines of code. No one to ask. Byte points to where to start — and what to skip.",
                    badge: "NEW_DEV",
                    color: "#4a9eff",
                  },
                  {
                    title: "Inheriting someone else's code",
                    body: "The team who wrote it is gone. The tests pass. Something's wrong. Lore knows the history they left behind.",
                    badge: "HANDOFF",
                    color: "#f59e0b",
                  },
                  {
                    title: "Touching the file everyone's afraid of",
                    body: "You know the one. The one nobody touches. Lore tells you exactly why — and what's actually safe to change.",
                    badge: "CAUTION",
                    color: "#e53535",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="p-5 rounded-sm"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid rgba(255,255,255,0.06)`,
                    }}
                  >
                    <div className="mb-4">
                      <div
                        className="inline-block px-2 py-0.5 rounded-sm mb-3"
                        style={{
                          background: `${card.color}14`,
                          border: `1px solid ${card.color}28`,
                        }}
                      >
                        <MonoLabel color={`${card.color}99`}>{card.badge}</MonoLabel>
                      </div>
                      {/* Mini code visual */}
                      <div
                        className="rounded-sm p-3 mb-3"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: "9px",
                          color: "rgba(255,255,255,0.2)",
                        }}
                      >
                        <div style={{ color: `${card.color}60` }}>▊▊▊▊▊▊▊▊▊▊▊▊▊▊</div>
                        <div className="opacity-40">▊▊▊▊▊▊▊▊</div>
                        <div style={{ color: `${card.color}80` }}>▊▊▊▊▊▊▊▊▊▊</div>
                        <div className="opacity-30">▊▊▊▊▊▊▊▊▊▊▊▊</div>
                      </div>
                    </div>
                    <h3
                      className="mb-2"
                      style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)", lineHeight: 1.3 }}
                    >
                      {card.title}
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", lineHeight: 1.65 }}>
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <SectionLabel>trust</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Citation card */}
            <div
              className="p-6 rounded-sm"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(74,158,255,0.15)",
              }}
            >
              <CheckCircle size={14} className="text-[#4a9eff]/50 mb-4" />
              <div className="mb-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm cursor-pointer hover:border-[#4a9eff]/40 transition-colors"
                  style={{
                    background: "rgba(74,158,255,0.07)",
                    border: "1px solid rgba(74,158,255,0.2)",
                  }}
                >
                  <span
                    style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(74,158,255,0.7)" }}
                  >
                    commit: a4f3d2b
                  </span>
                  <ExternalLink size={9} className="text-[#4a9eff]/40" />
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", lineHeight: 1.7 }}>
                Click it. Read the same words. That's not a summary — that's the source.
              </p>
            </div>

            {/* Low confidence card */}
            <div
              className="p-6 rounded-sm"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <HelpCircle size={14} className="text-white/20 mb-4" />
              <div className="mb-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[28%] rounded-full bg-white/25" />
                </div>
                <MonoLabel color="rgba(255,255,255,0.3)">confidence: low</MonoLabel>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", lineHeight: 1.7 }}>
                Lore tells you when it doesn't know enough. That's not a weakness — it's the most useful thing a tool can say.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div
            className="inline-block px-2 py-1 rounded-sm mb-6"
            style={{
              background: "rgba(74,158,255,0.06)",
              border: "1px solid rgba(74,158,255,0.15)",
            }}
          >
            <MonoLabel color="rgba(74,158,255,0.5)">lore · vs code extension</MonoLabel>
          </div>
          <h2
            className="mb-4"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 600,
              color: "#e8e8e6",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            <ScrambledText>Know before you touch it.</ScrambledText>
          </h2>
          <p className="mb-8 text-white/35" style={{ fontSize: "15px" }}>
            Runs on your infrastructure. Your code never leaves.
          </p>
          <PrimaryButton>
            <Zap size={14} />
            Install for VS Code
          </PrimaryButton>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MonoLabel color="rgba(255,255,255,0.15)">LORE</MonoLabel>
            <span className="text-white/10 text-xs mx-1">·</span>
            <div className="flex items-center gap-1.5">
              <Trophy size={9} className="text-white/15" />
              <MonoLabel color="rgba(255,255,255,0.12)">Built at HackPrix S3</MonoLabel>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {[
              { icon: <Github size={13} />, label: "GitHub" },
              { icon: <BookOpen size={13} />, label: "Docs" },
              { icon: <MessageSquare size={13} />, label: "Feedback" },
            ].map((link) => (
              <a
                key={link.label}
                href="#"
                className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors"
                style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px" }}
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
