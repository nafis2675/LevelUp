'use client';

import { useIframeSdk } from '@whop/react';
import { useEffect, useState } from 'react';

export function WhopIframeTest() {
  const [isMounted, setIsMounted] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Check if we're in an iframe
    setIsInIframe(typeof window !== 'undefined' && window.parent !== window);
  }, []);

  let iframeSdk;
  try {
    iframeSdk = useIframeSdk();
  } catch (error) {
    setSdkError('SDK not available - not running inside Whop');
  }

  const handleOpenWhopDocs = () => {
    try {
      if (iframeSdk) {
        iframeSdk.openExternalUrl({ url: 'https://docs.whop.com' });
      } else {
        window.open('https://docs.whop.com', '_blank');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      window.open('https://docs.whop.com', '_blank');
    }
  };

  const handleOpenUserProfile = () => {
    try {
      if (iframeSdk) {
        iframeSdk.openExternalUrl({ url: 'https://whop.com/@whop' });
      } else {
        window.open('https://whop.com/@whop', '_blank');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      window.open('https://whop.com/@whop', '_blank');
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          🔄 Loading...
        </h3>
        <p className="text-xs text-gray-600">Initializing Whop SDK...</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-2">
        🔗 Whop Iframe SDK {iframeSdk ? 'Active' : 'Inactive'}
      </h3>
      <p className="text-xs text-blue-700 mb-3">
        Your app is running {isInIframe ? 'inside Whop\'s iframe' : 'standalone (not in iframe)'}.
        {sdkError && ` ${sdkError}`}
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleOpenWhopDocs}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
        >
          Open Whop Docs
        </button>
        <button
          onClick={handleOpenUserProfile}
          className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
        >
          View Profile Example
        </button>
      </div>
    </div>
  );
}

