import { useEffect, useState } from 'react';

// Remembers which texts already streamed this session, so navigating
// back to the dashboard doesn't replay the effect every time.
const played = new Set();

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function useTypewriter(text = '', { key = text, charsPerSecond = 110 } = {}) {
  const skip = prefersReducedMotion() || played.has(key);
  const [count, setCount] = useState(skip ? text.length : 0);

  useEffect(() => {
    if (skip) {
      setCount(text.length);
      return undefined;
    }
    const step = Math.max(1, Math.round(charsPerSecond / 50));
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + step, text.length);
      setCount(i);
      if (i >= text.length) {
        played.add(key);
        clearInterval(id);
      }
    }, 20);
    return () => clearInterval(id);
  }, [text, key, skip, charsPerSecond]);

  return { text: text.slice(0, count), done: count >= text.length };
}

