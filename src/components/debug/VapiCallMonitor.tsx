/**
 * VapiCallMonitor Component
 * 
 * A development component to monitor Vapi calls and display real-time error details.
 * This helps developers debug Vapi call issues and understand what's happening.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useVapiErrorTracking } from '../../hooks/use-vapi-error-tracking';

interface VapiCallMonitorProps {
  showErrorsOnly?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  expanded?: boolean;
  onErrorsCleared?: () => void;
}

const VapiCallMonitor: React.FC<VapiCallMonitorProps> = ({
  showErrorsOnly = false,
  position = 'bottom-right',
  expanded = false,
  onErrorsCleared
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [callCount, setCallCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [lastCallId, setLastCallId] = useState<string | null>(null);
  
  // Use our error tracking hook
  const {
    errors,
    errorCount,
    lastError,
    errorsByCategory,
    clearErrors,
    getErrorStats
  } = useVapiErrorTracking({
    notifyOnError: true,
    maxErrorHistory: 10,
    autoCleanup: true
  });
  
  // Position styles
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };
  
  // Listen for Vapi call events on window
  useEffect(() => {
    const handleCallStart = (event: any) => {
      if (event.detail?.callId) {
        setCallCount(prev => prev + 1);
        setLastCallId(event.detail.callId);
      }
    };
    
    const handleCallComplete = (event: any) => {
      if (event.detail?.success) {
        setSuccessCount(prev => prev + 1);
      }
    };
    
    // Add custom event listeners
    window.addEventListener('vapi-call-start', handleCallStart);
    window.addEventListener('vapi-call-complete', handleCallComplete);
    
    return () => {
      window.removeEventListener('vapi-call-start', handleCallStart);
      window.removeEventListener('vapi-call-complete', handleCallComplete);
    };
  }, []);
  
  // Handle clear action
  const handleClear = () => {
    clearErrors();
    if (onErrorsCleared) onErrorsCleared();
  };
  
  // Don't render if there's nothing to show in errors-only mode
  if (showErrorsOnly && errors.length === 0) {
    return null;
  }
  
  const errorStats = getErrorStats();
  
  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end`}
    >
      {/* Collapsed Info Button */}
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className={`rounded-full p-2 shadow-lg flex items-center ${
            errors.length > 0 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'
          }`}
        >
          <span className="text-sm px-2">
            {errors.length > 0 ? `${errors.length} Vapi Errors` : 'Vapi Monitor'}
          </span>
          {errors.length > 0 && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
      )}
      
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-96 max-h-96 flex flex-col">
          {/* Header */}
          <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Vapi Call Monitor</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleClear}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Clear
              </button>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 text-center py-2 bg-gray-50 text-xs text-gray-600">
            <div className="border-r border-gray-200">
              <div className="font-semibold">Total Calls</div>
              <div>{callCount}</div>
            </div>
            <div className="border-r border-gray-200">
              <div className="font-semibold">Success</div>
              <div className="text-green-600">{successCount}</div>
            </div>
            <div className="border-r border-gray-200">
              <div className="font-semibold">Errors</div>
              <div className={errors.length > 0 ? "text-red-600" : ""}>{errorCount}</div>
            </div>
            <div>
              <div className="font-semibold">Top Issue</div>
              <div className="truncate px-1">
                {errorStats.mostFrequentCategory || "None"}
              </div>
            </div>
          </div>
          
          {/* Error List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {errors.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm">
                No errors recorded
              </div>
            ) : (
              errors.map((error) => (
                <div 
                  key={error.errorCode} 
                  className="text-xs bg-red-50 p-2 rounded border border-red-100"
                >
                  <div className="font-medium text-red-800 flex justify-between">
                    <span>Error: {error.errorMessage.substring(0, 40)}{error.errorMessage.length > 40 ? '...' : ''}</span>
                    <span className="text-gray-500">{error.errorCode}</span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    Category: <span className="capitalize">{error.errorCategory}</span>
                  </div>
                  {error.callId && (
                    <div className="text-gray-600">Call ID: {error.callId}</div>
                  )}
                  <div className="text-gray-500 mt-1">{new Date(error.timestamp).toLocaleTimeString()}</div>
                  {error.suggestedAction && (
                    <div className="mt-1 text-blue-700 bg-blue-50 p-1 rounded">
                      {error.suggestedAction}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Last Call ID Footer */}
          {lastCallId && (
            <div className="border-t border-gray-200 px-3 py-1 text-xs text-gray-500 bg-gray-50">
              <div className="flex justify-between">
                <span>Last Call ID:</span>
                <span className="font-mono">{lastCallId}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VapiCallMonitor;
