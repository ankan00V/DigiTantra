'use client';

import { useState, useEffect } from 'react';

export function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const updateScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const nextValue = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
      setScroll(nextValue);
      frameId = 0;
    };

    const onScroll = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div
        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150 ease-out"
        style={{ width: `${scroll}%` }}
      />
    </div>
  );
}
