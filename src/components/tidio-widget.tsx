'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    tidioChatApi?: {
      display?: (show: boolean) => void;
      open?: () => void;
      show?: () => void;
    };
    __digitantraTidioLoaded__?: boolean;
  }
}

const TIDIO_SCRIPT_ID = 'digitantra-tidio-script';
const TIDIO_SRC = 'https://code.tidio.co/wnu0vx9jg4hiyxyqwbzrurd52lv40vqv.js';

function revealTidioWidget() {
  window.tidioChatApi?.display?.(true);
  window.tidioChatApi?.show?.();
}

export function TidioWidget() {
  useEffect(() => {
    let revealInterval = 0;

    const startRevealLoop = () => {
      window.setTimeout(revealTidioWidget, 600);

      revealInterval = window.setInterval(() => {
        revealTidioWidget();
      }, 1500);
    };

    const existingScript = document.getElementById(TIDIO_SCRIPT_ID) as HTMLScriptElement | null;

    if (window.__digitantraTidioLoaded__) {
      startRevealLoop();
    } else if (!existingScript) {
      const script = document.createElement('script');
      script.id = TIDIO_SCRIPT_ID;
      script.src = TIDIO_SRC;
      script.async = true;
      script.onload = () => {
        window.__digitantraTidioLoaded__ = true;
        startRevealLoop();
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', startRevealLoop, { once: true });
    }

    return () => {
      if (revealInterval) {
        window.clearInterval(revealInterval);
      }
    };
  }, []);

  return null;
}
