/**
 * Client-side Screening Service
 * 
 * This service provides browser-compatible functions for managing screening data
 * by making API calls instead of direct file system access.
 */

import { ScreeningCall, ApplicationStatus } from '../types';

/**
 * Read screenings from API endpoint (browser-compatible)
 */
export async function readScreeningsFromAPI(): Promise<ScreeningCall[]> {
  try {
    const response = await fetch('/api/screenings');
    if (!response.ok) {
      throw new Error(`Failed to fetch screenings: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error reading screenings from API:', error);
    return [];
  }
}

/**
 * Write screenings to API endpoint (browser-compatible)
 */
export async function writeScreeningsToAPI(screenings: ScreeningCall[]): Promise<boolean> {
  try {
    const response = await fetch('/api/screenings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(screenings),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save screenings: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error writing screenings to API:', error);
    return false;
  }
}

/**
 * Browser-compatible version of hasActiveScreeningCall
 */
export async function hasActiveScreeningCall(applicationId: string): Promise<boolean> {
  const screenings = await readScreeningsFromAPI();
  
  // Find any screenings for this application that are in progress or scheduled
  const activeScreenings = screenings.filter(
    s => s.applicationId === applicationId && 
    (s.status === 'screening_in_progress' || s.status === 'screening_scheduled')
  );
  
  return activeScreenings.length > 0;
}

/**
 * Browser-compatible version of hasReachedScreeningCallLimit
 */
export async function hasReachedScreeningCallLimit(
  applicationId: string, 
  maxCallsPerApplication: number = 1
): Promise<boolean> {
  const screenings = await readScreeningsFromAPI();
  
  // Only count successful or completed screenings for this application
  const completedCallCount = screenings.filter(
    s => s.applicationId === applicationId && 
    // Only completed calls count toward the limit
    s.status === 'screening_completed'
  ).length;
  
  return completedCallCount >= maxCallsPerApplication;
}

/**
 * Browser-compatible version of isRetryAllowed
 */
export async function isRetryAllowed(
  applicationId: string, 
  maxRetries: number = 1
): Promise<boolean> {
  const screenings = await readScreeningsFromAPI();
  const appScreenings = screenings.filter(s => s.applicationId === applicationId);
  
  // No screenings yet
  if (appScreenings.length === 0) return true;
  
  // If there's already a completed screening, no retry allowed
  if (appScreenings.some(s => s.status === 'screening_completed')) {
    return false;
  }
  
  // Count failed/rejected attempts
  const failedAttempts = appScreenings.filter(
    s => s.status === 'rejected'
  ).length;
  
  return failedAttempts < maxRetries;
}

/**
 * Browser-compatible version of updateScreeningStatus
 */
export async function updateScreeningStatus(
  id: string,
  status: ApplicationStatus,
  additionalData: Record<string, any> = {}
): Promise<boolean> {
  try {
    const response = await fetch(`/api/screenings?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, ...additionalData }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update screening: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating screening status:', error);
    return false;
  }
}

/**
 * Browser-compatible version of createScreening
 */
export async function createScreening(
  applicationId: string,
  candidateId: string,
  jobId: string,
  additionalData: Record<string, any> = {}
): Promise<ScreeningCall | null> {
  try {
    const response = await fetch('/api/screening', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId,
        candidateId,
        jobId,
        ...additionalData
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create screening: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating screening:', error);
    return null;
  }
}

/**
 * Browser-compatible version of cleanupIncompleteScreenings
 */
export async function cleanupIncompleteScreenings(
  applicationId: string,
  olderThanMinutes: number = 30
): Promise<number> {
  const screenings = await readScreeningsFromAPI();
  const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
  
  let cleanedCount = 0;
  const updatedScreenings = screenings.map(screening => {
    if (screening.applicationId === applicationId && 
        (screening.status === 'screening_in_progress' || screening.status === 'screening_scheduled') &&
        new Date(screening.createdAt || 0) < cutoffTime) {
      cleanedCount++;
      return {
        ...screening,
        status: 'rejected' as const,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        errorMessage: 'Cleaned up incomplete screening call'
      };
    }
    return screening;
  });
  
  if (cleanedCount > 0) {
    await writeScreeningsToAPI(updatedScreenings);
  }
  
  return cleanedCount;
}

/**
 * Browser-compatible version of handleInterruptedCall
 */
export async function handleInterruptedCall(
  screeningId: string, 
  reason: string = 'Call interrupted due to page navigation or component unmount'
): Promise<boolean> {
  try {
    const response = await fetch(`/api/screenings?id=${encodeURIComponent(screeningId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: 'rejected',
        errorMessage: reason,
        completedAt: new Date().toISOString()
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error handling interrupted call:', error);
    return false;
  }
}

/**
 * Browser-compatible version of cleanupStaleScreeningCalls
 */
export async function cleanupStaleScreeningCalls(timeoutMinutes: number = 5): Promise<number> {
  const screenings = await readScreeningsFromAPI();
  const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
  
  let cleanedCount = 0;
  const updatedScreenings = screenings.map(screening => {
    if ((screening.status === 'screening_in_progress' || screening.status === 'screening_scheduled') &&
        new Date(screening.createdAt || 0) < cutoffTime) {
      cleanedCount++;
      return {
        ...screening,
        status: 'rejected' as const,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        errorMessage: 'Stale screening call cleaned up automatically'
      };
    }
    return screening;
  });
  
  if (cleanedCount > 0) {
    await writeScreeningsToAPI(updatedScreenings);
  }
  
  return cleanedCount;
}

/**
 * Get the maximum allowed calls for an application (defaults to 1)
 */
export function getMaxAllowedCalls(applicationId: string): number {
  // You can implement logic here to read from a config file or database
  // For now we'll just return 1 as the default
  return 1;
}

/**
 * Log screening errors for analytics and debugging
 */
export function logScreeningError(applicationId: string, errorType: string, details: any): string {
  const errorId = `error_${Date.now()}`;
  console.log(`[SCREENING ERROR ${errorId}] ${errorType}:`, {
    applicationId,
    timestamp: new Date().toISOString(),
    ...details
  });
  return errorId;
}

/**
 * Release screening call resources (cleanup function)
 */
export function releaseScreeningResources(screeningId: string): void {
  try {
    // In a real implementation, this might include:
    // 1. Closing open connections
    // 2. Releasing memory
    // 3. Updating status in external services
    console.log(`Released resources for screening ${screeningId}`);
  } catch (error) {
    console.error(`Failed to release resources for screening ${screeningId}:`, error);
  }
}
