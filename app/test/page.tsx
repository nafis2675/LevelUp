// app/test/page.tsx - Simple Test Page for Iframe Debugging
'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [frameInfo, setFrameInfo] = useState({
    inIframe: false,
    parentOrigin: '',
    userAgent: ''
  });

  useEffect(() => {
    // Detect iframe
    const inIframe = window.self !== window.top;
    let parentOrigin = '';

    if (inIframe) {
      try {
        parentOrigin = document.referrer || 'unknown';
      } catch (e) {
        parentOrigin = 'blocked by CORS';
      }
    }

    setFrameInfo({
      inIframe,
      parentOrigin,
      userAgent: navigator.userAgent
    });

    // Fetch health check
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealthData(data);
        setIsLoading(false);
      })
      .catch(err => {
        setHealthData({ error: err.message });
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎮 LevelUp Iframe Test
          </h1>
          <p className="text-gray-600 mb-8">
            If you can see this, the iframe is loading correctly!
          </p>

          {/* Iframe Detection */}
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              📊 Iframe Status
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Running in iframe:</span>{' '}
                <span className={frameInfo.inIframe ? 'text-green-600 font-bold' : 'text-red-600'}>
                  {frameInfo.inIframe ? '✅ YES' : '❌ NO'}
                </span>
              </p>
              {frameInfo.inIframe && (
                <p>
                  <span className="font-medium">Parent origin:</span>{' '}
                  <span className="text-gray-700">{frameInfo.parentOrigin}</span>
                </p>
              )}
            </div>
          </div>

          {/* Health Check */}
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              ⚡ Health Check
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-600">Loading...</p>
            ) : healthData?.error ? (
              <p className="text-sm text-red-600">Error: {healthData.error}</p>
            ) : (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="text-green-600 font-bold">
                    {healthData?.status?.toUpperCase()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Environment:</span>{' '}
                  <span className="text-gray-700">{healthData?.env?.nodeEnv}</span>
                </p>
              </div>
            )}
          </div>

          {/* Environment Variables */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              🔑 Environment Variables
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-600">Loading...</p>
            ) : (
              <div className="space-y-1 text-sm">
                <EnvVar
                  name="WHOP_API_KEY"
                  present={healthData?.env?.hasWhopApiKey}
                />
                <EnvVar
                  name="NEXT_PUBLIC_WHOP_APP_ID"
                  present={healthData?.env?.hasWhopAppId}
                />
                <EnvVar
                  name="NEXT_PUBLIC_WHOP_COMPANY_ID"
                  present={healthData?.env?.hasWhopCompanyId}
                />
                <EnvVar
                  name="DATABASE_URL"
                  present={healthData?.env?.hasDatabaseUrl}
                  warning="Required for full functionality"
                />
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              📝 Next Steps
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Verify all environment variables are set in Vercel</li>
              <li>Check that DATABASE_URL points to a valid PostgreSQL database</li>
              <li>Ensure CSP headers allow Whop iframe embedding</li>
              <li>Test the main dashboard at <code className="bg-gray-200 px-1 rounded">/</code></li>
            </ol>
          </div>

          {/* Debug Info */}
          {healthData && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                🔍 View Full Debug Info
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify({ frameInfo, healthData }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function EnvVar({
  name,
  present,
  warning
}: {
  name: string;
  present?: boolean;
  warning?: string;
}) {
  return (
    <p>
      <span className="font-mono text-xs">{name}:</span>{' '}
      {present ? (
        <span className="text-green-600">✅ Set</span>
      ) : (
        <span className="text-red-600">❌ Missing</span>
      )}
      {warning && !present && (
        <span className="text-yellow-600 text-xs ml-2">({warning})</span>
      )}
    </p>
  );
}
