import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const CODE_LINES = [
  { text: "// DatabasePool.java — last modified 847 days ago", type: "comment", relevance: "dim" },
  { text: "// Original author: @sarah.chen (left 2021)", type: "comment", relevance: "dim" },
  { text: "", type: "empty", relevance: "dim" },
  { text: "public class DatabasePool {", type: "code", relevance: "dim" },
  { text: "  private static final int MAX_POOL = 50;", type: "code", relevance: "dim" },
  { text: "  private static volatile DatabasePool instance;", type: "code", relevance: "dim" },
  { text: "  private final List<Connection> connections;", type: "code", relevance: "dim" },
  { text: "", type: "empty", relevance: "dim" },
  { text: "  // WARNING: Do not touch retry logic below", type: "comment", relevance: "risky" },
  { text: "  // Fixed in incident-2019-11 — breaks prod silently", type: "comment", relevance: "risky" },
  { text: "  private int retryCount = 0;", type: "code", relevance: "risky" },
  { text: "  private long backoffMs = 150;", type: "code", relevance: "risky" },
  { text: "", type: "empty", relevance: "dim" },
  { text: "  public synchronized Connection acquire() {", type: "code", relevance: "highlight" },
  { text: "    if (connections.isEmpty()) {", type: "code", relevance: "highlight" },
  { text: "      return createNewConnection();", type: "code", relevance: "highlight" },
  { text: "    }", type: "code", relevance: "highlight" },
  { text: "    return connections.remove(0);", type: "code", relevance: "highlight" },
  { text: "  }", type: "code", relevance: "highlight" },
  { text: "", type: "empty", relevance: "dim" },
  { text: "  public void release(Connection conn) {", type: "code", relevance: "dim" },
  { text: "    if (connections.size() < MAX_POOL) {", type: "code", relevance: "dim" },
  { text: "      connections.add(conn);", type: "code", relevance: "dim" },
  { text: "    } else {", type: "code", relevance: "dim" },
  { text: "      conn.close();", type: "code", relevance: "dim" },
  { text: "    }", type: "code", relevance: "dim" },
  { text: "  }", type: "code", relevance: "dim" },
  { text: "}", type: "code", relevance: "dim" },
];

function tokenize(line: string) {
  if (!line.trim()) return <span>&nbsp;</span>;
  if (line.trim().startsWith("//"))
    return <span className="text-[#5a6e4a]">{line}</span>;

  // Simple keyword highlighting
  const keywords = /\b(public|private|static|final|synchronized|volatile|class|new|return|if|else)\b/g;
  const types = /\b(int|long|List|Connection|String|void|boolean)\b/g;

  let result = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  result = result.replace(
    keywords,
    '<span style="color:#569cd6">$&</span>'
  );
  result = result.replace(
    types,
    '<span style="color:#4ec9b0">$&</span>'
  );
  result = result.replace(
    /"[^"]*"/g,
    '<span style="color:#ce9178">$&</span>'
  );
  result = result.replace(
    /\b\d+\b/g,
    '<span style="color:#b5cea8">$&</span>'
  );

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

interface CodeDemoProps {
  task?: string;
  animate?: boolean;
}

export function CodeDemo({ task = "modify the connection acquire logic", animate = true }: CodeDemoProps) {
  const [revealed, setRevealed] = useState(animate ? false : true);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setRevealed(true), 800);
      return () => clearTimeout(t);
    }
  }, [animate]);

  return (
    <div className="rounded-lg overflow-hidden border border-white/10 bg-[#0d0d0d]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] border-b border-white/8">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e53535]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#4a9eff]/30" />
        </div>
        <span
          className="text-[10px] text-white/25 ml-2"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          DatabasePool.java
        </span>
        {revealed && (
          <span
            className="ml-auto text-[9px] text-[#4a9eff]/60 tracking-wider"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            LORE: 3 regions analyzed
          </span>
        )}
      </div>

      {/* Code */}
      <div className="p-4 overflow-auto max-h-80">
        <table className="w-full border-collapse">
          <tbody>
            {CODE_LINES.map((line, i) => {
              const isHighlight = revealed && line.relevance === "highlight";
              const isRisky = revealed && line.relevance === "risky";
              const isDim = revealed && line.relevance === "dim";

              return (
                <tr key={i} className="group">
                  <td
                    className="pr-4 text-right select-none w-8"
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: "11px",
                      color: isHighlight
                        ? "rgba(74,158,255,0.5)"
                        : "rgba(255,255,255,0.15)",
                      transition: "color 0.4s",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="relative"
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: "12px",
                      lineHeight: "1.7",
                      opacity: isDim ? 0.2 : 1,
                      transition: "opacity 0.5s ease",
                      backgroundColor: isHighlight
                        ? "rgba(74,158,255,0.07)"
                        : isRisky
                        ? "rgba(229,53,53,0.06)"
                        : "transparent",
                      borderLeft: isHighlight
                        ? "2px solid rgba(74,158,255,0.4)"
                        : isRisky
                        ? "2px solid rgba(229,53,53,0.4)"
                        : "2px solid transparent",
                      paddingLeft: "8px",
                    }}
                  >
                    {tokenize(line.text)}
                    {isRisky && i === 8 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <AlertTriangle size={10} className="text-[#e53535]/80" />
                        <span
                          className="text-[8px] text-[#e53535]/60 tracking-wider"
                          style={{ fontFamily: "'Geist Mono', monospace" }}
                        >
                          CAUTION
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
