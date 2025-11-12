'use client';

import { WhopIframeSdkProvider } from '@whop/react';
import { useEffect, useState } from 'react';

export function WhopProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render children without provider during SSR
    return <>{children}</>;
  }

  return (
    <WhopIframeSdkProvider>
      {children}
    </WhopIframeSdkProvider>
  );
}

