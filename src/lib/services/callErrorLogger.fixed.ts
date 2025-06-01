/**
 * Call Error Logger Service
 * 
 * This service provides enhanced error logging and diagnostics for Vapi call failures,
 * helping to identify the root causes of call failures and provide better debugging information.
 */

import { VapiCallData } from './vapiCallService';

// Add missing duration field to VapiCallData if not already defined
declare module './vapiCallService' {
  interface VapiCallData {
    duration?: number;
  }
}

// Detailed error information structure
export interface CallErrorDetails {
  errorCode: string;
  errorMessage: string;
  errorCategory: 'connection' | 'authentication' | 'payment' | 'transcription' | 'api' | 'timeout' | 'unknown';
  timestamp: string;
  callId?: string;
  callDuration?: number;
  metadata?: Record<string, any>;
  suggestedAction?: string;
  technicalDetails?: string;
}

// Error categories and their corresponding patterns
const errorPatterns = {
  connection: [
    'network error', 'connection', 'timeout', 'socket', 'disconnected',
    'unreachable', 'no response'
  ],
  authentication: [
    'authentication', 'unauthorized', 'api key', 'credentials', 'permission',
    '401', '403', 'forbidden', 'not authorized'
  ],
  payment: [
    'payment', 'billing', 'subscription', 'card details', 'credit card',
    'expired', 'invoice', 'funds', 'balance'
  ],
  transcription: [
    'transcription', 'speech recognition', 'audio quality', 'inaudible',
    'noise', 'could not transcribe', 'processing failed'
  ],
  api: [
    'bad request', '400', '404', 'not found', 'method not allowed',
    'api limit', 'rate limit', 'too many requests', '429'
  ],
  timeout: [
    'timeout', 'timed out', 'took too long', 'deadline exceeded',
    'operation canceled'
  ]
};

/**
 * Categorizes an error message into known error categories
 */
function categorizeError(message: string): CallErrorDetails['errorCategory'] {
  message = message.toLowerCase();
  
  for (const [category, patterns] of Object.entries(errorPatterns)) {
    if (patterns.some(pattern => message.includes(pattern.toLowerCase()))) {
      return category as CallErrorDetails['errorCategory'];
    }
  }
  
  return 'unknown';
}

/**
 * Generates suggested actions based on error category
 */
function getSuggestedAction(category: CallErrorDetails['errorCategory'], message: string): string {
  switch (category) {
    case 'connection':
      return 'Check your internet connection and try again. If the issue persists, verify that the Vapi service is operational.';
    case 'authentication':
      return 'Verify your API keys are correct and have the proper permissions. You may need to regenerate your keys.';
    case 'payment':
      return 'Check your subscription status and payment method in your Vapi account dashboard.';
    case 'transcription':
      return 'The call audio may have quality issues. Try again in a quieter environment with a better microphone.';
    case 'api':
      if (message.includes('rate limit') || message.includes('429')) {
        return 'You have exceeded API rate limits. Please wait before trying again.';
      }
      return 'The API request was invalid. Check your parameters and try again.';
    case 'timeout':
      return 'The operation took too long. Try again when the system is less busy.';
    default:
      return 'Try again later. If the issue persists, contact support with this error information.';
  }
}

/**
 * Creates a detailed error report from an error message and call data
 */
export function createErrorReport(
  errorMessage: string,
  callId?: string,
  callDuration?: number,
  additionalMetadata?: Record<string, any>
): CallErrorDetails {
  const errorCategory = categorizeError(errorMessage);
  const timestamp = new Date().toISOString();
  const errorCode = `VAPI-ERR-${Date.now().toString().slice(-6)}`;
  
  return {
    errorCode,
    errorMessage,
    errorCategory,
    timestamp,
    callId,
    callDuration,
    metadata: additionalMetadata,
    suggestedAction: getSuggestedAction(errorCategory, errorMessage),
    technicalDetails: generateTechnicalDetails(errorMessage, errorCategory)
  };
}

/**
 * Generate technical details for debugging
 */
