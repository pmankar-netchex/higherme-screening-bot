/**
 * Example usage of enhanced Vapi call data retrieval methods
 */

import React, { useState } from 'react';
import { getCallData, waitForCallData } from '../../lib/services/vapiCallService';
import { getComprehensiveCallData, formatScreeningResult } from '../../lib/services/screeningCallAnalysis';
import { retrieveCallDataWithRetry, generateEnhancedAnalysis } from '../../lib/services/enhancedScreeningService';

interface CallDataDemoProps {
  callId?: string;
}

export function CallDataDemo({ callId }: CallDataDemoProps) {
  const [loading, setLoading] = useState(false);
  const [callData, setCallData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleGetCallData = async () => {
    if (!callId) {
      setError('No call ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Method 1: Direct API call
      console.log('Fetching call data directly...');
      const directData = await getCallData(callId);
      
      if (directData) {
        setCallData(directData);
        console.log('Direct call data:', directData);
      } else {
        // Method 2: Wait for data with retries
        console.log('Waiting for call data to be processed...');
        const waitedData = await waitForCallData(callId, 5, 2000);
        
        if (waitedData) {
          setCallData(waitedData);
          console.log('Waited call data:', waitedData);
        } else {
          throw new Error('Call data not available after waiting');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get call data');
    } finally {
      setLoading(false);
    }
  };

  const handleGetComprehensiveData = async () => {
    if (!callId) {
      setError('No call ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const comprehensiveData = await getComprehensiveCallData(callId);
      setCallData(comprehensiveData);
      console.log('Comprehensive call data:', comprehensiveData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get comprehensive call data');
    } finally {
      setLoading(false);
    }
  };

  const handleGetEnhancedData = async () => {
    if (!callId) {
      setError('No call ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Use enhanced retrieval with robust retry logic
      const callData = await retrieveCallDataWithRetry(callId, 3);
      
      if (!callData) {
        throw new Error('Failed to retrieve call data after multiple attempts');
      }
      
      // Step 2: Generate enhanced analysis with scoring and insights
      const enhancedAnalysis = generateEnhancedAnalysis(callData);
      
      // Step 3: Combine the data
      const enhancedResult = {
        ...callData,
        enhancedAnalysis,
        // Add direct properties for easier access in the UI
        overallRating: enhancedAnalysis?.overallRating,
        recommendation: enhancedAnalysis?.recommendation,
        communicationScore: enhancedAnalysis?.communicationScore,
        technicalScore: enhancedAnalysis?.technicalScore,
        experienceScore: enhancedAnalysis?.experienceScore,
        keyStrengths: enhancedAnalysis?.keyStrengths,
        areasForImprovement: enhancedAnalysis?.areasForImprovement
      };
      
      setCallData(enhancedResult);
      console.log('Enhanced call data:', enhancedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get enhanced call data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Vapi Call Data Demo</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Call ID: {callId || 'Not provided'}
        </p>
        
        <div className="space-x-2 flex flex-wrap gap-2">
          <button
            onClick={handleGetCallData}
            disabled={loading || !callId}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Call Data (Direct)'}
          </button>
          
          <button
            onClick={handleGetComprehensiveData}
            disabled={loading || !callId}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Comprehensive Data'}
          </button>

          <button
            onClick={handleGetEnhancedData}
            disabled={loading || !callId}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Enhanced Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {callData && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Raw Call Data</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(callData, null, 2)}
            </pre>
          </div>

          {callData.transcript && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Transcript</h3>
              <div className="bg-blue-50 p-4 rounded">
                {callData.transcript}
              </div>
            </div>
          )}

          {callData.summary && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <div className="bg-green-50 p-4 rounded">
                {callData.summary}
              </div>
            </div>
          )}

          {callData.audioUrl && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Audio Recording</h3>
              <audio controls className="w-full">
                <source src={callData.audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-sm text-gray-600 mt-2">
                <a href={callData.audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  Download Recording
                </a>
              </p>
            </div>
          )}

          {callData.status && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Formatted Result</h3>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm">
                  {formatScreeningResult(callData)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Enhanced Analysis Section */}
          {callData.enhancedAnalysis && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Enhanced Analysis</h3>
              <div className="bg-purple-50 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Overall Rating: <span className="text-purple-700">{callData.enhancedAnalysis.overallRating}/10</span></p>
                    <p className="font-medium">Recommendation: <span className="text-purple-700">{callData.enhancedAnalysis.recommendation}</span></p>
                    <p className="mt-2">Communication Score: <span className="font-medium">{callData.enhancedAnalysis.communicationScore}/10</span></p>
                    <p>Technical Score: <span className="font-medium">{callData.enhancedAnalysis.technicalScore}/10</span></p>
                    <p>Experience Score: <span className="font-medium">{callData.enhancedAnalysis.experienceScore}/10</span></p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Key Strengths:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {callData.enhancedAnalysis.keyStrengths.map((strength: string, i: number) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                    
                    <p className="font-medium mt-3 mb-2">Areas for Improvement:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {callData.enhancedAnalysis.areasForImprovement.map((area: string, i: number) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
