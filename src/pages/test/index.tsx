/**
 * Test utilities index page for easy access to Vapi SDK testing tools
 */

import Link from 'next/link';
import React from 'react';

function TestIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Vapi SDK Test Utilities
          </h1>
          
          {/* NEW: Featured Unified Test Card */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="bg-white rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">NEW: Unified API & Component Testing</h2>
              </div>
              
              <p className="mb-6 opacity-90">
                Experience all enhanced features in one place - API testing, component demos, and documentation.
                Our most complete testing environment with advanced retry logic and analysis features.
              </p>
              
              <div className="flex justify-between items-center">
                <ul className="space-y-1 opacity-80 text-sm">
                  <li>✓ All enhanced features in one place</li>
                  <li>✓ Interactive API testing</li>
                  <li>✓ Live component demonstration</li>
                  <li>✓ Comprehensive documentation</li>
                </ul>
                
                <Link 
                  href="/test/unified"
                  className="bg-white text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm"
                >
                  Open Unified Demo
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            
            {/* Basic Test Utility */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-blue-800">Basic Test Utility</h2>
              </div>
              
              <p className="text-blue-700 mb-4">
                Test individual Vapi SDK methods and validate configuration settings.
              </p>
              
              <ul className="text-sm text-blue-600 mb-6 space-y-1">
                <li>✓ Configuration validation</li>
                <li>✓ API key verification</li>
                <li>✓ Individual method testing</li>
                <li>✓ Error diagnostics</li>
              </ul>
              
              <Link 
                href="/test/vapi"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-block text-sm"
              >
                Open Test Utility
              </Link>
            </div>

            {/* Enhanced Voice Screening */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-purple-800">Enhanced Screening</h2>
              </div>
              
              <p className="text-purple-700 mb-4">
                Production-ready voice screening with advanced data retrieval and analysis.
              </p>
              
              <ul className="text-sm text-purple-600 mb-6 space-y-1">
                <li>✓ Multi-method data retrieval</li>
                <li>✓ Automatic retry logic</li>
                <li>✓ AI-powered analysis</li>
                <li>✓ Real-time monitoring</li>
                <li>✓ <a href="/ENHANCED_SCREENING_GUIDE.md" target="_blank" className="underline">Documentation</a></li>
              </ul>
              
              <Link 
                href="/test/enhanced"
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors inline-block text-sm"
              >
                Open Enhanced Demo
              </Link>
            </div>

            {/* Workflow Demo */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-green-800">Workflow Demo</h2>
              </div>
              
              <p className="text-green-700 mb-4">
                Experience the complete call workflow from initiation to data analysis.
              </p>
              
              <ul className="text-sm text-green-600 mb-6 space-y-1">
                <li>✓ Live call demonstration</li>
                <li>✓ Real-time data capture</li>
                <li>✓ Method comparison</li>
                <li>✓ Comprehensive analysis</li>
              </ul>
              
              <Link 
                href="/test/workflow"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors inline-block text-sm"
              >
                Start Demo
              </Link>
            </div>
          </div>

          {/* Documentation Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Methods</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Event-Based Capture</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Real-time transcript</li>
                  <li>• Audio URL detection</li>
                  <li>• Summary extraction</li>
                  <li>• Zero latency</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">REST API Retrieval</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Post-call data fetch</li>
                  <li>• Retry logic</li>
                  <li>• Complete call data</li>
                  <li>• AI summaries</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Comprehensive Analysis</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Multi-method approach</li>
                  <li>• Structured analysis</li>
                  <li>• Fallback mechanisms</li>
                  <li>• Formatted output</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Quick Setup</h3>
            <p className="text-yellow-700 text-sm mb-3">
              Make sure your environment variables are configured:
            </p>
            <div className="bg-yellow-100 p-3 rounded text-xs font-mono">
              <div>NEXT_PUBLIC_VAPI_API_KEY=your_public_api_key</div>
              <div>NEXT_PUBLIC_VAPI_PRIVATE_KEY=your_private_api_key</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestIndexPage;
