/**
 * Comprehensive utility functions for Vapi call data retrieval and screening analysis
 */

import { VapiCallData } from './vapiCallService';

export interface ScreeningCallResult {
  callId?: string;
  transcript?: string;
  audioUrl?: string;
  summary?: string;
  duration?: number;
  status: 'completed' | 'failed' | 'processing';
  analysis?: {
    experience?: string;
    availability?: string;
    communication?: string;
    concerns?: string[];
    overallAssessment?: string;
  };
  rawData?: any;
}

/**
 * Parse Vapi call data into a screening-specific format
 */
export function parseScreeningCallData(callData: VapiCallData): ScreeningCallResult {
  const result: ScreeningCallResult = {
    callId: callData.id,
    transcript: callData.transcript,
    audioUrl: callData.audioUrl,
    summary: callData.summary || callData.analysis?.summary,
    status: 'completed',
    rawData: callData
  };

  // Try to extract structured analysis from summary
  if (result.summary) {
    result.analysis = extractAnalysisFromSummary(result.summary);
  }

  return result;
}

/**
 * Extract structured analysis from a call summary
 */
function extractAnalysisFromSummary(summary: string): ScreeningCallResult['analysis'] {
  const analysis: ScreeningCallResult['analysis'] = {};

  // Look for experience section
  const experienceMatch = summary.match(/experience[:\s]+(.*?)(?=\n|availability|communication|$)/i);
  if (experienceMatch) {
    analysis.experience = experienceMatch[1].trim();
  }

  // Look for availability section
  const availabilityMatch = summary.match(/availability[:\s]+(.*?)(?=\n|experience|communication|$)/i);
  if (availabilityMatch) {
    analysis.availability = availabilityMatch[1].trim();
  }

  // Look for communication assessment
  const communicationMatch = summary.match(/communication[:\s]+(.*?)(?=\n|concerns|overall|$)/i);
  if (communicationMatch) {
    analysis.communication = communicationMatch[1].trim();
  }

  // Look for concerns
  const concernsMatch = summary.match(/concerns?[:\s]+(.*?)(?=\n|overall|$)/i);
  if (concernsMatch) {
    analysis.concerns = concernsMatch[1].split(/[,;]/).map(c => c.trim()).filter(c => c.length > 0);
  }

  // Look for overall assessment
  const overallMatch = summary.match(/overall[:\s]+(.*?)$/i);
  if (overallMatch) {
    analysis.overallAssessment = overallMatch[1].trim();
  }

  return analysis;
}

/**
 * Get call data with retry logic and fallback methods
 */
export async function getComprehensiveCallData(
  callId: string,
  capturedData?: VapiCallData
): Promise<ScreeningCallResult> {
  try {
    // Method 1: Use captured data if available and complete
    if (capturedData && (capturedData.transcript || capturedData.summary)) {
      console.log('Using captured call data');
      return parseScreeningCallData(capturedData);
    }

    // Method 2: Fetch from Vapi API
    if (callId) {
      console.log('Fetching call data from Vapi API');
      
      const apiKey = process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY;
      if (!apiKey) {
        throw new Error('Vapi private API key not found');
      }

      const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const apiData = await response.json();
        const vapiCallData: VapiCallData = {
          id: apiData.id,
          transcript: apiData.artifact?.transcript,
          audioUrl: apiData.artifact?.recordingUrl || apiData.artifact?.stereoRecordingUrl,
          summary: apiData.analysis?.summary,
          analysis: apiData.analysis,
          artifact: apiData.artifact,
        };
        
        return parseScreeningCallData(vapiCallData);
      }
    }

    // Method 3: Return partial data
    return {
      callId,
      status: 'processing',
      summary: 'Call data is still being processed. Please check back in a few minutes.',
    };

  } catch (error) {
    console.error('Error getting comprehensive call data:', error);
    return {
      callId,
      status: 'failed',
      summary: 'Failed to retrieve call data. Please contact support if this issue persists.',
    };
  }
}

/**
 * Format screening result for display
 */
export function formatScreeningResult(result: ScreeningCallResult): string {
  let formatted = `# Screening Call Summary\n\n`;
  
  if (result.callId) {
    formatted += `**Call ID:** ${result.callId}\n`;
  }
  
  formatted += `**Status:** ${result.status.charAt(0).toUpperCase() + result.status.slice(1)}\n\n`;

  if (result.summary) {
    formatted += `## Summary\n${result.summary}\n\n`;
  }

  if (result.analysis) {
    formatted += `## Detailed Analysis\n\n`;
    
    if (result.analysis.experience) {
      formatted += `**Experience:** ${result.analysis.experience}\n\n`;
    }
    
    if (result.analysis.availability) {
      formatted += `**Availability:** ${result.analysis.availability}\n\n`;
    }
    
    if (result.analysis.communication) {
      formatted += `**Communication:** ${result.analysis.communication}\n\n`;
    }
    
    if (result.analysis.concerns && result.analysis.concerns.length > 0) {
      formatted += `**Concerns:**\n${result.analysis.concerns.map(c => `- ${c}`).join('\n')}\n\n`;
    }
    
    if (result.analysis.overallAssessment) {
      formatted += `**Overall Assessment:** ${result.analysis.overallAssessment}\n\n`;
    }
  }

  if (result.audioUrl) {
    formatted += `## Resources\n- [Call Recording](${result.audioUrl})\n\n`;
  }

  return formatted;
}
