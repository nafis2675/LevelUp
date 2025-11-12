'use client';

import { useIframeSdk } from '@whop/react';
import { useEffect, useState } from 'react';

export function WhopIframeTest() {
  const [isReady, setIsReady] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsReady(true);
    if (typeof window !== 'undefined') {
      setIsInIframe(window.parent !== window);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          🔄 Loading...
        </h3>
        <p className="text-xs text-gray-600">Initializing Whop SDK...</p>
      </div>
    );
  }

  if (!isInIframe) {
    return <StandaloneSdkInfo />;
  }

  return <IframeSdkInfo />;
}

function StandaloneSdkInfo() {
  const handleOpenWhopDocs = () => {
    window.open('https://docs.whop.com', '_blank');
  };

  const handleOpenUserProfile = () => {
    window.open('https://whop.com/@whop', '_blank');
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-2">
        🔗 Whop Iframe SDK Inactive
      </h3>
      <p className="text-xs text-blue-700 mb-3">
        Your app is running standalone (not inside Whop&apos;s iframe). The buttons below will open in new tabs for testing.
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

function IframeSdkInfo() {
  const iframeSdk = useIframeSdk();

  const handleOpenWhopDocs = () => {
    try {
      iframeSdk.openExternalUrl({ url: 'https://docs.whop.com' });
    } catch (error) {
      console.error('Error opening URL via SDK:', error);
    }
  };

  const handleOpenUserProfile = () => {
    try {
      iframeSdk.openExternalUrl({ url: 'https://whop.com/@whop' });
    } catch (error) {
      console.error('Error opening URL via SDK:', error);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-2">
        🔗 Whop Iframe SDK Active
      </h3>
      <p className="text-xs text-blue-700 mb-3">
        Your app is running inside Whop&apos;s iframe and can communicate with the platform using the SDK.
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

