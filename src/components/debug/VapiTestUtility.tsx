/**
 * Test utility for validating Vapi SDK call data retrieval methods
 */

import React, { useState } from 'react';
import { getCallData, waitForCallData, VapiCallData } from '../../lib/services/vapiCallService';
import { getComprehensiveCallData, formatScreeningResult, ScreeningCallResult } from '../../lib/services/screeningCallAnalysis';

export const VapiTestUtility: React.FC = () => {
  const [testCallId, setTestCallId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testDirectAPICall = async () => {
    if (!testCallId.trim()) {
      setError('Please enter a call ID to test');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      console.log('Testing direct API call for call ID:', testCallId);
      const callData = await getCallData(testCallId);
      
      setResults({
        method: 'Direct API Call',
        success: !!callData,
        data: callData,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(`Direct API call failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testWaitForData = async () => {
    if (!testCallId.trim()) {
      setError('Please enter a call ID to test');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      console.log('Testing wait for data with retries for call ID:', testCallId);
      const callData = await waitForCallData(testCallId, 5, 2000);
      
      setResults({
        method: 'Wait for Data (with retries)',
        success: !!callData,
        data: callData,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(`Wait for data failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testComprehensiveAnalysis = async () => {
    if (!testCallId.trim()) {
      setError('Please enter a call ID to test');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      console.log('Testing comprehensive analysis for call ID:', testCallId);
      const analysisResult = await getComprehensiveCallData(testCallId);
      
      setResults({
        method: 'Comprehensive Analysis',
        success: !!analysisResult,
        data: analysisResult,
        formattedResult: formatScreeningResult(analysisResult),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(`Comprehensive analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const validateConfiguration = () => {
    const checks = {
      publicApiKey: !!process.env.NEXT_PUBLIC_VAPI_API_KEY,
      privateApiKey: !!process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY,
    };

    setResults({
      method: 'Configuration Check',
      success: checks.publicApiKey,
      data: checks,
      timestamp: new Date().toISOString()
    });

    if (!checks.publicApiKey) {
      setError('NEXT_PUBLIC_VAPI_API_KEY is not configured');
    } else if (!checks.privateApiKey) {
      setError('NEXT_PUBLIC_VAPI_PRIVATE_KEY is not configured (needed for REST API calls)');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Vapi SDK Test Utility
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Call ID:
          </label>
          <input
            type="text"
            value={testCallId}
            onChange={(e) => setTestCallId(e.target.value)}
            placeholder="Enter a call ID to test"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={validateConfiguration}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Check Configuration
          </button>
          
          <button
            onClick={testDirectAPICall}
            disabled={loading || !testCallId.trim()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Test Direct API Call
          </button>
          
          <button
            onClick={testWaitForData}
            disabled={loading || !testCallId.trim()}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
          >
            Test Wait for Data
          </button>
          
          <button
            onClick={testComprehensiveAnalysis}
            disabled={loading || !testCallId.trim()}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            Test Comprehensive Analysis
          </button>
        </div>

        {loading && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded">
            <p className="text-blue-800">Testing in progress...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {results && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded">
            <h3 className="font-bold text-green-800 mb-2">Test Results:</h3>
            <div className="text-sm text-green-700">
              <p><strong>Method:</strong> {results.method}</p>
              <p><strong>Success:</strong> {results.success ? 'Yes' : 'No'}</p>
              <p><strong>Timestamp:</strong> {results.timestamp}</p>
              
              {results.formattedResult && (
                <div className="mt-2">
                  <strong>Formatted Result:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                    {results.formattedResult}
                  </pre>
                </div>
              )}
              
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Raw Data</summary>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>First, click "Check Configuration" to verify API keys are set up</li>
            <li>To test with a real call ID, make a test call first and note the call ID</li>
            <li>Enter the call ID and test the different retrieval methods</li>
            <li>Compare the results to see which method works best for your use case</li>
          </ol>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Expected Environment Variables:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li><code>NEXT_PUBLIC_VAPI_API_KEY</code> - For Web SDK initialization</li>
              <li><code>NEXT_PUBLIC_VAPI_PRIVATE_KEY</code> - For REST API calls</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VapiTestUtility;
