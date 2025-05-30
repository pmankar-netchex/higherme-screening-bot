'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ScreeningCall, ScreeningRole, Job, Candidate, ScreeningSummary } from '../../../lib/types';
import { createScreeningAssistantOptions, DEFAULT_VAPI_CONFIG } from '../../../lib/integrations/vapi/vapiConfig';
import { determineScreeningRole, parseScreeningSummary, saveScreeningSummary, updateScreeningStatus, createScreeningRecord } from '../../../lib/screening/screeningService';
import Link from 'next/link';

// Define Vapi error interface
interface VapiError {
  error?: {
    message?: string;
    statusCode?: number;
  };
}

// Define Vapi SDK event handler types
interface VapiCallSummary {
  summary?: string;
  transcript?: string;
  audioUrl?: string;
  parsedSummary?: ScreeningSummary;
}

// Define Vapi SDK event handlers
interface VapiEventHandlers {
  'call-end': (callSummary: VapiCallSummary) => void;
  'call-start': () => void;
  'speech-start': () => void;
  'speech-end': () => void;
  'volume-level': (level: number) => void;
  'error': (error: VapiError) => void;
}

interface VoiceScreeningCallProps {
  jobId: string;
  candidateId: string;
  applicationId: string;
  job?: Job;
  candidate?: Candidate;
  onCallStart?: () => void;
  onCallEnd?: (summary?: any) => void;
  onCallError?: (error: Error) => void;
}

