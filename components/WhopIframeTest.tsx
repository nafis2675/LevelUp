'use client';

import { useIframeSdk } from '@whop/react';

export function WhopIframeTest() {
  const iframeSdk = useIframeSdk();

  const handleOpenWhopDocs = () => {
    try {
      iframeSdk.openExternalUrl({ url: 'https://docs.whop.com' });
    } catch (error) {
      console.error('Error opening URL:', error);
      // Fallback for when not in iframe
      window.open('https://docs.whop.com', '_blank');
    }
  };

  const handleOpenUserProfile = () => {
    try {
      iframeSdk.openExternalUrl({ url: 'https://whop.com/@whop' });
    } catch (error) {
      console.error('Error opening URL:', error);
      // Fallback for when not in iframe
      window.open('https://whop.com/@whop', '_blank');
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-2">
        🔗 Whop Iframe SDK Active
      </h3>
      <p className="text-xs text-blue-700 mb-3">
        Your app is running {typeof window !== 'undefined' && window.parent !== window ? 'inside Whop\'s iframe' : 'standalone (not in iframe)'} and can communicate with the platform.
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

