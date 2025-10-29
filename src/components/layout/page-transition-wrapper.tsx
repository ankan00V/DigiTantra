'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { PageLoader } from '@/components/page-loader';
import Link from 'next/link';

function usePageNavigation() {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);
    const [previousPath, setPreviousPath] = useState(pathname);

    useEffect(() => {
        if (pathname !== previousPath) {
            setIsNavigating(true);
            setPreviousPath(pathname);
        }
    }, [pathname, previousPath]);

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    return { isNavigating };
}

function PageTransitionInner({ children }: { children: React.ReactNode }) {
    const { isNavigating } = usePageNavigation();

    return (
        <>
            {isNavigating && <PageLoader />}
            {children}
        </>
    );
}

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
        <PageTransitionInner>
            {children}
        </PageTransitionInner>
    </Suspense>
  );
}
