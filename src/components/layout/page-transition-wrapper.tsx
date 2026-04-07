'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { PageLoader } from '@/components/page-loader';

/**
 * This component wraps page content and displays a loading spinner
 * during client-side navigation between pages.
 */
export function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // We use a key on the Suspense boundary to ensure it re-evaluates when the path changes.
  // This allows us to manage loading states for route-level code splitting.
  const key = pathname;

  useEffect(() => {
    // When the component mounts or the pathname changes, if we are currently
    // in a loading state, we immediately set it to false. This handles the
    // end of a navigation event.
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [pathname]); // This effect runs *after* the new page component has rendered.

  // This effect is for initiating the loading state. It runs on the initial render
  // and whenever the pathname changes.
  useEffect(() => {
    // This is a workaround to handle Next.js's Link component behavior.
    // We listen for 'click' events on all anchor tags.
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Find the closest 'a' tag to the click target.
      const link = target.closest('a');

      if (link) {
        const href = link.getAttribute('href');
        const isExternal = link.getAttribute('target') === '_blank' || (href && (href.startsWith('http') || href.startsWith('mailto')));
        
        // Only show loader for internal, client-side navigation.
        if (href && href !== pathname && !isExternal) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [pathname]); // Re-bind the event listener if the path changes.

  return (
    <Suspense fallback={<PageLoader />}>
      {isNavigating && <PageLoader />}
      <div key={key}>{children}</div>
    </Suspense>
  );
}
