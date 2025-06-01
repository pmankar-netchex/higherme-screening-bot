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

/**
 * Detect state conflicts in call data that might indicate processing issues
 */
export function detectStateConflicts(callData: Partial<VapiCallData>): {
  hasConflicts: boolean;
  conflicts: string[];
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
} {
  const conflicts: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';
  
  // Check for missing essential data
  if (!callData.transcript && callData.duration && callData.duration > 10) {
    conflicts.push('Call duration suggests conversation occurred, but no transcript available');
    severity = 'high';
  }
  
  // Check for unusually short calls with transcripts
  if (callData.transcript && callData.duration && callData.duration < 5 && callData.transcript.length > 50) {
    conflicts.push('Short call duration but substantial transcript content - timing mismatch');
    severity = 'medium';
  }
  
  // Check for empty summary with transcript
  if (callData.transcript && callData.transcript.length > 100 && !callData.summary) {
    conflicts.push('Substantial transcript available but no summary generated');
    severity = 'medium';
  }
  
  // Check for call with ID but no transcript or summary (suggests incomplete processing)
  if (callData.id && !callData.transcript && !callData.summary) {
    conflicts.push('Call has ID but no content was captured - incomplete processing');
    severity = 'high';
  }
  
  // Check for audio URL without transcript
  if (callData.audioUrl && !callData.transcript) {
    conflicts.push('Audio recording available but transcription failed or missing');
    severity = 'medium';
  }
  
  // Generate recommendations based on conflicts
  const recommendations: string[] = [];
  
  if (conflicts.length > 0) {
    recommendations.push('Retry call data retrieval from Vapi API');
    
    if (conflicts.some(c => c.includes('transcript'))) {
      recommendations.push('Check transcription service status and audio quality');
    }
    
    if (conflicts.some(c => c.includes('summary'))) {
      recommendations.push('Manually generate summary from available transcript');
    }
    
    if (conflicts.some(c => c.includes('timing'))) {
      recommendations.push('Verify call timing data accuracy');
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    severity,
    recommendations
  };
}

/**
 * Log post-processing failures with detailed context
 */
export function logPostProcessingFailure(
  stage: string,
  error: Error | string,
  callId?: string,
  context?: Record<string, any>
): CallErrorDetails {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorDetails = createErrorReport(
    `Post-processing failure at stage "${stage}": ${errorMessage}`,
    callId,
    undefined,
    {
      ...context,
      stage,
      errorType: 'post-processing',
      stackTrace: typeof error === 'object' && error.stack ? error.stack : undefined
    }
  );
  
  // Enhanced logging for post-processing failures
  console.error('=== POST-PROCESSING FAILURE ===');
  console.error(`Stage: ${stage}`);
  console.error(`Call ID: ${callId || 'unknown'}`);
  console.error(`Error: ${errorMessage}`);
  
  if (context) {
    console.error('Context:');
    console.error(JSON.stringify(context, null, 2));
  }
  
  if (typeof error === 'object' && error.stack) {
    console.error('Stack Trace:');
    console.error(error.stack);
  }
  
  console.error('===============================');
  
  return errorDetails;
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
