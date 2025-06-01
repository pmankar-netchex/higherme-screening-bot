'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ScreeningCall, ScreeningRole, Job, Candidate, ScreeningSummary } from '../../../lib/types';
import { createScreeningAssistantOptions, DEFAULT_VAPI_CONFIG } from '../../../lib/integrations/vapi/vapiConfig';
import { 
  determineScreeningRole, 
  parseScreeningSummary, 
  saveScreeningSummary, 
  updateScreeningStatus, 
  createScreeningRecord 
} from '../../../lib/screening/screeningService';
import { 
  setupEnhancedVapiEventHandlers, 
  getCallData, 
  waitForCallData, 
  VapiCallData 
} from '../../../lib/services/vapiCallService';
import {
  readScreeningsFromAPI,
  hasActiveScreeningCall,
  hasReachedScreeningCallLimit,
  handleInterruptedCall,
  getMaxAllowedCalls,
  isRetryAllowed,
  logScreeningError,
  releaseScreeningResources,
  cleanupStaleScreeningCalls
} from '../../../lib/services/clientScreeningService';
import { 
  parseScreeningCallData, 
  ScreeningCallResult, 
  getComprehensiveCallData 
} from '../../../lib/services/screeningCallAnalysis';
import { 
  retrieveCallDataWithRetry,
  analyzeCallDataComprehensively, 
  analyzeScreeningCall 
} from '../../../lib/services/enhancedScreeningService';
import { 
  handleCallFailure, 
  analyzeFailedCall, 
  CallErrorDetails, 
  detectStateConflicts, 
  analyzeTranscriptForErrors, 
  logPostProcessingFailure 
} from '../../../lib/services/callErrorLogger';

// Enhanced interfaces for better type safety
interface VapiError {
  error?: {
    message?: string;
    statusCode?: number;
  };
}

interface CallDataState {
  transcript?: string;
  summary?: string;
  audioUrl?: string;
  callId?: string;
  duration?: number;
  status?: string;
  analysis?: any; // Using any here to accommodate different analysis formats
  retrievalAttempts?: number;
  lastRetrievalError?: string;
  overallRating?: number;
  recommendation?: string;
  errorMessage?: string;
}

interface UnifiedVoiceScreeningCallProps {
  jobId: string;
  candidateId: string;
  applicationId: string;
  job?: Job;
  candidate?: Candidate;
  onCallStart?: () => void;
  onCallEnd?: (summary?: any) => void;
  onCallError?: (error: Error) => void;
  onDataRetrieved?: (data: CallDataState) => void;
  autoRetry?: boolean;
  maxRetryAttempts?: number;
  showDebugInfo?: boolean;
}

