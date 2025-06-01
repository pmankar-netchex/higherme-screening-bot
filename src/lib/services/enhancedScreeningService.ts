/**
 * Enhanced Screening Service
 * 
 * Provides robust call data retrieval and analysis functions with retry logic
 * and fallback mechanisms for higher reliability in production environments.
 */

import { getCallData, waitForCallData, VapiCallData } from './vapiCallService';
import { parseScreeningCallData, getComprehensiveCallData, ScreeningCallResult } from './screeningCallAnalysis';

// Enhanced analysis result with scoring and insights
export interface EnhancedScreeningAnalysis {
  overallRating: number;
  recommendation: string;
  communicationScore: number;
  technicalScore: number;
  experienceScore: number;
  keyStrengths: string[];
  areasForImprovement: string[];
  detailedAssessment?: string;
}

// Call audio links with metadata
export interface VapiCallAudioLinks {
  callId: string;
  stereoUrl?: string;
  monoUrl?: string;
  candidateAudioUrl?: string;
  interviewerAudioUrl?: string;
  downloadLinks: {
    stereo?: string;
    mono?: string;
    candidate?: string;
    interviewer?: string;
  };
  transcriptDownloadUrl?: string;
  status: 'complete' | 'processing' | 'failed';
  error?: string;
}

// Enhanced screening summary result
export interface EnhancedScreeningSummary {
  callId: string;
  summary: string;
  analysis: EnhancedScreeningAnalysis;
  candidateInfo?: {
    name?: string;
    jobTitle?: string;
    skills?: string[];
    yearsExperience?: number;
  };
  jobFitScore?: number;  
  recommendToHire?: boolean;
  screeningComplete: boolean;
  audioLinks?: VapiCallAudioLinks;
  retrievalTimestamp: string;
  processedBy: 'enhanced-vapi-service';
}

/**
 * Enhanced call data retrieval with multi-layer retry logic
 * and intelligent fallbacks
 */
export async function retrieveCallDataWithRetry(
  callId: string,
  maxAttempts: number = 5,
  delayMs: number = 2000
): Promise<VapiCallData | null> {
  console.log(`Starting enhanced call data retrieval for call ID: ${callId}`);
  
  // Strategy 1: Direct API call with retry logic
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxAttempts}: Direct API call`);
      
      const callData = await getCallData(callId);
      
      if (callData && callData.transcript) {
        console.log('Successfully retrieved call data via direct API call');
        return callData;
      }
      
      // Exponential backoff
      if (attempt < maxAttempts) {
        const waitTime = delayMs * Math.pow(1.5, attempt - 1);
        console.log(`Waiting ${waitTime}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        console.log('All direct API attempts failed, moving to fallback...');
      }
    }
  }
  
  // Strategy 2: Wait with extended timeout
  console.log('Attempting extended wait fallback...');
  try {
    const waitTimeoutMs = 180000; // 3 minutes
    console.log(`Waiting up to ${waitTimeoutMs/1000} seconds for processing...`);
    
    const delayedData = await waitForCallData(callId, 10, waitTimeoutMs / 10);
    
    if (delayedData && (delayedData.transcript || delayedData.summary)) {
      console.log('Successfully retrieved call data via extended wait');
      return delayedData;
    }
  } catch (error) {
    console.error('Extended wait failed:', error);
  }
  
  // Strategy 3: Comprehensive data attempt
  console.log('Attempting comprehensive data retrieval...');
  try {
    const comprehensiveResult = await getComprehensiveCallData(callId);
    
    if (comprehensiveResult && comprehensiveResult.status !== 'failed') {
      console.log('Successfully retrieved call data via comprehensive method');
      return {
        id: comprehensiveResult.callId,
        transcript: comprehensiveResult.transcript,
        audioUrl: comprehensiveResult.audioUrl,
        summary: comprehensiveResult.summary,
      };
    }
  } catch (error) {
    console.error('Comprehensive retrieval failed:', error);
  }
  
  console.log('All retrieval strategies exhausted, returning null');
  return null;
}

/**
 * Analyze call data to extract structured information and insights
 */
