/**
 * Enhanced Vapi call service for getting screening summary and call audio
 */

// Enhanced event handling to capture call data
export interface VapiCallData {
  id?: string;
  transcript?: string;
  audioUrl?: string;
  summary?: string;
  errorMessage?: string;
  duration?: number;
  status?: 'pending' | 'in_progress' | 'ended' | 'failed' | 'completed';
  analysis?: {
    summary?: string;
    structuredData?: any;
    sentiment?: string;
    keyPoints?: string[];
    rating?: number;
  };
  artifact?: {
    transcript?: string;
    recordingUrl?: string;
    stereoRecordingUrl?: string;
    recording?: {
      stereoUrl?: string;
    };
    summary?: string;
  };
}

/**
 * Enhanced Web SDK event handlers for capturing call data
 */
export function setupEnhancedVapiEventHandlers(vapi: any) {
  let callData: VapiCallData = {};
  
  // Store call ID when call starts
  vapi.on('call-start', (callInfo: any) => {
    console.log('Call started with info:', callInfo);
    if (callInfo?.id) {
      callData.id = callInfo.id;
    }
  });
  
  // Capture messages during the call
  vapi.on('message', (message: any) => {
    console.log('Vapi message received:', message);
    
    switch (message?.type) {
      case 'transcript':
        // Accumulate transcript pieces
        if (message.transcript) {
          callData.transcript = (callData.transcript || '') + ' ' + message.transcript;
        }
        break;
        
      case 'end-of-call-report':
        // This contains the final call summary and data
        console.log('End of call report:', message);
        if (message.analysis) {
          callData.analysis = message.analysis;
          callData.summary = message.analysis.summary;
        }
        if (message.artifact) {
          callData.artifact = message.artifact;
          callData.audioUrl = message.artifact.recordingUrl || message.artifact.recording?.stereoUrl;
        }
        break;
        
      case 'call-summary':
        // Alternative summary format
        if (message.summary) {
          callData.summary = message.summary;
        }
        break;
    }
  });
  
  // Return captured data when call ends
  vapi.on('call-end', () => {
    return callData;
  });
  
  return callData;
}

/**
 * REST API method to get call data after the call
 */
export async function getCallData(callId: string): Promise<VapiCallData | null> {
  try {
    // Check for test mode - if the call ID starts with 'mock-', use our mock API
    if (callId.startsWith('mock-')) {
      console.log('Using mock API for testing');
      const response = await fetch(`/api/mock-vapi?callId=${callId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get mock call data: ${response.statusText}`);
      }
      
      const callData = await response.json();
      
      return {
        id: callData.id,
        transcript: callData.transcript || callData.artifact?.transcript,
        audioUrl: callData.artifact?.recordingUrl || callData.artifact?.stereoRecordingUrl,
        summary: callData.summary || callData.analysis?.summary,
        analysis: callData.analysis,
        artifact: callData.artifact,
      };
    }
    
    // Otherwise, use the real Vapi API
    const apiKey = process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY; // Use private key for API calls
    
    if (!apiKey) {
      throw new Error('Vapi private API key not found');
    }
    
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get call data: ${response.statusText}`);
    }
    
    const callData = await response.json();
    
    return {
      id: callData.id,
      transcript: callData.artifact?.transcript,
      audioUrl: callData.artifact?.recordingUrl || callData.artifact?.stereoRecordingUrl,
      summary: callData.analysis?.summary,
      analysis: callData.analysis,
      artifact: callData.artifact,
    };
  } catch (error) {
    console.error('Error fetching call data:', error);
    return null;
  }
}

/**
 * Helper function to wait for call data to be processed
 * Call data might not be immediately available after call ends
 */
export async function waitForCallData(callId: string, maxAttempts = 10, delay = 2000): Promise<VapiCallData | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Attempting to fetch call data (${attempt}/${maxAttempts})`);
    
    const callData = await getCallData(callId);
    
    // Check if we have meaningful data
    if (callData && (callData.transcript || callData.audioUrl || callData.summary)) {
      return callData;
    }
    
    // Wait before next attempt
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.warn(`Failed to get call data after ${maxAttempts} attempts`);
  return null;
}
