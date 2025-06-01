/**
 * Comprehensive demo of Vapi SDK call data retrieval methods
 * This component demonstrates the complete workflow from call initiation to data retrieval
 */

import React, { useState, useCallback, useRef } from 'react';
import { setupEnhancedVapiEventHandlers, getCallData, waitForCallData, VapiCallData } from '../../lib/services/vapiCallService';
import { getComprehensiveCallData, formatScreeningResult, ScreeningCallResult } from '../../lib/services/screeningCallAnalysis';

export const VapiWorkflowDemo: React.FC = () => {
  const [vapi, setVapi] = useState<any>(null);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Initializing...');
  const [callId, setCallId] = useState<string | null>(null);
  const [eventCapturedData, setEventCapturedData] = useState<VapiCallData | null>(null);
  const [apiRetrievedData, setApiRetrievedData] = useState<VapiCallData | null>(null);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<ScreeningCallResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const callDataRef = useRef<VapiCallData | null>(null);

  // Initialize Vapi SDK
  const initializeVapi = useCallback(async () => {
    try {
      setStatus('Initializing Vapi SDK...');
      
      // Import Vapi SDK
      const { default: Vapi } = await import('@vapi-ai/web');
      
      // Get API key from environment
      const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key is missing. Please check environment variables.');
      }
      
      // Initialize Vapi instance
      const vapiInstance = new Vapi(apiKey);
      
      // Setup enhanced event handlers
      const capturedDataRef = setupEnhancedVapiEventHandlers(vapiInstance);
      callDataRef.current = capturedDataRef;
      
      // Setup event handlers for demo
      vapiInstance.on('call-start', () => {
        setCallActive(true);
        setStatus('Call in progress...');
        setError('');
      });
      
      vapiInstance.on('call-end', () => {
        setCallActive(false);
        setStatus('Call ended, processing data...');
        
        // Capture event-based data
        if (capturedDataRef && (capturedDataRef.transcript || capturedDataRef.audioUrl || capturedDataRef.summary)) {
          setEventCapturedData({ ...capturedDataRef });
        }
        
        // Automatically retrieve API data after call ends
        setTimeout(() => {
          retrieveCallData();
        }, 2000); // Wait 2 seconds for processing
      });
      
      vapiInstance.on('error', (error: any) => {
        setError(`Call error: ${error?.error?.message || 'Unknown error'}`);
        setStatus('Error occurred');
        setCallActive(false);
      });
      
      setVapi(vapiInstance);
      setStatus('Ready to start call');
      
    } catch (error) {
      setError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('Initialization failed');
    }
  }, []);

  // Start demo call
  const startDemoCall = useCallback(async () => {
    if (!vapi) {
      setError('Vapi SDK not initialized');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setEventCapturedData(null);
      setApiRetrievedData(null);
      setComprehensiveAnalysis(null);
      
      // Demo assistant configuration
      const assistantOptions = {
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a friendly AI assistant conducting a brief demo call. Introduce yourself, ask the user their name, and have a short 30-second conversation. Keep it brief and professional."
            }
          ]
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer"
        },
        // Enable recording for audio URLs
        recordingEnabled: true,
        
        // Configure client messages to receive data
        clientMessages: [
          "transcript",
          "end-of-call-report",
          "call-summary",
          "conversation-update"
        ],
        
        // Enable analysis for automatic summaries
        analysisPlan: {
          summaryPrompt: "Provide a brief summary of this demo call, including any information the user shared."
        },
        
        // End call conditions
        endCallFunctionEnabled: true,
        endCallMessage: "Thank you for the demo! The call is now ending.",
        
        // Limit call duration for demo
        maxDurationSeconds: 60
      };
      
      // Start the call and capture the call ID
      const callResult = await vapi.start(assistantOptions);
      
      if (callResult?.id) {
        setCallId(callResult.id);
        console.log('Demo call started with ID:', callResult.id);
      }
      
    } catch (error) {
      setError(`Failed to start call: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('Failed to start call');
    } finally {
      setLoading(false);
    }
  }, [vapi]);

  // Retrieve call data via API
  const retrieveCallData = useCallback(async () => {
    if (!callId) {
      setError('No call ID available');
      return;
    }

    try {
      setLoading(true);
      setStatus('Retrieving call data via API...');
      
      // Method 1: Direct API call
      const directData = await getCallData(callId);
      
      if (directData) {
        setApiRetrievedData(directData);
        setStatus('Call data retrieved successfully');
      } else {
        // Method 2: Wait for data with retries
        setStatus('Waiting for call data to be processed...');
        const waitedData = await waitForCallData(callId, 5, 3000);
        
        if (waitedData) {
          setApiRetrievedData(waitedData);
          setStatus('Call data retrieved after waiting');
        } else {
          setStatus('Call data not yet available');
        }
      }
      
    } catch (error) {
      setError(`Failed to retrieve call data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [callId]);

  // Perform comprehensive analysis
  const performComprehensiveAnalysis = useCallback(async () => {
    if (!callId) {
      setError('No call ID available for analysis');
      return;
    }

    try {
      setLoading(true);
      setStatus('Performing comprehensive analysis...');
      
      const analysis = await getComprehensiveCallData(callId, eventCapturedData || undefined);
      setComprehensiveAnalysis(analysis);
      setStatus('Comprehensive analysis completed');
      
    } catch (error) {
      setError(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [callId, eventCapturedData]);

  // Initialize on component mount
  React.useEffect(() => {
    initializeVapi();
  }, [initializeVapi]);

  // End call manually
  const endCall = useCallback(() => {
    if (vapi && callActive) {
      vapi.stop();
    }
  }, [vapi, callActive]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Vapi SDK Complete Workflow Demo
        </h2>
        
        {/* Status Section */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Current Status:</h3>
          <p className="text-blue-700">{status}</p>
          {callId && (
            <p className="text-sm text-blue-600 mt-1">Call ID: {callId}</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={startDemoCall}
            disabled={loading || callActive}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            {callActive ? 'Call Active' : 'Start Demo Call'}
          </button>
          
          <button
            onClick={endCall}
            disabled={!callActive}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            End Call
          </button>
          
          <button
            onClick={retrieveCallData}
            disabled={loading || !callId || callActive}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            Retrieve Call Data
          </button>
          
          <button
            onClick={performComprehensiveAnalysis}
            disabled={loading || !callId || callActive}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
          >
            Analyze Call
          </button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Event-Captured Data */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Event-Captured Data</h3>
            {eventCapturedData ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Transcript:</strong>
                  <p className="text-gray-600 bg-white p-2 rounded mt-1 max-h-20 overflow-y-auto">
                    {eventCapturedData.transcript || 'No transcript captured'}
                  </p>
                </div>
                <div className="text-sm">
                  <strong>Audio URL:</strong>
                  <p className="text-gray-600 bg-white p-2 rounded mt-1 text-xs break-all">
                    {eventCapturedData.audioUrl || 'No audio URL'}
                  </p>
                </div>
                <div className="text-sm">
                  <strong>Summary:</strong>
                  <p className="text-gray-600 bg-white p-2 rounded mt-1 max-h-20 overflow-y-auto">
                    {eventCapturedData.summary || 'No summary captured'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No event data captured yet</p>
            )}
          </div>

          {/* API-Retrieved Data */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">API-Retrieved Data</h3>
            {apiRetrievedData ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Transcript:</strong>
                  <p className="text-gray-600 bg-white p-2 rounded mt-1 max-h-20 overflow-y-auto">
                    {apiRetrievedData.transcript || 'No transcript available'}
                  </p>
                </div>
                <div className="text-sm">
                  <strong>Audio URL:</strong>
                  <p className="text-gray-600 bg-white p-2 rounded mt-1 text-xs break-all">
                    {apiRetrievedData.audioUrl || 'No audio URL'}
                  </p>
                </div>
                <div className="text-sm">
                  <strong>Summary:</strong>
                  <p className="text-gray-600 bg-white p-2 rounded mt-1 max-h-20 overflow-y-auto">
                    {apiRetrievedData.summary || 'No summary available'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No API data retrieved yet</p>
            )}
          </div>

          {/* Comprehensive Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Comprehensive Analysis</h3>
            {comprehensiveAnalysis ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    comprehensiveAnalysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                    comprehensiveAnalysis.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {comprehensiveAnalysis.status}
                  </span>
                </div>
                <div className="text-sm">
                  <strong>Formatted Result:</strong>
                  <pre className="text-gray-600 bg-white p-2 rounded mt-1 text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {formatScreeningResult(comprehensiveAnalysis)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No analysis performed yet</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Demo Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Click "Start Demo Call" to initiate a brief demo conversation</li>
            <li>Have a short conversation with the AI assistant (30-60 seconds)</li>
            <li>The call will end automatically or you can click "End Call"</li>
            <li>After the call ends, data will be automatically retrieved</li>
            <li>Click "Analyze Call" to see the comprehensive analysis</li>
            <li>Compare the different data retrieval methods in the results</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default VapiWorkflowDemo;
