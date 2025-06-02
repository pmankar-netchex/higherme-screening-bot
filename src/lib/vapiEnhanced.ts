/**
 * Enhanced Vapi Screening SDK
 * 
 * This file exports all the enhanced Vapi voice screening functionality
 * for easy import in other parts of the application.
 */

// Export enhanced service functions
export { 
  retrieveCallDataWithRetry,
  analyzeCallDataComprehensively,
  analyzeScreeningCall,
  generateEnhancedAnalysis,
  getCallAudioLinks,
  getEnhancedScreeningSummary,
  trackCallAnalytics,
  type EnhancedScreeningAnalysis,
  type VapiCallAudioLinks,
  type EnhancedScreeningSummary
} from './services/enhancedScreeningService';

// Export unified Vapi configuration functions (client/server compatible)
export {
  createScreeningAssistantOptions,
  generateScreeningSystemPrompt,
  getRoleSpecificQuestions,
  getMandatoryQuestions,
  getConversationTone,
  getCustomSystemPrompt,
  getCustomAnalysisPrompt,
  getVapiSettings,
  DEFAULT_VAPI_CONFIG,
  MANDATORY_QUESTIONS,
  type VapiConfig
} from './integrations/vapi/vapiConfig';

// Export call data services
export {
  getCallData,
  waitForCallData,
  setupEnhancedVapiEventHandlers,
  type VapiCallData
} from './services/vapiCallService';

// Export screening analysis 
export {
  parseScreeningCallData,
  getComprehensiveCallData,
  formatScreeningResult,
  type ScreeningCallResult
} from './services/screeningCallAnalysis';

// Export voice screening component
export { 
  default as UnifiedVoiceScreeningCall
} from '../components/features/screening';

// Export error logging utilities
export {
  handleCallFailure,
  analyzeFailedCall,
  detectStateConflicts,
  analyzeTranscriptForErrors,
  logPostProcessingFailure,
  type CallErrorDetails
} from './services/callErrorLogger';

/**
 * Initialize Vapi voice screening functionality
 * 
 * This function ensures all the necessary environment variables are set
 * and returns initialization status.
 */
export function initVapiScreening(): { success: boolean; message: string } {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
  const privateKey = process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY;
  
  // If we're in test mode (URL includes 'test-enhanced'), allow using mock data without API keys
  const isTestMode = typeof window !== 'undefined' && 
    (window.location.pathname.includes('test-enhanced') || 
     window.location.search.includes('mock=true'));
  
  if (isTestMode) {
    console.log('Running in test mode with mock data');
    return { 
      success: true, 
      message: 'Vapi SDK initialized in test mode with mock data. Use IDs like "mock-call-123" for testing.' 
    };
  }
  
  if (!publicKey) {
    return { 
      success: false, 
      message: 'Public API key missing. Please set NEXT_PUBLIC_VAPI_API_KEY in your environment.' 
    };
  }
  
  if (!privateKey) {
    return { 
      success: false, 
      message: 'Private API key missing. Please set NEXT_PUBLIC_VAPI_PRIVATE_KEY in your environment.' 
    };
  }
  
  return { 
    success: true, 
    message: 'Vapi voice screening SDK initialized successfully.' 
  };
}
