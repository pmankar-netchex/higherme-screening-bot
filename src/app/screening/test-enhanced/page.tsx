'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  initVapiScreening,
  getCallAudioLinks,
  getEnhancedScreeningSummary,
  retrieveCallDataWithRetry,
  generateEnhancedAnalysis,
  VapiCallAudioLinks,
  EnhancedScreeningSummary,
  EnhancedScreeningAnalysis,
  VapiCallData
} from '../../../lib/vapiEnhanced';

// Loading state component
function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-20">
      <div className="text-center">
        <div 
          className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default function TestEnhancedVapiPage() {
  const [callId, setCallId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkStatus, setSdkStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // State for results
  const [audioLinks, setAudioLinks] = useState<VapiCallAudioLinks | null>(null);
  const [screeningSummary, setScreeningSummary] = useState<EnhancedScreeningSummary | null>(null);
  const [callData, setCallData] = useState<VapiCallData | null>(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<EnhancedScreeningAnalysis | null>(null);
  
  // Initialize Vapi SDK
  useEffect(() => {
    const status = initVapiScreening();
    setSdkStatus(status);
  }, []);

  // Handle retrieving call audio links
  const handleGetAudioLinks = async () => {
    if (!callId.trim()) {
      setError('Please enter a call ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const links = await getCallAudioLinks(callId);
      setAudioLinks(links);
      if (!links) {
        setError('No audio links found for this call');
      }
    } catch (err) {
      console.error('Error retrieving audio links:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle retrieving enhanced screening summary
  const handleGetScreeningSummary = async () => {
    if (!callId.trim()) {
      setError('Please enter a call ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const summary = await getEnhancedScreeningSummary(callId);
      setScreeningSummary(summary);
      if (!summary) {
        setError('No screening summary found for this call');
      }
    } catch (err) {
      console.error('Error retrieving screening summary:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle retrieving call data with enhanced analysis
  const handleGetCallData = async () => {
    if (!callId.trim()) {
      setError('Please enter a call ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await retrieveCallDataWithRetry(callId);
      setCallData(data);
      
      if (data) {
        const analysis = generateEnhancedAnalysis(data);
        setEnhancedAnalysis(analysis);
      } else {
        setError('No call data found for this call');
      }
    } catch (err) {
      console.error('Error retrieving call data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Render progress bars for scores
  const renderScoreBar = (score: number, color: string) => (
    <div className="flex items-center mt-1">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`}
          style={{ width: `${score * 10}%` }}
        ></div>
      </div>
      <span className="ml-2 text-sm font-medium">{score}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Vapi SDK Test</h1>
          <p className="text-gray-600 mt-2">
            Test the enhanced implementations for retrieving call audio links and screening summaries
          </p>

          {/* Back button */}
          <div className="mt-4">
            <Link href="/screening" className="text-blue-600 hover:text-blue-800">
              ← Back to Screening
            </Link>
          </div>
        </div>

        {/* SDK Status */}
        {sdkStatus && (
          <div className={`p-4 mb-6 rounded-lg ${sdkStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${sdkStatus.success ? 'text-green-700' : 'text-red-700'}`}>
              <strong>{sdkStatus.success ? 'Success' : 'Error'}</strong>: {sdkStatus.message}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Call ID Input */}
        <div className="p-6 bg-white shadow-md rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Vapi Enhanced SDK</h2>
          
          <div className="mb-6">
            <label htmlFor="callId" className="block text-sm font-medium text-gray-700 mb-1">
              Call ID
            </label>
            <div className="flex">
              <input
                type="text"
                id="callId"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                placeholder="Enter Vapi call ID"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleGetAudioLinks}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Audio Links'}
            </button>
            <button
              onClick={handleGetScreeningSummary}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Enhanced Summary'}
            </button>
            <button
              onClick={handleGetCallData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Call Data with Analysis'}
            </button>
          </div>
          
          {loading && <LoadingState message="Processing request..." />}
        </div>

        {/* Results Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Links Results */}
          {audioLinks && (
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Audio Links</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-700">Status: {audioLinks.status}</p>
                {audioLinks.error && (
                  <p className="text-sm text-red-600 mt-1">Error: {audioLinks.error}</p>
                )}
              </div>

              {(audioLinks.stereoUrl || audioLinks.monoUrl) && (
                <div className="space-y-3">
                  {audioLinks.stereoUrl && (
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <p className="text-sm font-medium">Stereo Recording</p>
                      <audio controls className="mt-2 w-full">
                        <source src={audioLinks.stereoUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      {audioLinks.downloadLinks.stereo && (
                        <a 
                          href={audioLinks.downloadLinks.stereo} 
                          className="text-sm text-blue-600 hover:underline block mt-2"
                          download
                        >
                          Download Recording
                        </a>
                      )}
                    </div>
                  )}
                  
                  {audioLinks.monoUrl && (
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <p className="text-sm font-medium">Mono Recording</p>
                      <audio controls className="mt-2 w-full">
                        <source src={audioLinks.monoUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      {audioLinks.downloadLinks.mono && (
                        <a 
                          href={audioLinks.downloadLinks.mono} 
                          className="text-sm text-blue-600 hover:underline block mt-2"
                          download
                        >
                          Download Recording
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Enhanced Analysis Results */}
          {enhancedAnalysis && callData && (
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Enhanced Analysis</h2>
              
              <div className="mb-4">
                <p className="font-medium">Overall Rating: {enhancedAnalysis.overallRating}/10</p>
                <p className="text-sm text-gray-700 mt-1">{enhancedAnalysis.recommendation}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-medium mb-2">Scores</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm">Communication</p>
                    {renderScoreBar(enhancedAnalysis.communicationScore, 'bg-blue-600')}
                  </div>
                  <div>
                    <p className="text-sm">Technical Skills</p>
                    {renderScoreBar(enhancedAnalysis.technicalScore, 'bg-purple-600')}
                  </div>
                  <div>
                    <p className="text-sm">Experience</p>
                    {renderScoreBar(enhancedAnalysis.experienceScore, 'bg-green-600')}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">Key Strengths</p>
                  <ul className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                    {enhancedAnalysis.keyStrengths.map((strength, index) => (
                      <li key={index} className="py-1 border-b border-gray-100 last:border-b-0">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Areas for Improvement</p>
                  <ul className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                    {enhancedAnalysis.areasForImprovement.map((area, index) => (
                      <li key={index} className="py-1 border-b border-gray-100 last:border-b-0">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Comprehensive Screening Summary */}
          {screeningSummary && (
            <div className="bg-white p-6 shadow-md rounded-lg lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Comprehensive Screening Summary</h2>
              
              <div className="mb-4">
                <p className="text-sm">Call ID: {screeningSummary.callId}</p>
                <p className="text-sm">Screening Complete: {screeningSummary.screeningComplete ? 'Yes' : 'No'}</p>
                <p className="text-sm">Retrieved: {new Date(screeningSummary.retrievalTimestamp).toLocaleString()}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm">{screeningSummary.summary}</p>
                </div>
              </div>
              
              {screeningSummary.candidateInfo && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Candidate Information</h3>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    {screeningSummary.candidateInfo.name && (
                      <p className="text-sm mb-1"><strong>Name:</strong> {screeningSummary.candidateInfo.name}</p>
                    )}
                    {screeningSummary.candidateInfo.jobTitle && (
                      <p className="text-sm mb-1"><strong>Current Role:</strong> {screeningSummary.candidateInfo.jobTitle}</p>
                    )}
                    {screeningSummary.candidateInfo.yearsExperience && (
                      <p className="text-sm mb-1"><strong>Experience:</strong> {screeningSummary.candidateInfo.yearsExperience} years</p>
                    )}
                    {screeningSummary.candidateInfo.skills && screeningSummary.candidateInfo.skills.length > 0 && (
                      <div className="text-sm">
                        <strong>Skills:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {screeningSummary.candidateInfo.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm font-medium">Communication</p>
                    {renderScoreBar(screeningSummary.analysis.communicationScore, 'bg-blue-600')}
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm font-medium">Technical Skills</p>
                    {renderScoreBar(screeningSummary.analysis.technicalScore, 'bg-purple-600')}
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm font-medium">Experience</p>
                    {renderScoreBar(screeningSummary.analysis.experienceScore, 'bg-green-600')}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            screeningSummary.analysis.overallRating >= 8 ? 'bg-green-600' :
                            screeningSummary.analysis.overallRating >= 6 ? 'bg-blue-600' :
                            screeningSummary.analysis.overallRating >= 4 ? 'bg-amber-500' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${screeningSummary.analysis.overallRating * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{screeningSummary.analysis.overallRating}/10 Overall</span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      screeningSummary.recommendToHire ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {screeningSummary.recommendToHire ? 'Recommended' : 'Not Recommended'}
                    </span>
                  </div>
                  <p className="text-sm">{screeningSummary.analysis.recommendation}</p>
                </div>
              </div>
              
              {screeningSummary.audioLinks && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Audio Recording</h3>
                  {screeningSummary.audioLinks.stereoUrl && (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <audio controls className="w-full">
                        <source src={screeningSummary.audioLinks.stereoUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      {screeningSummary.audioLinks.downloadLinks.stereo && (
                        <a 
                          href={screeningSummary.audioLinks.downloadLinks.stereo} 
                          className="text-sm text-blue-600 hover:underline block mt-2"
                          download
                        >
                          Download Recording
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Key Strengths</h3>
                  <ul className="bg-gray-50 p-3 rounded border border-gray-200">
                    {screeningSummary.analysis.keyStrengths.map((strength, index) => (
                      <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-b-0">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Areas for Improvement</h3>
                  <ul className="bg-gray-50 p-3 rounded border border-gray-200">
                    {screeningSummary.analysis.areasForImprovement.map((area, index) => (
                      <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-b-0">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