function generateTechnicalDetails(errorMessage: string, category: CallErrorDetails['errorCategory']): string {
  let details = `Error category: ${category}\n`;
  
  // Add environment information
  if (typeof window !== 'undefined') {
    details += `Browser: ${window.navigator.userAgent}\n`;
    details += `Connection: ${(navigator as any).connection ? 
      (navigator as any).connection.effectiveType : 'unknown'}\n`;
  }
  
  // Add diagnostic information based on error category
  switch (category) {
    case 'connection':
      details += 'Check for network connectivity issues, firewalls, or proxy settings.\n';
      break;
    case 'authentication':
      details += 'Verify API keys are properly set in environment variables and have not expired.\n';
      break;
    case 'api':
      details += 'Review API request parameters and ensure they meet the requirements.\n';
      break;
    case 'transcription':
      details += 'Review audio quality, language settings, and speech clarity.\n';
      break;
  }
  
  return details;
}

/**
 * Logs the detailed error information to console (and could send to monitoring service)
 */
export function logCallError(errorDetails: CallErrorDetails): void {
  console.error('=== VAPI CALL ERROR ===');
  console.error(`Error Code: ${errorDetails.errorCode}`);
  console.error(`Message: ${errorDetails.errorMessage}`);
  console.error(`Category: ${errorDetails.errorCategory}`);
  console.error(`Time: ${errorDetails.timestamp}`);
  
  if (errorDetails.callId) {
    console.error(`Call ID: ${errorDetails.callId}`);
  }
  
  if (errorDetails.callDuration !== undefined) {
    console.error(`Call Duration: ${errorDetails.callDuration}s`);
  }
  
  console.error(`Suggested Action: ${errorDetails.suggestedAction}`);
  console.error('Technical Details:');
  console.error(errorDetails.technicalDetails);
  
  if (errorDetails.metadata) {
    console.error('Additional Metadata:');
    console.error(JSON.stringify(errorDetails.metadata, null, 2));
  }
  
  console.error('=======================');
  
  // Here you could also send the error to a monitoring service
  // like Sentry, LogRocket, etc.
  // if (typeof window !== 'undefined' && window.errorMonitoringService) {
  //   window.errorMonitoringService.captureError({
  //     ...errorDetails,
  //     source: 'vapi-call'
  //   });
  // }
}

/**
 * Handle and log call failure with enhanced diagnostic information
 */
export async function handleCallFailure(
  errorMessage: string,
  callId?: string,
  callDuration?: number,
  additionalMetadata?: Record<string, any>
): Promise<CallErrorDetails> {
  // Create detailed error report
  const errorDetails = createErrorReport(
    errorMessage,
    callId,
    callDuration,
    additionalMetadata
  );
  
  // Log the error with enhanced details
  logCallError(errorDetails);
  
  // If desired, we could also save this error to a database or send to a server
  
  return errorDetails;
}

/**
 * Analyze transcript for potential error clues in the conversation
 */
export function analyzeTranscriptForErrors(transcript: string): string[] {
  const errorIndicators = [
    'cannot hear you',
    "can't hear you",
    'connection issues',
    'poor connection',
    'dropped',
    'cutting out',
    'hello?',
    'are you there',
    'is anyone there',
    'lost connection',
    'hello, hello',
    'can you hear me'
  ];
  
  const foundIndicators = errorIndicators
    .filter(indicator => transcript.toLowerCase().includes(indicator.toLowerCase()));
  
  return foundIndicators;
}

// Enhanced VapiCallData with additional fields for state checking
export interface EnhancedVapiCallData extends VapiCallData {
  errorMessage?: string;
  status?: string;
}

/**
 * Detect and log state conflicts in call data
 * Specifically for calls that have both "errorMessage": "Call failed" and a successful transcript
 */
