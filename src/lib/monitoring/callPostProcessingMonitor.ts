/**
 * Call Post-Processing Monitor Utility
 * 
 * This utility helps monitor and troubleshoot issues with call post-processing,
 * specifically focusing on calls that have transcripts but fail to generate summaries or analyses.
 */

import { VapiCallData } from '../services/vapiCallService';
import { EnhancedVapiCallData, logPostProcessingFailure } from '../services/callErrorLogger';

// Status types for tracking calls
type CallProcessingStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'partial_success' 
  | 'conflict_resolved';

// Monitor record for a single call
interface CallMonitorRecord {
  callId: string;
  initialTimestamp: string;
  lastUpdated: string;
  status: CallProcessingStatus;
  hasTranscript: boolean;
  hasSummary: boolean;
  hasAnalysis: boolean;
  hasAudio: boolean;
  conflictDetected?: boolean;
  conflictType?: string;
  conflictResolution?: string;
  errorMessage?: string;
  failureReason?: string;
  processingAttempts: number;
}

// In-memory storage for monitoring call processing
// In a production app, this would likely be stored in a database
const monitoredCalls: Map<string, CallMonitorRecord> = new Map();

/**
 * Register a call for monitoring
 */
export function registerCall(callId: string): void {
  if (!monitoredCalls.has(callId)) {
    const timestamp = new Date().toISOString();
    monitoredCalls.set(callId, {
      callId,
      initialTimestamp: timestamp,
      lastUpdated: timestamp,
      status: 'pending',
      hasTranscript: false,
      hasSummary: false,
      hasAnalysis: false,
      hasAudio: false,
      processingAttempts: 0
    });
    
    console.log(`[MONITOR] Registered call ${callId} for monitoring`);
  }
}

/**
 * Update the status of a monitored call
 */
export function updateCallStatus(
  callId: string, 
  callData: Partial<EnhancedVapiCallData>,
  status?: CallProcessingStatus,
  additionalInfo: Record<string, any> = {}
): void {
  // Get existing record or create new one
  const record = monitoredCalls.get(callId) || {
    callId,
    initialTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: 'pending',
    hasTranscript: false,
    hasSummary: false, 
    hasAnalysis: false,
    hasAudio: false,
    processingAttempts: 0
  };
  
  // Update basic properties
  record.lastUpdated = new Date().toISOString();
  record.hasTranscript = !!callData.transcript;
  record.hasSummary = !!callData.summary;
  record.hasAnalysis = !!callData.analysis;
  record.hasAudio = !!callData.audioUrl;
  record.processingAttempts++;
  
  // Update status if provided
  if (status) {
    record.status = status;
  } else {
    // Auto-determine status
    if (callData.errorMessage) {
      record.status = record.hasTranscript ? 'partial_success' : 'failed';
      record.errorMessage = callData.errorMessage;
    } else if (record.hasTranscript && record.hasSummary) {
      record.status = 'completed';
    } else if (record.hasTranscript) {
      record.status = 'partial_success';
    } else {
      record.status = 'processing';
    }
  }
  
  // Update additional info
  Object.assign(record, additionalInfo);
  
  // Store updated record
  monitoredCalls.set(callId, record);
  
  // Log if we detect the specific issue we're troubleshooting
  if (record.hasTranscript && !record.hasSummary && callData.errorMessage) {
    console.warn(`[MONITOR] Detected call ${callId} with transcript but error message and no summary`);
    
    logPostProcessingFailure(
      callId,
      callData.transcript,
      callData.status,
      callData.errorMessage
    );
  }
  
  console.log(`[MONITOR] Updated call ${callId} status to ${record.status}`);
}

/**
 * Get the current monitoring status of all calls
 */
export function getMonitoredCalls(): CallMonitorRecord[] {
  return Array.from(monitoredCalls.values());
}

/**
 * Get monitoring status for a specific call
 */
export function getCallMonitorStatus(callId: string): CallMonitorRecord | null {
  return monitoredCalls.get(callId) || null;
}

/**
 * Register a conflict resolution for a call
 */
export function registerConflictResolution(
  callId: string,
  conflictType: string,
  resolution: string
): void {
  const record = monitoredCalls.get(callId);
  
  if (record) {
    record.conflictDetected = true;
    record.conflictType = conflictType;
    record.conflictResolution = resolution;
    record.status = 'conflict_resolved';
    record.lastUpdated = new Date().toISOString();
    
    monitoredCalls.set(callId, record);
    console.log(`[MONITOR] Registered conflict resolution for call ${callId}: ${conflictType} -> ${resolution}`);
  }
}

/**
 * Register a failed post-processing attempt
 */
export function registerPostProcessingFailure(
  callId: string,
  reason: string
): void {
  const record = monitoredCalls.get(callId);
  
  if (record) {
    record.failureReason = reason;
    record.lastUpdated = new Date().toISOString();
    
    monitoredCalls.set(callId, record);
    console.log(`[MONITOR] Registered post-processing failure for call ${callId}: ${reason}`);
  }
}

/**
 * Clear monitored calls history
 */
export function clearMonitoredCalls(): void {
  monitoredCalls.clear();
  console.log('[MONITOR] Cleared monitored calls history');
}