const VoiceScreeningCall: React.FC<VoiceScreeningCallProps> = ({
  jobId,
  candidateId,
  applicationId,
  job,
  candidate,
  onCallStart,
  onCallEnd,
  onCallError
}) => {
  // Component state
  const [vapi, setVapi] = useState<any>(null);
  const [status, setStatus] = useState<string>('initializing');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [callActive, setCallActive] = useState<boolean>(false);
  const [screeningRole, setScreeningRole] = useState<ScreeningRole>('general');
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [callAttempts, setCallAttempts] = useState<number>(0);
  const [processingCall, setProcessingCall] = useState<boolean>(false);
  const [generatedSummary, setGeneratedSummary] = useState<ScreeningSummary | null>(null);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);

  // Determine role type from job department/title
  useEffect(() => {
    if (job) {
      const role = determineScreeningRole(job.title, job.department);
      setScreeningRole(role);
    }
  }, [job]);

  // Create screening record on component mount
  useEffect(() => {
    const initScreeningRecord = async () => {
      if (jobId && candidateId && applicationId) {
        try {
          const id = await createScreeningRecord(applicationId, candidateId, jobId);
          if (id) {
            setScreeningId(id);
            console.log(`Created screening record with ID: ${id}`);
          }
        } catch (error) {
          console.error('Failed to create screening record:', error);
        }
      }
    };

    initScreeningRecord();
  }, [jobId, candidateId, applicationId]);

  // Initialize the Vapi Web SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initVapi = async () => {
      try {
        setIsLoading(true);
        
        // Import Vapi SDK
        const { default: Vapi } = await import('@vapi-ai/web');
        
        // Get API key from environment
        const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
        
        if (!apiKey) {
          throw new Error('API key is missing. Please check environment variables.');
        }
        
        // Initialize Vapi instance
        const vapiInstance = new Vapi(apiKey);
        setVapi(vapiInstance);
        
        vapiInstance.on('call-start', () => {
          setStatus('Call active');
          setCallActive(true);
          setErrorMessage('');
          if (onCallStart) onCallStart();
          
          // Set maximum call duration timer as a safety fallback
          // Use 3.5 minutes as maximum duration (slightly longer than the expected 3 minutes)
          const maxCallDuration = DEFAULT_VAPI_CONFIG.maxCallDuration * 1000 + 30000; // convert to ms and add 30s buffer
          const timer = setTimeout(() => {
            console.log('Maximum call duration reached, ending call automatically');
            if (vapi) {
              try {
                vapi.stop();
              } catch (error) {
                console.error('Error stopping call after timeout:', error);
              }
            }
          }, maxCallDuration);
          
          setCallTimer(timer);
          
          // Update screening status to in_progress
          (async () => {
            if (screeningId) {
              await updateScreeningStatus(screeningId, 'screening_in_progress');
            }
          })();
        });
        
        vapiInstance.on('call-end', () => {
          setStatus('Call ended');
          setCallActive(false);
          setProcessingCall(true);
          
          // Clear the safety timeout
          if (callTimer) {
            clearTimeout(callTimer);
            setCallTimer(null);
          }
          
          // Process call completion async but don't await in event handler
          (async () => {
            try {
              console.log('Call ended, processing completion...');
              
              // For now, mark the screening as completed without summary data
              // In a production environment, you would typically:
              // 1. Make an API call to retrieve call data from Vapi's servers
              // 2. Or capture the data during the call via the 'message' event
              // 3. Or use webhooks to receive call data on your server
              
              // Update screening status to completed without summary data for now
              if (screeningId) {
                await updateScreeningStatus(screeningId, 'screening_completed', {
                  transcript: 'Call completed - transcript processing pending',
                  audioUrl: 'Call completed - audio processing pending',
                });
                
                console.log('Updated screening status to completed');
              }
              
              // Pass completion status to the parent component
              if (onCallEnd) {
                onCallEnd({
                  summary: 'Call completed successfully',
                  transcript: 'Call completed - transcript processing pending',
                  audioUrl: 'Call completed - audio processing pending',
                  parsedSummary: null
                });
              }
            } catch (error) {
              console.error('Error processing call completion:', error);
              
              // Update screening status with error
              if (screeningId) {
                await updateScreeningStatus(screeningId, 'rejected', {
                  errorMessage: 'Error processing call completion'
                });
              }
            } finally {
              setProcessingCall(false);
            }
          })();
        });
        
        vapiInstance.on('speech-start', () => {
          setIsSpeaking(true);
        });
        
        vapiInstance.on('speech-end', () => {
          setIsSpeaking(false);
        });
        
        vapiInstance.on('volume-level', (level: number) => {
          setVolumeLevel(level);
        });
        
        // Listen for messages from the assistant during the call
        // This is how we can capture transcript and other call data
        vapiInstance.on('message', (message: any) => {
          console.log('Vapi message received:', message);
          
          // Handle different types of messages
          if (message?.type === 'transcript' && message?.transcript) {
            console.log('Transcript received:', message.transcript);
            // Store transcript data for later use
            // You could accumulate transcript pieces here
          }
          
          if (message?.type === 'function-call') {
            console.log('Function call received:', message);
          }
          
          // Handle end-of-call summary if provided via messages
          if (message?.type === 'end-of-call-report' || message?.type === 'call-summary') {
            console.log('Call summary received via message:', message);
            // This is where you might receive call summary data
          }
        });
        
        vapiInstance.on('error', (error: VapiError) => {
          console.error('Vapi error:', error);
          
          let errorMsg = 'Call failed';
          
          if (error?.error?.message?.includes('card details') || 
              error?.error?.message?.includes('payment')) {
            errorMsg = 'Payment required. Please contact the administrator.';
          } else if (error?.error?.statusCode === 401 || error?.error?.statusCode === 403) {
            errorMsg = 'API key is invalid. Please contact the administrator.';
          } else if (error?.error?.message) {
            errorMsg = error.error.message;
          }
          
          setErrorMessage(errorMsg);
          setStatus('Error');
          setCallActive(false);
          
          // Update screening status in the database async
          (async () => {
            if (screeningId) {
              await updateScreeningStatus(screeningId, 'rejected', { 
                errorMessage: errorMsg
              });
            }
          })();
          
          if (onCallError) onCallError(new Error(errorMsg));
        });
        
        setStatus('Ready');
      } catch (error) {
        console.error('Error initializing Vapi:', error);
        setErrorMessage('Failed to initialize voice screening system.');
        setStatus('Error');
        if (onCallError) onCallError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initVapi();
    
    // Cleanup on unmount
    return () => {
      // Clear safety timeout if it exists
      if (callTimer) {
        clearTimeout(callTimer);
      }
      
      // Stop the call if active
      if (vapi) {
        try {
          vapi.stop();
        } catch (error) {
          console.error('Error stopping call during cleanup:', error);
        }
      }
    };
  }, [onCallStart, onCallEnd, onCallError, screeningId]);
  
  // Start screening call
  const startCall = useCallback(async () => {
    if (!vapi) {
      setErrorMessage('Voice screening system not initialized.');
      return;
    }
    
    if (!candidate) {
      setErrorMessage('Candidate information is missing.');
      return;
    }
    
    if (!job) {
      setErrorMessage('Job information is missing.');
      return;
    }

    // Increment call attempts counter
    setCallAttempts(prev => prev + 1);
    
    try {
      setStatus('Starting call...');
      setErrorMessage('');
      
      // Create assistant options using job and candidate data
      const assistantOptions = createScreeningAssistantOptions(
        job.title,
        `${candidate.firstName} ${candidate.lastName}`,
        screeningRole
      );
      
      // Start the call
      await vapi.start(assistantOptions);
    } catch (error) {
      console.error('Error starting call:', error);
      setErrorMessage('Failed to start screening call.');
      setStatus('Error');
      setCallActive(false);
      if (onCallError) onCallError(error as Error);
    }
  }, [vapi, candidate, job, screeningRole, onCallError]);
  
  // End screening call
  const endCall = useCallback(() => {
    if (!vapi) return;
    
    try {
      // Clear safety timeout if it exists
      if (callTimer) {
        clearTimeout(callTimer);
        setCallTimer(null);
      }
      
      // Stop the Vapi call
      vapi.stop();
      
      // Update UI state immediately for better feedback
      setStatus('Call ended');
      
    } catch (error) {
      console.error('Error stopping call:', error);
      setErrorMessage('Failed to end call. Please try again.');
    }
  }, [vapi, callTimer]);

  // Retry handling after error
  const retryCall = useCallback(() => {
    setErrorMessage('');
    setStatus('Ready');
    
    // Only allow 3 attempts
    if (callAttempts >= 3) {
      setErrorMessage('Maximum retry attempts reached. Please try again later or contact support.');
      return;
    }
    
    startCall();
  }, [startCall, callAttempts]);

  // Render volume indicator
  const renderVolumeIndicator = () => {
    return (
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-5 rounded-sm transition-all ${
              i / 10 < volumeLevel 
                ? 'bg-blue-500' 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Initializing voice screening system...</p>
      </div>
    );
  }

  // Processing state (saving summary)
  if (processingCall) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Processing your screening results...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Voice Screening Issue</h3>
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <div className="flex flex-col space-y-4">
          {callAttempts < 3 && (
            <button
              onClick={retryCall}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Screening Call
            </button>
          )}
          <Link 
            href="/candidate"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-center hover:bg-gray-200 transition-colors"
          >
            Return to Job Listings
          </Link>
        </div>
      </div>
    );
  }

    return (
      <div className="flex flex-col bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            AI Voice Screening
          </h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
            callActive 
              ? 'bg-green-100 text-green-800' 
              : status === 'Error' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              callActive ? 'bg-green-600 animate-pulse' : status === 'Error' ? 'bg-red-600' : 'bg-blue-600'
            }`}></span>
            {callActive ? 'Call Active' : status}
          </div>
          
          {screeningRole && (
            <div className="text-sm text-gray-500 mb-2">
              Screening configured for: <span className="font-medium text-gray-700 capitalize">{screeningRole} role</span>
            </div>
          )}
          
          <p className="text-gray-600 mb-2 max-w-lg mx-auto">
            {callActive 
              ? 'Please speak clearly and answer the questions. This screening will take approximately 2-3 minutes.'
              : 'The AI assistant will ask you questions about your experience, availability, and fit for the position.'}
          </p>
          {callActive && (
            <div className="text-xs text-gray-500 mb-6 flex items-center justify-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>The call will end automatically after the assistant completes all questions</span>
            </div>
          )}
        </div>

        {callActive && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
            <div className="flex justify-center mb-3">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
                isSpeaking ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {isSpeaking ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                )}
              </div>
            </div>
            
            <p className="text-lg font-medium text-blue-800">
              {isSpeaking ? 'Assistant is speaking...' : 'Assistant is listening...'}
            </p>
            
            {renderVolumeIndicator()}
          </div>
        )}

        <div className="mt-auto flex flex-col items-center">
          {!callActive ? (
            <button
              onClick={startCall}
              disabled={status === 'Error'}
              className={`w-full max-w-xs py-3 px-4 rounded-lg flex items-center justify-center text-white font-medium ${
                status === 'Error'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 transition-colors'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Start Screening Call
            </button>
          ) : (
            <div className="flex flex-col gap-2 items-center w-full">
              <button
                onClick={endCall}
                className="w-full max-w-xs py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Call
              </button>
              <p className="text-xs text-gray-500">Click to end the call manually</p>
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-500">
            {!callActive
              ? "Your call will be processed by our AI system to assess fit for the position."
              : "Please complete the entire screening call for best results."}
          </p>
          
          {callAttempts > 0 && !callActive && (
            <p className="mt-2 text-xs text-gray-400">
              Call attempts: {callAttempts}/3
            </p>
          )}
        </div>
      </div>
    );
};

export default VoiceScreeningCall;