export function detectStateConflicts(callData: EnhancedVapiCallData): {
  hasConflict: boolean;
  conflictType: string | null;
  resolution: string | null;
  shouldProcess: boolean;
} {
  // Initialize result
  const result = {
    hasConflict: false,
    conflictType: null as string | null,
    resolution: null as string | null,
    shouldProcess: true
  };
  
  // Case 1: Has error message but also has substantial transcript
  if (callData.errorMessage && 
      callData.transcript && 
      callData.transcript.length > 100 &&
      !callData.transcript.includes("Call failed")) {
    
    result.hasConflict = true;
    result.conflictType = 'error_with_transcript';
    result.resolution = 'Process transcript despite error flag';
    
    // Log this specific issue
    console.warn(`[CALL STATE CONFLICT] Call ${callData.id} has contradictory state:`, {
      errorMessage: callData.errorMessage,
      hasTranscript: true,
      transcriptLength: callData.transcript.length,
      status: callData.status
    });
  }
  
  // Case 2: Status is "failed" but has transcript
  else if (callData.status === 'failed' && 
           callData.transcript && 
           callData.transcript.length > 100 &&
           !callData.transcript.includes("Call failed")) {
    
    result.hasConflict = true;
    result.conflictType = 'failed_status_with_transcript';
    result.resolution = 'Override status to screening_completed';
    
    console.warn(`[CALL STATE CONFLICT] Call ${callData.id} marked as failed but has transcript:`, {
      status: callData.status,
      transcriptLength: callData.transcript.length
    });
  }
  
  // Case 3: Status is successful but has error message
  else if ((callData.status === 'screening_completed' || callData.status === 'completed') && 
           callData.errorMessage) {
    
    result.hasConflict = true;
    result.conflictType = 'success_status_with_error';
    result.resolution = 'Clear error message';
    
    console.warn(`[CALL STATE CONFLICT] Call ${callData.id} has successful status but shows error:`, {
      status: callData.status,
      errorMessage: callData.errorMessage
    });
  }
  
  return result;
}

/**
 * Log detailed information about post-processing failures
 * This helps track cases where summary generation fails despite having transcript
 */
export function logPostProcessingFailure(
  callId: string,
  transcript?: string,
  status?: string,
  errorMessage?: string
): void {
  console.error('=== POST-PROCESSING FAILURE ===');
  console.error(`Call ID: ${callId}`);
  console.error(`Status: ${status || 'unknown'}`);
  console.error(`Error Message: ${errorMessage || 'None'}`);
  console.error(`Has Transcript: ${!!transcript}`);
  console.error(`Transcript Length: ${transcript ? transcript.length : 0}`);
  console.error(`Timestamp: ${new Date().toISOString()}`);
  
  if (transcript && transcript.length > 300) {
    // Log a sample of the transcript to help with debugging
    console.error(`Transcript Sample: ${transcript.substring(0, 300)}...`);
  }
  
  console.error('===============================');
  
  // Emit an event for monitoring tools
  if (typeof window !== 'undefined') {
    const postProcessingEvent = new CustomEvent('vapi-post-processing-failure', {
      detail: {
        callId,
        timestamp: new Date().toISOString(),
        hasTranscript: !!transcript,
        transcriptLength: transcript ? transcript.length : 0,
        status,
        errorMessage
      }
    });
    window.dispatchEvent(postProcessingEvent);
  }
}

/**
 * Comprehensive error analysis of a failed call
 */
export async function analyzeFailedCall(
  callId: string,
  errorMessage: string,
  transcript?: string,
  callData?: Partial<VapiCallData>
): Promise<{
  errorDetails: CallErrorDetails;
  transcriptIssues: string[];
  recoveryPossible: boolean;
  recoverySteps?: string[];
}> {
  // Create basic error details
  const errorDetails = createErrorReport(
    errorMessage,
    callId,
    callData?.duration,
    {
      hasTranscript: !!transcript,
      transcriptLength: transcript ? transcript.length : 0,
      hasAudioUrl: !!callData?.audioUrl,
      hasSummary: !!callData?.summary
    }
  );
  
  // Analyze transcript if available
  const transcriptIssues = transcript 
    ? analyzeTranscriptForErrors(transcript) 
    : [];
  
  // Determine if recovery is possible
  const recoveryPossible = errorDetails.errorCategory !== 'payment' && 
    errorDetails.errorCategory !== 'authentication' &&
    !errorMessage.includes('permanently failed');
  
  // Log detailed analysis
  logCallError(errorDetails);
  
  // Generate recovery steps if possible
  const recoverySteps = recoveryPossible ? [
    'Retry the call after a few minutes',
    'Check your internet connection stability',
    'Verify the candidate phone number is correct',
    ...(errorDetails.suggestedAction ? [errorDetails.suggestedAction] : [])
  ] : undefined;
  
  return {
    errorDetails,
    transcriptIssues,
    recoveryPossible,
    recoverySteps
  };
}
