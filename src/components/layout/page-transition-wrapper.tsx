'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { PageLoader } from '@/components/page-loader';

function PageTransitionInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // When the path changes, we are navigating.
        // We can use a short timeout to avoid flashing the loader on very fast navigations.
        const timer = setTimeout(() => setIsNavigating(true), 100); 

        return () => clearTimeout(timer);
    }, [pathname]);

    useEffect(() => {
        // When the component re-renders for the new page, we can hide the loader.
        // A timeout ensures the new content has had a chance to start rendering.
        const timer = setTimeout(() => setIsNavigating(false), 200); // Adjust delay if needed

        return () => clearTimeout(timer);
    }, [pathname]);


    // This effect handles the case where the new page is loaded.
    useEffect(() => {
        setIsNavigating(false);
    }, [children]);


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
