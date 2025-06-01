/**
 * Workflow demo page for testing the complete Vapi SDK implementation
 */

import React from 'react';

function VapiWorkflowPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Vapi SDK Workflow Demo
          </h1>
          <p className="text-gray-600 mb-4">
            This demo is temporarily simplified. The full workflow demo will be available once module resolution issues are fixed.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Please use the basic test utility at <a href="/test/vapi" className="underline">/test/vapi</a> for now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VapiWorkflowPage;
