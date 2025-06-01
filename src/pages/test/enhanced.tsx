import React, { useState, useCallback } from 'react';
import UnifiedVoiceScreeningCall from '../../components/features/screening/UnifiedVoiceScreeningCall';
import { VapiCallData } from '../../lib/services/vapiCallService';

interface CallDataState {
  transcript?: string;
  summary?: string;
  audioUrl?: string;
  callId?: string;
  duration?: number;
  status?: string;
  analysis?: {
    overallRating?: number;
    recommendation?: string;
    communicationScore?: number;
    technicalScore?: number;
    experienceScore?: number;
    keyStrengths?: string[];
    areasForImprovement?: string[];
  };
  retrievalAttempts?: number;
  lastRetrievalError?: string;
  // Direct properties for compatibility
  overallRating?: number;
  recommendation?: string;
  communicationScore?: number;
  technicalScore?: number;
  experienceScore?: number;
  keyStrengths?: string[];
  areasForImprovement?: string[];
}

const EnhancedScreeningDemo = () => {
  const [callResults, setCallResults] = useState<CallDataState | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  // Mock data for demonstration
  const mockJob = {
    id: 'job-123',
    title: 'Senior React Developer',
    department: 'Engineering',
    description: 'Senior React developer role focusing on frontend development and user experience.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'UI/UX knowledge'],
    responsibilities: ['Frontend development', 'Performance optimization', 'Code reviews'],
    shiftTypes: ['Full-time'],
    weekendRequired: false,
    hourlyRate: '45-60',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockCandidate = {
    id: 'candidate-456',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1-555-0123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockApplicationId = 'app-789';

  const handleCallStart = useCallback(() => {
    console.log('Call started - demo handler');
    setCallResults(null);
  }, []);

  const handleCallEnd = useCallback((callData: CallDataState) => {
    console.log('Call ended with data:', callData);
    setCallResults(callData);
  }, []);

  const handleCallError = useCallback((error: Error) => {
    console.error('Call error in demo:', error);
  }, []);

  const handleDataRetrieved = useCallback((data: CallDataState) => {
    console.log('Data retrieved:', data);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Enhanced Voice Screening Demo
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            This demo showcases the enhanced voice screening component with comprehensive 
            call data retrieval, retry logic, and intelligent analysis.
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-3">Features Demonstrated:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Enhanced call data retrieval with multiple fallback methods</li>
              <li>Automatic retry logic for failed data retrieval attempts</li>
              <li>Real-time call status and progress monitoring</li>
              <li>Comprehensive screening analysis with AI-powered insights</li>
              <li>Audio recording playback and transcript display</li>
              <li>Error handling and recovery mechanisms</li>
              <li>Manual data retrieval option for failed attempts</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Configuration:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Job:</strong> {mockJob.title} in {mockJob.department}</p>
              <p><strong>Candidate:</strong> {mockCandidate.firstName} {mockCandidate.lastName}</p>
              <p><strong>Department:</strong> {mockJob.department}</p>
              <p><strong>Max Retry Attempts:</strong> 5</p>
              <p><strong>Auto Retry:</strong> Enabled</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showDebugInfo}
                onChange={(e) => setShowDebugInfo(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Show debug information</span>
            </label>
          </div>
        </div>

        {/* Enhanced Voice Screening Component */}
        <div className="mb-8">
          <UnifiedVoiceScreeningCall
            jobId={mockJob.id}
            candidateId={mockCandidate.id}
            applicationId={mockApplicationId}
            job={mockJob}
            candidate={mockCandidate}
            onCallStart={handleCallStart}
            onCallEnd={handleCallEnd}
            onCallError={handleCallError}
            onDataRetrieved={handleDataRetrieved}
            autoRetry={true}
            maxRetryAttempts={5}
            showDebugInfo={showDebugInfo}
          />
        </div>

        {/* Call Results Display */}
        {callResults && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Call Results Summary
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Call Metadata
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Call ID:</strong> {callResults.callId || 'N/A'}</p>
                  <p><strong>Duration:</strong> {callResults.duration ? `${callResults.duration}s` : 'N/A'}</p>
                  <p><strong>Status:</strong> {callResults.status || 'N/A'}</p>
                  <p><strong>Retrieval Attempts:</strong> {callResults.retrievalAttempts || 'N/A'}</p>
                </div>
              </div>

              {callResults.analysis && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Screening Analysis
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Overall Rating:</strong> {callResults.overallRating || (callResults.analysis && callResults.analysis.overallRating) || 'N/A'}/10</p>
                    <p><strong>Recommendation:</strong> {callResults.recommendation || (callResults.analysis && callResults.analysis.recommendation) || 'N/A'}</p>
                    <p><strong>Communication Score:</strong> {callResults.communicationScore || (callResults.analysis && callResults.analysis.communicationScore) || 'N/A'}/10</p>
                    <p><strong>Technical Score:</strong> {callResults.technicalScore || (callResults.analysis && callResults.analysis.technicalScore) || 'N/A'}/10</p>
                    <p><strong>Experience Score:</strong> {callResults.experienceScore || (callResults.analysis && callResults.analysis.experienceScore) || 'N/A'}/10</p>
                  </div>
                </div>
              )}
            </div>

            {(callResults.keyStrengths || callResults.analysis?.keyStrengths) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Key Strengths
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {(callResults.keyStrengths || callResults.analysis?.keyStrengths || []).map((strength: string, index: number) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {(callResults.areasForImprovement || callResults.analysis?.areasForImprovement) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Areas for Improvement
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {(callResults.areasForImprovement || callResults.analysis?.areasForImprovement || []).map((area: string, index: number) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            )}

            {callResults.transcript && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Full Transcript
                </h3>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {callResults.transcript}
                  </p>
                </div>
              </div>
            )}

            {showDebugInfo && callResults.lastRetrievalError && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-3">
                  Debug Information
                </h3>
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Last Retrieval Error:</strong> {callResults.lastRetrievalError}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technical Information */}
        <div className="mt-8 bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Technical Implementation Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">Data Retrieval Methods:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Direct REST API with retry logic</li>
                <li>Comprehensive analysis approach</li>
                <li>Extended wait with timeout</li>
                <li>Manual retry option</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Error Handling:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Payment and authentication errors</li>
                <li>Network timeout handling</li>
                <li>Graceful fallback mechanisms</li>
                <li>User-friendly error messages</li>
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Monitoring & Analytics:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Real-time call status tracking</li>
              <li>Data retrieval progress indicators</li>
              <li>Comprehensive logging for debugging</li>
              <li>Performance metrics collection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedScreeningDemo;
