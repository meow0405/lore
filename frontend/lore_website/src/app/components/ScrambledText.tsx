import { useRef, useState, useEffect } from "react";

const CHARS = ". : _ / \\ | % # @ ! ?";
const CHAR_LIST = CHARS.split(" ");

interface ScrambledTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
}

export function ScrambledText({ children, className, style, tag: Tag = "span" }: ScrambledTextProps) {
  const [displayed, setDisplayed] = useState(children);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iterRef = useRef(0);

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    iterRef.current = 0;
    const maxIter = children.length * 2;

    intervalRef.current = setInterval(() => {
      const iter = iterRef.current;
      setDisplayed(
        children
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iter / 2) return char;
            return CHAR_LIST[Math.floor(Math.random() * CHAR_LIST.length)];
          })
          .join("")
      );
      iterRef.current++;
      if (iter >= maxIter) {
        clearInterval(intervalRef.current!);
        setDisplayed(children);
        setIsScrambling(false);
      }
    }, 40);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    // @ts-ignore
    <Tag
      className={className}
      onMouseEnter={scramble}
      style={{ cursor: "default", fontVariantNumeric: "tabular-nums", ...style }}
    >
      {displayed}
    </Tag>
  );
}
