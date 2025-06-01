/**
 * Test page for Vapi SDK methods validation
 */

import React from 'react';

function VapiTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Vapi SDK Test Utility
          </h1>
          <p className="text-gray-600 mb-4">
            This test utility is temporarily simplified due to module resolution issues.
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Environment Check:</h3>
            <div className="text-sm text-yellow-700">
              <p>Public API Key: {process.env.NEXT_PUBLIC_VAPI_API_KEY ? '✅ Configured' : '❌ Not configured'}</p>
              <p>Private API Key: {process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY ? '✅ Configured' : '❌ Not configured'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VapiTestPage;
