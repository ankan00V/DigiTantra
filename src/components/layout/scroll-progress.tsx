'use client';

import { useState, useEffect } from 'react';

export function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  const onScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScroll(scrolled);
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
