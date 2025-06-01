/**
 * Use Vapi Error Tracking Hook
 * 
 * This hook provides global tracking and management of Vapi call errors
 * across the application. It can be used to track errors, show notifications,
 * and provide consistent error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { CallErrorDetails } from '../lib/services/callErrorLogger';

interface VapiErrorState {
  activeErrors: CallErrorDetails[];
  errorCount: number;
  lastError: CallErrorDetails | null;
  errorsByCategory: Record<string, number>;
}

interface VapiErrorTrackerOptions {
  maxErrorHistory?: number;
  autoCleanup?: boolean;
  cleanupInterval?: number; // ms
  notifyOnError?: boolean;
  onNewError?: (error: CallErrorDetails) => void;
}

export function useVapiErrorTracking(options: VapiErrorTrackerOptions = {}) {
  const {
    maxErrorHistory = 20,
    autoCleanup = true,
    cleanupInterval = 3600000, // 1 hour default
    notifyOnError = false,
    onNewError
  } = options;
  
  const [errorState, setErrorState] = useState<VapiErrorState>({
    activeErrors: [],
    errorCount: 0,
    lastError: null,
    errorsByCategory: {}
  });
  
  /**
   * Track a new error
   */
  const trackError = useCallback((error: CallErrorDetails) => {
    setErrorState(prevState => {
      // Add to active errors, keeping within maximum limit
      const activeErrors = [
        error,
        ...prevState.activeErrors
      ].slice(0, maxErrorHistory);
      
      // Update category count
      const errorsByCategory = {
        ...prevState.errorsByCategory,
        [error.errorCategory]: (prevState.errorsByCategory[error.errorCategory] || 0) + 1
      };
      
      return {
        activeErrors,
        errorCount: prevState.errorCount + 1,
        lastError: error,
        errorsByCategory
      };
    });
    
    // Trigger notification if enabled
    if (notifyOnError) {
      showErrorNotification(error);
    }
    
    // Call the onNewError callback if provided
    if (onNewError) {
      onNewError(error);
    }
    
    return error;
  }, [maxErrorHistory, notifyOnError, onNewError]);
  
  /**
   * Clear all tracked errors
   */
  const clearErrors = useCallback(() => {
    setErrorState({
      activeErrors: [],
      errorCount: 0,
      lastError: null,
      errorsByCategory: {}
    });
  }, []);
  
  /**
   * Remove a specific error by its error code
   */
  const dismissError = useCallback((errorCode: string) => {
    setErrorState(prevState => {
      const filteredErrors = prevState.activeErrors.filter(e => e.errorCode !== errorCode);
      
      // Recalculate error categories
      const errorsByCategory: Record<string, number> = {};
      filteredErrors.forEach(e => {
        errorsByCategory[e.errorCategory] = (errorsByCategory[e.errorCategory] || 0) + 1;
      });
      
      return {
        activeErrors: filteredErrors,
        errorCount: prevState.errorCount,
        lastError: filteredErrors.length > 0 ? filteredErrors[0] : null,
        errorsByCategory
      };
    });
  }, []);
  
  /**
   * Get error statistics
   */
  const getErrorStats = useCallback(() => {
    const { activeErrors, errorsByCategory } = errorState;
    
    const topCategories = Object.entries(errorsByCategory)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3);
      
    return {
      total: errorState.errorCount,
      active: activeErrors.length,
      topCategories,
      mostFrequentCategory: topCategories.length > 0 ? topCategories[0][0] : null,
    };
  }, [errorState]);
  
  /**
   * Show a notification for a new error
   */
  const showErrorNotification = (error: CallErrorDetails) => {
    // This is a simple console notification, but could be replaced
    // with a proper UI notification system
    console.log(`%c Vapi Call Error: ${error.errorMessage} `, 
      'background: #FDE8E8; color: #B91C1C; padding: 2px 4px; border-radius: 2px;');
      
    // In a real implementation, you might use a toast notification:
    // toast.error(`Vapi Call Error: ${error.errorMessage}`, {
    //   description: error.suggestedAction,
    //   duration: 5000,
    // });
  };
  
  // Set up automatic error cleanup if enabled
  useEffect(() => {
    if (!autoCleanup) return;
    
    const timer = setInterval(() => {
      setErrorState(prevState => {
        // Only keep errors from the past hour
        const oneHourAgo = new Date(Date.now() - cleanupInterval).toISOString();
        const filteredErrors = prevState.activeErrors.filter(
          error => error.timestamp > oneHourAgo
        );
        
        if (filteredErrors.length === prevState.activeErrors.length) {
          return prevState; // No changes needed
        }
        
        // Recalculate category counts
        const errorsByCategory: Record<string, number> = {};
        filteredErrors.forEach(e => {
          errorsByCategory[e.errorCategory] = (errorsByCategory[e.errorCategory] || 0) + 1;
        });
        
        return {
          activeErrors: filteredErrors,
          errorCount: prevState.errorCount,
          lastError: filteredErrors.length > 0 ? filteredErrors[0] : null,
          errorsByCategory
        };
      });
    }, cleanupInterval);
    
    return () => clearInterval(timer);
  }, [autoCleanup, cleanupInterval]);
  
  return {
    errors: errorState.activeErrors,
    lastError: errorState.lastError,
    errorCount: errorState.errorCount,
    errorsByCategory: errorState.errorsByCategory,
    trackError,
    dismissError,
    clearErrors,
    getErrorStats
  };
}

// Optional: Create a global error context for app-wide usage
// This could be implemented with a React context provider