export function analyzeCallDataComprehensively(
  callData: VapiCallData
): ScreeningCallResult {
  // Parse the call data using the existing function
  const parsedData = parseScreeningCallData(callData);
  
  // Return the parsed data with enhanced status information
  return {
    ...parsedData,
    status: 'completed',
  };
}

/**
 * Enhanced screening call analysis that combines data retrieval and analysis
 */
export async function analyzeScreeningCall(
  callId: string,
  maxAttempts: number = 5
): Promise<ScreeningCallResult> {
  try {
    // Step 1: Retrieve call data with robust retry logic
    const callData = await retrieveCallDataWithRetry(callId, maxAttempts);
    
    // Step 2: Analyze retrieved data
    if (callData) {
      return analyzeCallDataComprehensively(callData);
    }
    
    // If we couldn't get call data after all retries
    return {
      callId,
      status: 'failed',
      summary: 'Failed to retrieve call data after multiple attempts.'
    };
  } catch (error) {
    console.error('Error in analyzeScreeningCall:', error);
    return {
      callId,
      status: 'failed',
      summary: `Error analyzing call: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate enhanced analysis with scoring and insights from call data
 * This uses a heuristic approach to score different aspects of the call
 */
export function generateEnhancedAnalysis(callData: VapiCallData): EnhancedScreeningAnalysis | null {
  if (!callData || !callData.transcript) {
    console.warn('Cannot generate enhanced analysis: No transcript available');
    return null;
  }

  // Default analysis
  const analysis: EnhancedScreeningAnalysis = {
    overallRating: 7,
    recommendation: 'Consider proceeding to next round',
    communicationScore: 7,
    technicalScore: 6,
    experienceScore: 8,
    keyStrengths: ['Relevant experience', 'Good communication'],
    areasForImprovement: ['Deeper technical knowledge']
  };

  try {
    // Extract insights from transcript and summary
    const transcript = callData.transcript?.toLowerCase() || '';
    const summary = callData.summary?.toLowerCase() || '';

    // Analyze communication skills
    if (transcript.length > 2000 || transcript.split(' ').length > 300) {
      // Long, detailed responses suggest good communication
      analysis.communicationScore += 1;
    }
    
    if (transcript.includes('thank you') || transcript.includes('appreciate')) {
      // Politeness indicators
      analysis.communicationScore += 0.5;
    }

    // Analyze experience
    const experienceTerms = ['years of experience', 'worked on', 'project', 'led', 'managed', 'developed', 'implemented'];
    const experienceScore = experienceTerms.reduce((score, term) => {
      return score + (transcript.includes(term) ? 1 : 0);
    }, 0);
    
    analysis.experienceScore = Math.min(10, Math.max(1, 5 + experienceScore / 2));

    // Analyze technical skills
    const techTerms = ['framework', 'programming', 'code', 'algorithm', 'database', 'architecture', 'system', 'design'];
    const techScore = techTerms.reduce((score, term) => {
      return score + (transcript.includes(term) ? 1 : 0);
    }, 0);
    
    analysis.technicalScore = Math.min(10, Math.max(1, 5 + techScore / 2));

    // Calculate overall score as weighted average
    analysis.overallRating = Math.round((
      analysis.communicationScore * 0.3 + 
      analysis.technicalScore * 0.3 + 
      analysis.experienceScore * 0.4
    ) * 10) / 10;

    // Generate recommendation based on overall score
    if (analysis.overallRating >= 8) {
      analysis.recommendation = 'Strongly recommend proceeding to next round';
    } else if (analysis.overallRating >= 6) {
      analysis.recommendation = 'Consider proceeding to next round';
    } else if (analysis.overallRating >= 4) {
      analysis.recommendation = 'Consider for junior position or with reservations';
    } else {
      analysis.recommendation = 'Not recommended for this position';
    }

    // Extract strengths and areas for improvement
    analysis.keyStrengths = extractInsightsFromText(transcript, summary, 'strengths');
    analysis.areasForImprovement = extractInsightsFromText(transcript, summary, 'weaknesses');

    return analysis;
  } catch (error) {
    console.error('Error generating enhanced analysis:', error);
    return analysis; // Return default analysis on error
  }
}

// Helper function to extract insights from text
function extractInsightsFromText(
  transcript: string,
  summary: string,
  type: 'strengths' | 'weaknesses'
): string[] {
  const text = `${transcript} ${summary}`.toLowerCase();
  const insights: string[] = [];
  
  // Common patterns for strengths and weaknesses
  const strengthPatterns = [
    'strong', 'excellent', 'impressive', 'good', 'great',
    'proficient', 'skilled', 'experienced', 'expert'
  ];
  
  const weaknessPatterns = [
    'improve', 'lacks', 'limited', 'weakness', 'challenge',
    'concern', 'issue', 'missing', 'needs development'
  ];
  
  const patterns = type === 'strengths' ? strengthPatterns : weaknessPatterns;
  
  // Extract sentences containing patterns
  const sentences = text.split(/[.!?]+/);
  
  for (const pattern of patterns) {
    for (const sentence of sentences) {
      if (sentence.includes(pattern)) {
        // Clean up the sentence
        const insight = sentence
          .trim()
          .replace(/^[,;\s]+/, '')
          .replace(/[,;\s]+$/, '');
        
        // Only add non-empty, unique insights of reasonable length
        if (insight && insight.length > 10 && insight.length < 100 && !insights.includes(insight)) {
          insights.push(insight);
        }
        
        // Limit to 5 insights
        if (insights.length >= 5) break;
      }
    }
    if (insights.length >= 5) break;
  }
  
  // If we couldn't find enough insights, add some generic ones
  if (insights.length === 0) {
    if (type === 'strengths') {
      insights.push('Relevant industry experience');
      insights.push('Communicates clearly');
    } else {
      insights.push('Could provide more specific examples');
      insights.push('Would benefit from more technical depth');
    }
  }
  
  return insights;
}

/**
 * Retrieves call audio links with detailed access options
 * This function provides various formats of the call audio with proper URLs
 */
export async function getCallAudioLinks(callId: string): Promise<VapiCallAudioLinks | null> {
  try {
    // First get all call data
    const callData = await retrieveCallDataWithRetry(callId, 3);
    
    if (!callData) {
      return {
        callId,
        status: 'failed',
        error: 'Failed to retrieve call data',
        downloadLinks: {}
      };
    }

    // Extract audio URLs
    const stereoUrl = callData.artifact?.stereoRecordingUrl || callData.artifact?.recording?.stereoUrl;
    const monoUrl = callData.artifact?.recordingUrl || callData.audioUrl;

    // Check if we have at least one audio URL
    if (!stereoUrl && !monoUrl) {
      return {
        callId,
        status: 'processing',
        error: 'Audio recording not yet available',
        downloadLinks: {}
      };
    }

    // Generate download links by appending download parameter
    const downloadLinks: {
      stereo?: string;
      mono?: string;
      candidate?: string;
      interviewer?: string;
    } = {};

    if (stereoUrl) {
      downloadLinks.stereo = appendDownloadParam(stereoUrl, 'call_recording_stereo.mp3');
    }

    if (monoUrl) {
      downloadLinks.mono = appendDownloadParam(monoUrl, 'call_recording.mp3');
    }

    // Create transcript download link if available
    let transcriptDownloadUrl: string | undefined;
    if (callData.transcript) {
      // This is a placeholder - in a real implementation, you would generate
      // a downloadable transcript file and provide its URL
      transcriptDownloadUrl = `/api/transcript/download?callId=${callId}`;
    }

    return {
      callId,
      stereoUrl,
      monoUrl,
      downloadLinks,
      transcriptDownloadUrl,
      status: 'complete'
    };
  } catch (error) {
    console.error('Error retrieving call audio links:', error);
    return {
      callId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error retrieving audio links',
      downloadLinks: {}
    };
  }
}

/**
 * Helper function to append download parameter to URL
 */
function appendDownloadParam(url: string, filename: string): string {
  // Check if URL is valid
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('download', filename);
    return urlObj.toString();
  } catch (error) {
    console.error('Error appending download parameter:', error);
    return url;
  }
}

/**
 * Generates a comprehensive screening summary with detailed analysis and audio links
 */
export async function getEnhancedScreeningSummary(callId: string): Promise<EnhancedScreeningSummary | null> {
  try {
    // Step 1: Get call data with full retry logic
    const callData = await retrieveCallDataWithRetry(callId, 5);
    
    if (!callData) {
      return null;
    }

    // Step 2: Generate enhanced analysis
    const analysis = generateEnhancedAnalysis(callData);
    
    if (!analysis) {
      return null;
    }

    // Step 3: Get audio links
    const audioLinks = await getCallAudioLinks(callId);

    // Step 4: Extract candidate info from call data
    const candidateInfo = extractCandidateInfo(callData);

    // Step 5: Calculate job fit score (simplified algorithm)
    const jobFitScore = calculateJobFitScore(analysis);

    // Step 6: Generate recommendation
    const recommendToHire = analysis.overallRating >= 7.5;

    return {
      callId,
      summary: callData.summary || 'No summary available',
      analysis,
      candidateInfo,
      jobFitScore,
      recommendToHire,
      screeningComplete: !!callData.transcript && !!callData.summary,
      audioLinks: audioLinks || undefined,
      retrievalTimestamp: new Date().toISOString(),
      processedBy: 'enhanced-vapi-service'
    };
  } catch (error) {
    console.error('Error generating enhanced screening summary:', error);
    return null;
  }
}

/**
 * Extract candidate information from call data
 */
function extractCandidateInfo(callData: VapiCallData): EnhancedScreeningSummary['candidateInfo'] {
  if (!callData.transcript && !callData.summary) {
    return undefined;
  }

  const transcript = (callData.transcript || '').toLowerCase();
  const summary = (callData.summary || '').toLowerCase();
  const text = `${transcript} ${summary}`;

  // Extract candidate name (simple heuristic)
  let name: string | undefined;
  const nameMatch = text.match(/name is ([a-zA-Z]+ [a-zA-Z]+)/i);
  if (nameMatch) {
    name = nameMatch[1];
  }

  // Extract job title
  let jobTitle: string | undefined;
  const titleMatch = text.match(/(?:as a|worked as|title|position|role as) ([a-zA-Z ]+ (?:developer|engineer|designer|manager|director|architect))/i);
  if (titleMatch) {
    jobTitle = titleMatch[1];
  }

  // Extract skills
  const skillsMap: { [key: string]: boolean } = {};
  const skillKeywords = ['javascript', 'typescript', 'react', 'node', 'python', 'java', 'c#', '.net', 'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'devops', 'database', 'sql', 'nosql', 'mongodb', 'design', 'ui', 'ux', 'frontend', 'backend', 'fullstack'];
  
  skillKeywords.forEach(skill => {
    if (text.includes(skill)) {
      skillsMap[skill] = true;
    }
  });

  const skills = Object.keys(skillsMap);

  // Extract years of experience
  let yearsExperience: number | undefined;
  const expMatch = text.match(/(\d+)(?:\+)? years? of experience/i);
  if (expMatch) {
    yearsExperience = parseInt(expMatch[1], 10);
  }

  return {
    name,
    jobTitle,
    skills: skills.length > 0 ? skills : undefined,
    yearsExperience
  };
}

/**
 * Calculate job fit score based on analysis
 */
function calculateJobFitScore(analysis: EnhancedScreeningAnalysis): number {
  // Simple weighted algorithm
  return Math.round((
    analysis.communicationScore * 0.25 +
    analysis.technicalScore * 0.4 +
    analysis.experienceScore * 0.35
  ) * 10) / 10;
}

/**
 * Track call analytics data for future improvement
 */
export async function trackCallAnalytics(callId: string, callData: VapiCallData | null, analysisResult: any): Promise<boolean> {
  try {
    // In a production environment, you would send this data to your analytics service
    // For now, we'll just log it
    console.log('Call analytics:', {
      callId,
      timestamp: new Date().toISOString(),
      hasTranscript: !!callData?.transcript,
      hasSummary: !!callData?.summary,
      hasAudio: !!callData?.audioUrl,
      analysisGenerated: !!analysisResult,
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking call analytics:', error);
    return false;
  }
}