const UnifiedVoiceScreeningCall: React.FC<UnifiedVoiceScreeningCallProps> = ({
  jobId,
  candidateId,
  applicationId,
  job,
  candidate,
  onCallStart,
  onCallEnd,
  onCallError,
  onDataRetrieved,
  autoRetry = true,
  maxRetryAttempts = 5,
  showDebugInfo = false
}) => {
  // Define default empty summary structure early in the component
  const defaultSummary: ScreeningSummary = {
    experience: { evaluation: '', highlights: [] },
    availability: { morning: false, evening: false, weekends: false, notes: '' },
    transportation: { hasReliableTransportation: false, notes: '' },
    softSkills: { evaluation: '', highlights: [] },
    roleSpecific: { evaluation: '', strengths: [], areas_of_improvement: [] }
  };

  // Core state
  const [vapi, setVapi] = useState<any>(null);
  const [status, setStatus] = useState<string>('initializing');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [screeningRole, setScreeningRole] = useState<ScreeningRole>('general');
  const [screeningId, setScreeningId] = useState<string | null>(null);
  
  // Call data state
  const [callData, setCallData] = useState<CallDataState>({});
  const [isRetrievingData, setIsRetrievingData] = useState<boolean>(false);
  const [dataRetrievalProgress, setDataRetrievalProgress] = useState<string>('');
  const [processingCall, setProcessingCall] = useState<boolean>(false);
  const [callAttempts, setCallAttempts] = useState<number>(0);
  const [startingCall, setStartingCall] = useState<boolean>(false);
  
  // UI state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [callDuration, setCallDuration] = useState<number>(0);
  
  // Refs for cleanup
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataRetrievalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine screening role
  useEffect(() => {
    if (job) {
      const role = determineScreeningRole(job.title, job.department);
      setScreeningRole(role);
    }
  }, [job]);

  // Create screening record
  useEffect(() => {
    const initScreeningRecord = async () => {
      if (jobId && candidateId && applicationId) {
        try {
          // Check for stale calls and clean them up first
          const cleanedUpCount = await cleanupStaleScreeningCalls(10); // 10 minutes timeout
          if (cleanedUpCount > 0) {
            console.log(`Cleaned up ${cleanedUpCount} stale screening calls before initialization`);
          }
          
          // Check if this application already has an active screening call
          const hasActiveCall = await hasActiveScreeningCall(applicationId);
          if (hasActiveCall) {
            const errorMsg = 'There is already an active screening call for this application.';
            setErrorMessage(errorMsg);
            setStatus('error');
            
            // Log this special case
            await logScreeningError(applicationId, 'duplicate_active_call', {
              jobId,
              candidateId,
              timestamp: new Date().toISOString()
            });
            
            if (onCallError) onCallError(new Error(errorMsg));
            return;
          }
          
          // Check if this application has reached its call limit (default: 1)
          const maxAllowedCalls = await getMaxAllowedCalls(applicationId);
          
          // Get the completed screening count - this now only counts successful screenings
          const hasReachedLimit = await hasReachedScreeningCallLimit(applicationId, maxAllowedCalls);
          if (hasReachedLimit) {
            const errorMsg = 'This application has already been screened successfully. Only one completed screening call is allowed per application.';
            setErrorMessage(errorMsg);
            setStatus('error');
            
            // Log this case for analytics
            await logScreeningError(applicationId, 'call_limit_reached', {
              jobId,
              candidateId,
              maxAllowedCalls,
              timestamp: new Date().toISOString()
            });
            
            if (onCallError) onCallError(new Error('Call limit reached: Only one successful screening is allowed per application.'));
            return;
          }
          
          // Check if retries are allowed for failed calls
          const retryAllowed = await isRetryAllowed(applicationId);
          if (!retryAllowed) {
            const errorMsg = 'You have exceeded the maximum number of retry attempts for this application.';
            setErrorMessage(errorMsg);
            setStatus('error');
            
            await logScreeningError(applicationId, 'retry_limit_reached', {
              jobId,
              candidateId,
              timestamp: new Date().toISOString()
            });
            
            if (onCallError) onCallError(new Error('Retry limit reached: You cannot make any more screening attempts for this application.'));
            return;
          }
          
          // Create a new screening record
          const id = await createScreeningRecord(applicationId, candidateId, jobId);
          if (id) {
            setScreeningId(id);
            console.log(`Created screening record with ID: ${id}`);
          } else {
            throw new Error('Failed to create screening record - no ID returned');
          }
        } catch (error) {
          console.error('Error during screening initialization:', error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          setErrorMessage(errorMsg);
          setStatus('error');
          
          if (onCallError) {
            onCallError(error instanceof Error ? error : new Error(errorMsg));
          }
        }
      }
    };

    initScreeningRecord();
  }, [jobId, candidateId, applicationId, onCallError]);

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
        
        // Setup enhanced event handlers to capture call data
        setupEnhancedVapiEventHandlers(vapiInstance);
        
        setIsLoading(false);
        setStatus('ready');
      } catch (error) {
        console.error('Failed to initialize Vapi:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize Vapi');
        setStatus('error');
        setIsLoading(false);
        if (onCallError) onCallError(error instanceof Error ? error : new Error('Failed to initialize Vapi'));
      }
    };

    initVapi();
  }, [onCallError]);

  // Set up Vapi event handlers when vapi instance is available
  useEffect(() => {
    if (!vapi) return;
    
    // Define handler functions as named variables so we can reference them in cleanup
    const handleCallStart = (callInfo: any) => {
      console.log('Call started', callInfo);
      setStatus('Call active');
      setCallActive(true);
      setStartingCall(false); // Reset starting state when call is actually active
      setErrorMessage('');
      
      // Store call ID if available and we don't already have one
      if (callInfo?.id) {
        setCallData(prev => {
          // Only update if we don't already have a call ID
          if (!prev.callId) {
            console.log('Call ID captured from call-start event:', callInfo.id);
            return { ...prev, callId: callInfo.id };
          }
          console.log('Call ID already exists, keeping existing:', prev.callId);
          return prev;
        });
      }
      
      // Start call duration timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        const duration = Math.round((Date.now() - startTime) / 1000);
        setCallDuration(duration);
      }, 1000);
      
      durationTimerRef.current = timer;
      
      // Set maximum call duration timer as a safety fallback
      const maxCallDuration = DEFAULT_VAPI_CONFIG.maxCallDuration * 1000 + 30000; // convert to ms and add 30s buffer
      const safetyTimer = setTimeout(() => {
        console.log('Maximum call duration reached, ending call automatically');
        if (vapi) {
          try {
            vapi.stop();
          } catch (error) {
            console.error('Error stopping call after timeout:', error);
          }
        }
      }, maxCallDuration);
      
      callTimerRef.current = safetyTimer;
      
      if (onCallStart) onCallStart();
      
      // Update screening status to in_progress
      (async () => {
        if (screeningId) {
          await updateScreeningStatus(screeningId, 'screening_in_progress');
        }
      })();
    };
    
    // Handle call end
    const handleCallEnd = () => {
      console.log('Call ended event received');
      setStatus('Call ended');
      setCallActive(false);
      setStartingCall(false); // Reset starting state when call ends
      setProcessingCall(true);
      
      // Clear timers
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      
      if (callTimerRef.current) {
        clearTimeout(callTimerRef.current);
        callTimerRef.current = null;
      }
      
      // Process call completion with proper delay
      const callId = callData.callId;
      if (callId) {
        // Wait a bit longer before retrieving data to ensure it's available
        setTimeout(() => {
          retrieveCallData(callId);
        }, 3000); // Increased delay to 3 seconds
      } else {
        console.error('No call ID available for data retrieval');
        setErrorMessage('Call completed but no call ID available for data retrieval');
        
        // Even if there's no call ID, update the screening status
        if (screeningId) {
          (async () => {
            try {
              await updateScreeningStatus(screeningId, 'screening_completed', {
                errorMessage: 'Call completed but no call ID available for data retrieval'
              });
            } catch (error) {
              console.error('Failed to update screening status after call end:', error);
            }
          })();
        }
        
        setProcessingCall(false);
        if (onCallEnd) {
          onCallEnd({ summary: 'Call completed but no data available' });
        }
      }
    };
    
    // Handle speech events for UI feedback
    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };
    
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };
    
    // Handle volume level for UI feedback
    const handleVolumeLevel = (level: number) => {
      setVolumeLevel(level);
    };
    
    // Handle errors
    const handleError = (error: VapiError) => {
      const errorMsg = error?.error?.message || 'Unknown error occurred';
      console.error('Vapi error:', errorMsg);
      setErrorMessage(errorMsg);
      setStatus('error');
      setCallActive(false);
      setStartingCall(false); // Reset starting state on error
      
      if (onCallError) onCallError(new Error(errorMsg));
      
      // Log error with enhanced reporting
      handleCallFailure(errorMsg, callData.callId, callDuration);
    };
    
    // Register event handlers
    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('volume-level', handleVolumeLevel);
    vapi.on('error', handleError);
    
    // Clean up event listeners on unmount
    return () => {
      if (vapi) {
        vapi.off('call-start', handleCallStart);
        vapi.off('call-end', handleCallEnd);
        vapi.off('speech-start', handleSpeechStart);
        vapi.off('speech-end', handleSpeechEnd);
        vapi.off('volume-level', handleVolumeLevel);
        vapi.off('error', handleError);
      }
    };
  }, [vapi, callData, callDuration, onCallStart, onCallError, screeningId]);

  // Add a ref to track if the component is being unmounted due to navigation
  const isNavigatingRef = useRef(false);
  const callCompletedRef = useRef(false);

  // Track navigation events
  useEffect(() => {
    const handleBeforeUnload = () => {
      isNavigatingRef.current = true;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && (callActive || processingCall)) {
        isNavigatingRef.current = true;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [callActive, processingCall]);

  // Cleanup timers on unmount and ensure screening is marked as completed if necessary
  useEffect(() => {
    return () => {
      // Clear all timers
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (callTimerRef.current) clearTimeout(callTimerRef.current);
      if (dataRetrievalTimeoutRef.current) clearTimeout(dataRetrievalTimeoutRef.current);
      
      // Only mark as interrupted if this is actually due to navigation/page unload
      // and the call hasn't already completed normally
      if ((callActive || processingCall) && screeningId && isNavigatingRef.current && !callCompletedRef.current) {
        try {
          console.log('Component unmounting due to navigation with active/processing call - marking call as interrupted');
          
          // Log this event to track how often this happens
          logScreeningError(applicationId, 'page_navigation_interrupt', {
            screeningId,
            callStatus: callActive ? 'active' : 'processing',
            timestamp: new Date().toISOString()
          });
          
          // Use the specialized util function to handle interrupted calls
          const interruptHandled = handleInterruptedCall(screeningId, 'Call interrupted due to page navigation or component unmount');
          
          // Release any resources that might be held by the call
          releaseScreeningResources(screeningId);
          
          // As a fallback, also try the old method if our handler didn't succeed
          if (!interruptHandled) {
            (async () => {
              try {
                await updateScreeningStatus(screeningId, 'rejected', {
                  errorMessage: 'Call interrupted due to page navigation or component unmount'
                });
              } catch (error) {
                console.error('Failed to update screening status during unmount cleanup:', error);
              }
            })();
          }
        } catch (error) {
          console.error('Failed to handle interrupted call during unmount cleanup:', error);
        }
      } else if ((callActive || processingCall) && screeningId && !isNavigatingRef.current) {
        // This is likely a React re-render or strict mode unmount, not actual navigation
        console.log('Component unmounting without navigation detected - likely React re-render, not marking as interrupted');
      }
    };
  }, [callActive, processingCall, screeningId, applicationId]);

  // Specialized error handler that categorizes errors and takes appropriate actions
  const handleScreeningError = useCallback((error: Error | unknown, phase: 'initialization' | 'call' | 'processing' = 'call') => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log the error with our enhanced error logger
    const errorId = logScreeningError(applicationId, phase, {
      error: errorMessage,
      applicationId,
      screeningId,
      timestamp: new Date().toISOString()
    });
    
    console.error(`[${errorId}] Screening error during ${phase} phase:`, error);
    
    // Set error state in the component
    setErrorMessage(errorMessage);
    setStatus('error');
    
    // If a call was active, make sure to release resources
    if (callActive && screeningId) {
      handleInterruptedCall(screeningId, `Call interrupted due to error: ${errorMessage}`);
      releaseScreeningResources(screeningId);
    }
    
    // Call the parent's error handler if provided
    if (onCallError) {
      onCallError(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [applicationId, callActive, onCallError, screeningId]);
  
  // Start call with assistant options
  const startCall = useCallback(async () => {
    if (!vapi || callActive || startingCall) return;
    
    try {
      setStartingCall(true);
      setErrorMessage('');
      setStatus('Starting call...');
      setCallAttempts(prev => prev + 1);
      
      // Create assistant options based on job role
      const assistantOptions = createScreeningAssistantOptions(
        job?.title || 'the position',
        candidate?.firstName || 'Candidate',
        screeningRole
      );
      
      console.log(`Starting call with role: ${screeningRole}`);
      
      if (showDebugInfo) {
        console.log('Assistant options:', assistantOptions);
      }
      
      // Start the call and capture the result
      const callResult = await vapi.start(assistantOptions);
      console.log('Call started with result:', callResult);
      
      // Extract call ID if available from the start result
      if (callResult?.id) {
        setCallData(prev => ({ ...prev, callId: callResult.id }));
        console.log('Call ID captured from start result:', callResult.id);
      }
      
      // Reset starting state once call is initiated
      setStartingCall(false);
      setStatus('Call initiated');
    } catch (error) {
      console.error('Failed to start call:', error);
      setStartingCall(false);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start call');
      setStatus('error');
      if (onCallError) onCallError(error instanceof Error ? error : new Error('Failed to start call'));
    }
  }, [vapi, callActive, startingCall, screeningRole, candidate, job, showDebugInfo, onCallError]);
  
  // Stop active call
  const stopCall = useCallback(() => {
    if (!vapi || !callActive) return;
    
    try {
      vapi.stop();
      console.log('Call stopped by user');
    } catch (error) {
      console.error('Error stopping call:', error);
    }
  }, [vapi, callActive]);
  
  // Enhanced call data retrieval with retry
  const retrieveCallData = useCallback(async (callId: string) => {
    setIsRetrievingData(true);
    setDataRetrievalProgress('Starting data retrieval...');
    
    try {
      // First attempt with regular wait
      setDataRetrievalProgress('Retrieving call data...');
      let vapiCallData = await retrieveCallDataWithRetry(callId, maxRetryAttempts, 2000);
      
      // If no transcript after first attempt, try adding a longer delay
      if (!vapiCallData?.transcript) {
        setDataRetrievalProgress('Initial retrieval incomplete, waiting longer...');
        
        // Wait 5 seconds before trying again
        await new Promise(resolve => {
          dataRetrievalTimeoutRef.current = setTimeout(resolve, 5000) as unknown as NodeJS.Timeout;
        });
        
        setDataRetrievalProgress('Retrieving call data (attempt 2)...');
        vapiCallData = await retrieveCallDataWithRetry(callId, 3, 3000);
      }
      
      // Ensure we always update the screening status to completed, regardless of data retrieval success
      let screeningStatus = 'screening_completed';
      let screeningUpdateSuccess = false;
      
      // Update local state with retrieved data
      if (vapiCallData) {
        // Check for inconsistent state like successful transcript but error message
        const stateCheck = detectStateConflicts(vapiCallData);
        
        if (stateCheck.hasConflicts) {
          // Log diagnostic information about the conflict
          console.log(`[POST-PROCESSING] Detected ${stateCheck.severity} severity conflicts for call ${vapiCallData.id}:`, {
            hasErrorMessage: !!vapiCallData.errorMessage,
            errorMessage: vapiCallData.errorMessage,
            hasTranscript: !!vapiCallData.transcript,
            transcriptLength: vapiCallData.transcript?.length || 0,
            conflicts: stateCheck.conflicts,
            recommendations: stateCheck.recommendations
          });
          
          setDataRetrievalProgress(`Detected call state conflicts: ${stateCheck.conflicts.join(', ')}`);
          
          // Track this special case with detailed logging
          logPostProcessingFailure(
            'state-conflict-resolution',
            vapiCallData.transcript || 'No transcript available',
            vapiCallData.id,
            {
              conflicts: stateCheck.conflicts,
              severity: stateCheck.severity,
              recommendations: stateCheck.recommendations,
              errorMessage: vapiCallData.errorMessage
            }
          );
        }
        
        // Parse transcript for potential errors in the conversation
        if (vapiCallData.transcript) {
          const conversationIssues = analyzeTranscriptForErrors(vapiCallData.transcript);
          if (conversationIssues.length > 0) {
            console.log('Detected potential conversation issues:', conversationIssues);
          }
        }
        
        // Update the call data state
        setCallData({
          callId: vapiCallData.id,
          transcript: vapiCallData.transcript,
          summary: vapiCallData.summary || vapiCallData.artifact?.summary,
          audioUrl: vapiCallData.audioUrl || vapiCallData.artifact?.recordingUrl || vapiCallData.artifact?.recording?.stereoUrl,
          duration: callDuration,
          status: 'completed'
        });
        
        // Update screening record with results
        if (screeningId && vapiCallData.transcript) {
          try {
            // Parse the summary into structured data
            let screeningSummary: ScreeningSummary | null = null;
            
            if (vapiCallData.summary) {
              screeningSummary = parseScreeningSummary(vapiCallData.summary);
            }
            
            // Create a complete record with both summary and additional data
            await saveScreeningSummary(
              screeningId,
              screeningSummary || defaultSummary
            );
            
            // Update the screening record with complete data
            screeningUpdateSuccess = await updateScreeningStatus(screeningId, 'screening_completed', {
              transcript: vapiCallData.transcript,
              summary: vapiCallData.summary || '',
              audioUrl: vapiCallData.audioUrl || '',
              completedAt: new Date().toISOString()
            });
            
            // Log success
            console.log('Successfully saved screening results');
            
            if (screeningSummary) {
              // Calculate scores based on available data
              const hasMoreStrengthsThanWeaknesses = screeningSummary.roleSpecific?.strengths?.length > 
                screeningSummary.roleSpecific?.areas_of_improvement?.length;
                
              setCallData(prev => ({
                ...prev,
                overallRating: hasMoreStrengthsThanWeaknesses ? 8 : 5,
                recommendation: hasMoreStrengthsThanWeaknesses ? 'Consider for interview' : 'Review qualifications'
              }));
            }
          } catch (error) {
            console.error('Error saving screening results:', error);
            // Even if saving results fails, we still want to mark the screening as completed
            if (!screeningUpdateSuccess && screeningId) {
              await updateScreeningStatus(screeningId, 'screening_completed');
            }
          }
        }
        
        // Call the onDataRetrieved callback with the results
        if (onDataRetrieved) {
          onDataRetrieved({
            callId: vapiCallData.id,
            transcript: vapiCallData.transcript,
            summary: vapiCallData.summary,
            audioUrl: vapiCallData.audioUrl,
            duration: callDuration
          });
        }
        
        // Mark the call as completed normally
        callCompletedRef.current = true;
        
        // Call the onCallEnd callback now that we have all data
        if (onCallEnd) {
          onCallEnd({
            callId: vapiCallData.id,
            transcript: vapiCallData.transcript,
            summary: vapiCallData.summary,
            audioUrl: vapiCallData.audioUrl,
            duration: callDuration
          });
        }
      } else {
        setDataRetrievalProgress('Failed to retrieve call data after multiple attempts');
        setErrorMessage('Failed to retrieve call data');
        
        // Even if data retrieval failed, ensure we complete the screening
        if (screeningId) {
          await updateScreeningStatus(screeningId, 'screening_completed', {
            transcript: 'Call completed - transcript processing failed',
            errorMessage: 'Failed to retrieve call data'
          });
        }
        
        // Mark the call as completed even if data retrieval failed
        callCompletedRef.current = true;
      }
    } catch (error) {
      console.error('Error retrieving call data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error retrieving call data');
      setDataRetrievalProgress('Error during data retrieval');
      
      // Always ensure we complete the screening even if there's an error
      if (screeningId) {
        await updateScreeningStatus(screeningId, 'screening_completed', {
          errorMessage: error instanceof Error ? error.message : 'Error retrieving call data'
        });
      }
      
      // Mark the call as completed even in error cases
      callCompletedRef.current = true;
      
      if (onCallError) {
        onCallError(error instanceof Error ? error : new Error('Error retrieving call data'));
      }
    } finally {
      setIsRetrievingData(false);
      setProcessingCall(false);
    }
  }, [maxRetryAttempts, callDuration, screeningId, onDataRetrieved, onCallEnd, onCallError]);

  // Check if the application has already been screened
  const [hasBeenScreened, setHasBeenScreened] = useState<boolean>(false);
  const [retryAvailable, setRetryAvailable] = useState<boolean>(false);
  const [pastAttempts, setPastAttempts] = useState<number>(0);
  
  // Check if this application has already been screened on mount and handle retry logic
  useEffect(() => {
    const checkScreeningStatus = async () => {
      if (applicationId) {
        try {
          // Clean up any stale calls that might be stuck in "in_progress" state
          await cleanupStaleScreeningCalls(10); // 10 minutes timeout
          
          // Get all screenings for this application
          const screenings = await readScreeningsFromAPI();
          const appScreenings = screenings.filter((s: any) => s.applicationId === applicationId);
          
          // Check if this application has already had a completed screening
          const completedScreenings = appScreenings.filter(s => s.status === 'screening_completed');
          const alreadyScreened = completedScreenings.length > 0;
          setHasBeenScreened(alreadyScreened);
          
          // Count failed attempts (rejected status)
          const failedAttempts = appScreenings.filter(s => s.status === 'rejected').length;
          setPastAttempts(appScreenings.length);
          
          // Retry is only available if:
          // 1. No completed screening exists
          // 2. There are failed attempts
          // 3. Failed attempts < max retries (1)
          const canRetry = !alreadyScreened && failedAttempts > 0 && failedAttempts < 1;
          setRetryAvailable(canRetry);
          
          console.log('Screening status check:', {
            applicationId,
            totalAttempts: appScreenings.length,
            completedScreenings: completedScreenings.length,
            failedAttempts,
            alreadyScreened,
            canRetry
          });
        } catch (error) {
          console.error('Error checking screening status:', error);
          // Set safe defaults on error
          setHasBeenScreened(false);
          setRetryAvailable(false);
          setPastAttempts(0);
        }
      }
    };

    checkScreeningStatus();
  }, [applicationId]);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
        <p className="text-center">Initializing voice screening...</p>
      </div>
    );
  }

  // Render error state
  if (status === 'error' && !callActive) {
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-red-50">
        <p className="text-red-600 font-medium">Error: {errorMessage}</p>
        {errorMessage?.includes('already been screened') ? (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              You have already completed your screening call for this position.
              <br />
              <span className="font-medium">Only one screening call is allowed per application.</span>
            </p>
            <Link href="/candidate" className="mt-2 block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Return to Applications
            </Link>
          </div>
        ) : (
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }
  
  // Show warning if this application has already been screened
  if (hasBeenScreened && !callActive) {
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-yellow-50">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-600 font-medium">This application has already been screened.</p>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Only one screening call is allowed per application. 
          The results of your previous screening will be used for your application.
        </p>
        <Link href="/candidate" className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Return to Applications
        </Link>
      </div>
    );
  }
  
  // Show retry option ONLY if there are failed calls and retries are still available
  if (retryAvailable && !hasBeenScreened && !callActive) {
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-blue-50">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-blue-600 font-medium">Previous screening call failed</p>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Your previous screening call was interrupted or had an error. 
          You can try again now.
        </p>
        <button 
          onClick={startCall}
          className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry Screening Call
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow bg-white space-y-4">
      {/* Status display */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Voice Screening Call</h3>
        <div className="text-sm text-gray-500">
          Status: {startingCall ? 'Starting call...' : callActive ? 'Active Call' : status}
          {callActive && callDuration > 0 && ` (${callDuration}s)`}
        </div>
      </div>
      
      {/* Call controls */}
      <div className="flex gap-4 justify-center">
        {!callActive && !processingCall && (
          <button 
            onClick={startCall} 
            disabled={isLoading || callActive || processingCall || startingCall}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {startingCall && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {startingCall ? 'Starting Call...' : 'Start Screening Call'}
          </button>
        )}
        
        {callActive && (
          <button 
            onClick={stopCall}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            End Call
          </button>
        )}
      </div>
      
      {/* Starting call progress indicator */}
      {startingCall && (
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 text-blue-600">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Initializing call connection...</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Please wait while we establish the connection</p>
        </div>
      )}
      
      {/* UI feedback for active call */}
      {callActive && (
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>{isSpeaking ? 'Speaking' : 'Listening'}</span>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(volumeLevel * 100, 100)}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-600">Call time: {callDuration}s</p>
        </div>
      )}
      
      {/* Data retrieval status */}
      {isRetrievingData && (
        <div className="text-center p-3 bg-blue-50 rounded">
          <p>Processing call data...</p>
          <p className="text-sm text-gray-600">{dataRetrievalProgress}</p>
        </div>
      )}
      
      {/* Display results when available */}
      {callData.transcript && !callActive && !isRetrievingData && (
        <div className="space-y-4 mt-4">
          <h4 className="font-medium">Call Results</h4>
          
          {callData.recommendation && (
            <div className="p-3 bg-blue-50 rounded">
              <span className="font-medium">Recommendation:</span> {callData.recommendation}
            </div>
          )}
          
          {callData.summary && (
            <div className="mb-4">
              <h5 className="font-medium mb-1">Summary:</h5>
              <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                {callData.summary}
              </div>
            </div>
          )}
          
          {/* Link to full transcript */}
          {screeningId && (
            <Link 
              href={`/screening/${screeningId}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Full Transcript
            </Link>
          )}
          
          {/* Audio playback if available */}
          {callData.audioUrl && (
            <div className="mt-4">
              <h5 className="font-medium mb-1">Call Recording:</h5>
              <audio controls className="w-full">
                <source src={callData.audioUrl} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      )}
      
      {/* Debug info */}
      {showDebugInfo && (
        <div className="mt-6 p-3 border bg-gray-50 text-xs rounded">
          <h4 className="font-medium text-sm mb-1">Debug Info:</h4>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify({
              screeningRole,
              screeningId,
              callId: callData.callId,
              duration: callDuration,
              status,
              callAttempts,
              hasError: !!errorMessage,
              hasTranscript: !!callData.transcript,
              hasAudio: !!callData.audioUrl,
              hasSummary: !!callData.summary
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UnifiedVoiceScreeningCall;
