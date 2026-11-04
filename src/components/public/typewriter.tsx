"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** Types each word, holds, deletes, moves on. Static first word for reduced motion. */
export function Typewriter({ words }: { words: string[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[index % words.length] ?? "";

  useEffect(() => {
    if (reduce) return;
    let delay = deleting ? 32 : 62;
    if (!deleting && length === word.length) delay = 2200;
    if (deleting && length === 0) delay = 350;
    const t = setTimeout(() => {
      if (!deleting && length === word.length) setDeleting(true);
      else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      } else setLength((l) => l + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(t);
  }, [reduce, deleting, length, word.length, words.length]);

  const shown = reduce ? word : word.slice(0, length);

  return (
    <span aria-live="off">
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden>
        {shown}
        <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] bg-ion animate-blink" />
      </span>
    </span>
  );
}
