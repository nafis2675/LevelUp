'use client';

import { WhopIframeSdkProvider } from '@whop/react';
import { useEffect, useState } from 'react';

export function WhopProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setIsInIframe(window.parent !== window);
    }
  }, []);

  if (!isMounted || !isInIframe) {
    // Outside Whop iframe: render children without provider
    return <>{children}</>;
  }

  return (
    <WhopIframeSdkProvider>
      {children}
    </WhopIframeSdkProvider>
  );
}

