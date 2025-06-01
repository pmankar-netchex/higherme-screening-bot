/**
 * Call Processing Debug Monitor Component
 * 
 * This component provides a debugging panel for monitoring call processing,
 * with a specific focus on detecting and resolving cases where calls have
 * transcripts but still show error states.
 */

import React, { useState, useEffect } from 'react';
import { 
  getMonitoredCalls,
  getCallMonitorStatus,
  clearMonitoredCalls
} from '../../lib/monitoring/callPostProcessingMonitor';

interface CallProcessingDebugMonitorProps {
  onlyShowIssues?: boolean;
  refreshInterval?: number; // in milliseconds
}

const CallProcessingDebugMonitor: React.FC<CallProcessingDebugMonitorProps> = ({
  onlyShowIssues = true,
  refreshInterval = 5000
}) => {
  const [monitoredCalls, setMonitoredCalls] = useState<any[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedCallDetails, setSelectedCallDetails] = useState<any | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  
  // Load monitored calls
  const loadMonitoredCalls = () => {
    const calls = getMonitoredCalls();
    
    // Filter to only show issues if that option is enabled
    const filteredCalls = onlyShowIssues 
      ? calls.filter(call => 
          call.conflictDetected || 
          call.failureReason || 
          call.status === 'failed' || 
          call.status === 'partial_success' ||
          (call.hasTranscript && !call.hasSummary)
        )
      : calls;
    
    setMonitoredCalls(filteredCalls);
    setLastRefreshed(new Date().toLocaleTimeString());
    
    // Update selected call details if we have a selection
    if (selectedCallId) {
      const callDetails = getCallMonitorStatus(selectedCallId);
      if (callDetails) {
        setSelectedCallDetails(callDetails);
      }
    }
  };

  // Load calls on initial render
  useEffect(() => {
    loadMonitoredCalls();
    
    // Set up interval for refreshing
    const intervalId = setInterval(loadMonitoredCalls, refreshInterval);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [refreshInterval, onlyShowIssues]);
  
  // Update selected call details when selection changes
  useEffect(() => {
    if (selectedCallId) {
      const callDetails = getCallMonitorStatus(selectedCallId);
      setSelectedCallDetails(callDetails);
    } else {
      setSelectedCallDetails(null);
    }
  }, [selectedCallId]);
  
  const handleClearMonitor = () => {
    clearMonitoredCalls();
    setSelectedCallId(null);
    setSelectedCallDetails(null);
    loadMonitoredCalls();
  };
  
  const handleSelectCall = (callId: string) => {
    setSelectedCallId(callId === selectedCallId ? null : callId);
  };
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Call Processing Monitor</h2>
        <div className="space-x-2">
          <button 
            onClick={loadMonitoredCalls}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          <button 
            onClick={handleClearMonitor}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex items-center mb-3 text-sm text-gray-500">
        <span className="mr-2">Last refreshed: {lastRefreshed}</span>
        <span>Monitoring {monitoredCalls.length} call(s)</span>
        
        <label className="ml-auto flex items-center">
          <input 
            type="checkbox" 
            checked={onlyShowIssues} 
            onChange={() => {}} // This is controlled from the parent
            className="mr-2"
          />
          Only show issues
        </label>
      </div>
      
      {monitoredCalls.length === 0 ? (
        <div className="p-4 text-center text-gray-500 border border-gray-200 rounded">
          No calls being monitored{onlyShowIssues ? ' with issues' : ''}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Call list */}
          <div className="border rounded overflow-auto max-h-96">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call ID</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monitoredCalls.map(call => (
                  <tr 
                    key={call.callId}
                    onClick={() => handleSelectCall(call.callId)}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedCallId === call.callId ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-2 px-3 text-sm">{call.callId.substring(0, 8)}...</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex text-xs px-2 py-1 rounded ${
                        call.status === 'completed' ? 'bg-green-100 text-green-800' :
                        call.status === 'conflict_resolved' ? 'bg-yellow-100 text-yellow-800' :
                        call.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs">
                      {call.conflictDetected && (
                        <span className="mr-1 inline-block bg-yellow-100 text-yellow-800 px-1 rounded">Conflict</span>
                      )}
                      {call.hasTranscript && !call.hasSummary && (
                        <span className="mr-1 inline-block bg-orange-100 text-orange-800 px-1 rounded">No Summary</span>
                      )}
                      {call.failureReason && (
                        <span className="mr-1 inline-block bg-red-100 text-red-800 px-1 rounded">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Call details */}
          <div className="border rounded p-3 bg-white">
            {selectedCallDetails ? (
              <div>
                <h3 className="font-medium mb-2">Call Details: {selectedCallDetails.callId.substring(0, 10)}...</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Status:</div>
                    <div>{selectedCallDetails.status}</div>
                    
                    <div className="font-medium">First seen:</div>
                    <div>{new Date(selectedCallDetails.initialTimestamp).toLocaleString()}</div>
                    
                    <div className="font-medium">Last updated:</div>
                    <div>{new Date(selectedCallDetails.lastUpdated).toLocaleString()}</div>
                    
                    <div className="font-medium">Processing attempts:</div>
                    <div>{selectedCallDetails.processingAttempts}</div>
                    
                    <div className="font-medium">Data status:</div>
                    <div>
                      {selectedCallDetails.hasTranscript ? '✅' : '❌'} Transcript
                      {' | '}
                      {selectedCallDetails.hasSummary ? '✅' : '❌'} Summary
                      {' | '}
                      {selectedCallDetails.hasAudio ? '✅' : '❌'} Audio
                    </div>
                  </div>
                  
                  {selectedCallDetails.conflictDetected && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div><span className="font-medium">Conflict type:</span> {selectedCallDetails.conflictType}</div>
                      <div><span className="font-medium">Resolution:</span> {selectedCallDetails.conflictResolution}</div>
                    </div>
                  )}
                  
                  {selectedCallDetails.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="font-medium">Error message:</div>
                      <div className="text-red-700">{selectedCallDetails.errorMessage}</div>
                    </div>
                  )}
                  
                  {selectedCallDetails.failureReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="font-medium">Failure reason:</div>
                      <div className="text-red-700">{selectedCallDetails.failureReason}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Select a call to see details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallProcessingDebugMonitor;
