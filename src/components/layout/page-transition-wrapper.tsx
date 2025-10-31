'use client';

import { useState, useEffect, Suspense, startTransition } from 'react';
import { usePathname } from 'next/navigation';
import { PageLoader } from '@/components/page-loader';

function PageTransitionInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);
    const [previousPath, setPreviousPath] = useState(pathname);

    useEffect(() => {
        if (pathname !== previousPath) {
            // Start navigation, show loader
            startTransition(() => {
                setIsNavigating(true);
            });

            // When navigation is complete, the new children will render.
            // We then update the previous path and hide the loader.
            const handleNavigationEnd = () => {
                setPreviousPath(pathname);
                setIsNavigating(false);
            };

            // Give the new page content time to render before hiding loader
            const timer = setTimeout(handleNavigationEnd, 300); // Adjust delay if needed

            return () => clearTimeout(timer);
        }
    }, [pathname, previousPath]);

    return (
        <>
            {isNavigating && <PageLoader />}
            {children}
        </>
    );
}


export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  // We wrap the inner component in a Suspense boundary to handle route-level code splitting.
  // The key={usePathname()} ensures the component remounts on path change, resetting its internal state.
  const pathname = usePathname();
  return (
    <Suspense fallback={<PageLoader />}>
        <PageTransitionInner key={pathname}>
            {children}
        </PageTransitionInner>
    </Suspense>
  );
}
