/**
 * Unified test page for all Vapi enhanced services
 */

import React, { useState, useEffect } from 'react';
import { 
  getCallData, 
  waitForCallData, 
  setupEnhancedVapiEventHandlers,
  retrieveCallDataWithRetry,
  analyzeCallDataComprehensively,
  analyzeScreeningCall,
  generateEnhancedAnalysis,
  initVapiScreening,
  getCallAudioLinks,
  getEnhancedScreeningSummary
} from '../../lib/vapiEnhanced';
import UnifiedVoiceScreeningCall from '../../components/features/screening/UnifiedVoiceScreeningCall';

export default function UnifiedTestPage() {
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [callId, setCallId] = useState<string>('');
  const [tab, setTab] = useState<'demo' | 'component' | 'docs'>('demo');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mockData] = useState({
    job: {
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
    },
    candidate: {
      id: 'candidate-456',
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1-555-0123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    applicationId: 'app-789'
  });

  // Initialize Vapi on component mount
  useEffect(() => {
    const initStatus = initVapiScreening();
    setStatus(initStatus);
  }, []);

  // Handle basic call data retrieval
  const handleGetCallData = async () => {
    if (!callId.trim()) {
      alert('Please enter a call ID');
      return;
    }

    setLoading(true);
    try {
      const data = await getCallData(callId);
      setResults({
        type: 'basic',
        data
      });
    } catch (error) {
      console.error('Error retrieving call data:', error);
      setResults({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle enhanced call data retrieval
  const handleGetEnhancedData = async () => {
    if (!callId.trim()) {
      alert('Please enter a call ID');
      return;
    }

    setLoading(true);
    try {
      // Get data with retry logic
      const callData = await retrieveCallDataWithRetry(callId);
      
      if (!callData) {
        throw new Error('Failed to retrieve call data after multiple attempts');
      }
      
      // Generate enhanced analysis
      const enhancedAnalysis = generateEnhancedAnalysis(callData);
      
      setResults({
        type: 'enhanced',
        callData,
        enhancedAnalysis
      });
    } catch (error) {
      console.error('Error retrieving enhanced call data:', error);
      setResults({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle comprehensive analysis
  const handleGetComprehensiveAnalysis = async () => {
    if (!callId.trim()) {
      alert('Please enter a call ID');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeScreeningCall(callId);
      setResults({
        type: 'comprehensive',
        result
      });
    } catch (error) {
      console.error('Error getting comprehensive analysis:', error);
      setResults({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle getting call audio links
  const handleGetCallAudioLinks = async () => {
    if (!callId.trim()) {
      alert('Please enter a call ID');
      return;
    }

    setLoading(true);
    try {
      const audioLinks = await getCallAudioLinks(callId);
      setResults({
        type: 'audio-links',
        audioLinks
      });
    } catch (error) {
      console.error('Error retrieving call audio links:', error);
      setResults({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle getting enhanced screening summary
  const handleGetEnhancedSummary = async () => {
    if (!callId.trim()) {
      alert('Please enter a call ID');
      return;
    }

    setLoading(true);
    try {
      const summary = await getEnhancedScreeningSummary(callId);
      setResults({
        type: 'enhanced-summary',
        summary
      });
    } catch (error) {
      console.error('Error retrieving enhanced screening summary:', error);
      setResults({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unified Vapi Enhanced Services</h1>
          <p className="text-gray-600 mb-6">Test all enhanced Vapi SDK features in one place</p>
          
          {/* Initialization Status */}
          {status && (
            <div className={`p-4 mb-8 rounded-lg ${status.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${status.success ? 'text-green-700' : 'text-red-700'}`}>
                <strong>{status.success ? 'Success' : 'Error'}</strong>: {status.message}
              </p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button 
                onClick={() => setTab('demo')}
                className={`py-3 px-1 border-b-2 ${
                  tab === 'demo' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                } font-medium text-sm`}
              >
                API Demo
              </button>
              <button 
                onClick={() => setTab('component')}
                className={`py-3 px-1 border-b-2 ${
                  tab === 'component' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                } font-medium text-sm`}
              >
                Component Demo
              </button>
              <button 
                onClick={() => setTab('docs')}
                className={`py-3 px-1 border-b-2 ${
                  tab === 'docs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                } font-medium text-sm`}
              >
                Documentation
              </button>
            </nav>
          </div>

          {/* API Demo Tab */}
          {tab === 'demo' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Vapi API Features</h2>
              
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
              
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleGetCallData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Basic Call Data'}
                </button>
                <button
                  onClick={handleGetEnhancedData}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Enhanced Data'}
                </button>
                <button
                  onClick={handleGetComprehensiveAnalysis}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Comprehensive Analysis'}
                </button>
                <button
                  onClick={handleGetCallAudioLinks}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Call Audio Links'}
                </button>
                <button
                  onClick={handleGetEnhancedSummary}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Enhanced Summary'}
                </button>
              </div>

              {/* Results Display */}
              {results && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4">
                    {results.type === 'basic' ? 'Basic Call Data' : 
                     results.type === 'enhanced' ? 'Enhanced Call Data' : 
                     results.type === 'comprehensive' ? 'Comprehensive Analysis' : 
                     results.type === 'audio-links' ? 'Call Audio Links' :
                     results.type === 'enhanced-summary' ? 'Enhanced Screening Summary' : 'Error'}
                  </h2>
                  
                  {results.type === 'error' ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded">
                      <strong>Error:</strong> {results.error}
                    </div>
                  ) : results.type === 'audio-links' && results.audioLinks ? (
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="mb-4">
                        <h3 className="text-md font-semibold">Call ID: {results.audioLinks.callId}</h3>
                        <p className="text-sm text-gray-700">Status: {results.audioLinks.status}</p>
                        {results.audioLinks.error && (
                          <p className="text-sm text-red-600">Error: {results.audioLinks.error}</p>
                        )}
                      </div>
                      
                      {(results.audioLinks.stereoUrl || results.audioLinks.monoUrl) && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Audio Files</h4>
                          <div className="space-y-2">
                            {results.audioLinks.stereoUrl && (
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-sm font-medium">Stereo Recording</p>
                                <a 
                                  href={results.audioLinks.stereoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  Play Audio
                                </a>
                                {results.audioLinks.downloadLinks.stereo && (
                                  <a 
                                    href={results.audioLinks.downloadLinks.stereo} 
                                    className="text-sm text-blue-600 hover:underline ml-4"
                                    download
                                  >
                                    Download
                                  </a>
                                )}
                              </div>
                            )}
                            
                            {results.audioLinks.monoUrl && (
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-sm font-medium">Mono Recording</p>
                                <a 
                                  href={results.audioLinks.monoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  Play Audio
                                </a>
                                {results.audioLinks.downloadLinks.mono && (
                                  <a 
                                    href={results.audioLinks.downloadLinks.mono} 
                                    className="text-sm text-blue-600 hover:underline ml-4"
                                    download
                                  >
                                    Download
                                  </a>
                                )}
                              </div>
                            )}
                            
                            {results.audioLinks.transcriptDownloadUrl && (
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-sm font-medium">Transcript</p>
                                <a 
                                  href={results.audioLinks.transcriptDownloadUrl} 
                                  className="text-sm text-blue-600 hover:underline"
                                  download
                                >
                                  Download Transcript
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <pre className="text-xs mt-4 bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(results.audioLinks, null, 2)}</pre>
                    </div>
                  ) : results.type === 'enhanced-summary' && results.summary ? (
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Summary for Call ID: {results.summary.callId}</h3>
                        <p className="text-sm mb-4 bg-white p-3 rounded border border-gray-200">
                          {results.summary.summary}
                        </p>
                        
                        {results.summary.candidateInfo && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Candidate Information</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              {results.summary.candidateInfo.name && (
                                <p className="text-sm"><strong>Name:</strong> {results.summary.candidateInfo.name}</p>
                              )}
                              {results.summary.candidateInfo.jobTitle && (
                                <p className="text-sm"><strong>Current Role:</strong> {results.summary.candidateInfo.jobTitle}</p>
                              )}
                              {results.summary.candidateInfo.yearsExperience && (
                                <p className="text-sm"><strong>Experience:</strong> {results.summary.candidateInfo.yearsExperience} years</p>
                              )}
                              {results.summary.candidateInfo.skills && (
                                <div className="text-sm">
                                  <strong>Skills:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {results.summary.candidateInfo.skills.map((skill: string) => (
                                      <span 
                                        key={skill} 
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
                          <h4 className="font-medium mb-2">Evaluation</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-sm font-medium">Communication</p>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${results.summary.analysis.communicationScore * 10}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm font-medium">{results.summary.analysis.communicationScore}</span>
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-sm font-medium">Technical Skills</p>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-purple-600 h-2.5 rounded-full" 
                                    style={{ width: `${results.summary.analysis.technicalScore * 10}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm font-medium">{results.summary.analysis.technicalScore}</span>
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-sm font-medium">Experience</p>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${results.summary.analysis.experienceScore * 10}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm font-medium">{results.summary.analysis.experienceScore}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Overall Assessment</h4>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      results.summary.analysis.overallRating >= 8 ? 'bg-green-600' :
                                      results.summary.analysis.overallRating >= 6 ? 'bg-blue-600' :
                                      results.summary.analysis.overallRating >= 4 ? 'bg-amber-500' :
                                      'bg-red-600'
                                    }`}
                                    style={{ width: `${results.summary.analysis.overallRating * 10}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{results.summary.analysis.overallRating}/10</span>
                              </div>
                              <span className={`text-sm px-2 py-1 rounded ${
                                results.summary.recommendToHire ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {results.summary.recommendToHire ? 'Recommended' : 'Not Recommended'}
                              </span>
                            </div>
                            <p className="text-sm">{results.summary.analysis.recommendation}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Key Strengths</h4>
                            <ul className="bg-white p-3 rounded border border-gray-200">
                              {results.summary.analysis.keyStrengths.map((strength: string, index: number) => (
                                <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-b-0">
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Areas for Improvement</h4>
                            <ul className="bg-white p-3 rounded border border-gray-200">
                              {results.summary.analysis.areasForImprovement.map((area: string, index: number) => (
                                <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-b-0">
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {results.summary.audioLinks && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Resources</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              {results.summary.audioLinks.stereoUrl && (
                                <p className="mb-1">
                                  <a 
                                    href={results.summary.audioLinks.stereoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    Listen to Call Recording
                                  </a>
                                </p>
                              )}
                              
                              {results.summary.audioLinks.downloadLinks.stereo && (
                                <p>
                                  <a 
                                    href={results.summary.audioLinks.downloadLinks.stereo} 
                                    className="text-sm text-blue-600 hover:underline"
                                    download
                                  >
                                    Download Recording
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
                      <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Component Demo Tab */}
          {tab === 'component' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Enhanced Voice Screening Component</h2>
              <UnifiedVoiceScreeningCall 
                jobId={mockData.job.id}
                candidateId={mockData.candidate.id}
                applicationId={mockData.applicationId}
                job={mockData.job}
                candidate={mockData.candidate}
                showDebugInfo={true}
              />
            </div>
          )}

          {/* Documentation Tab */}
          {tab === 'docs' && (
            <div className="prose max-w-none">
              <h2>Vapi Enhanced Services Documentation</h2>
              <p>
                This unified interface provides access to all enhanced Vapi voice screening functionality,
                including data retrieval, analysis, and interactive components.
              </p>

              <h3>Available Services</h3>
              <ul>
                <li>
                  <strong>Call Data Retrieval</strong>
                  <ul>
                    <li><code>getCallData</code> - Direct API call to retrieve call data</li>
                    <li><code>waitForCallData</code> - Wait for call data with retries</li>
                    <li><code>retrieveCallDataWithRetry</code> - Enhanced retry logic with fallbacks</li>
                    <li><code>getCallAudioLinks</code> - Get formatted audio links with download URLs</li>
                  </ul>
                </li>
                <li>
                  <strong>Analysis Services</strong>
                  <ul>
                    <li><code>analyzeCallDataComprehensively</code> - Extract structured insights</li>
                    <li><code>analyzeScreeningCall</code> - Complete call analysis pipeline</li>
                    <li><code>generateEnhancedAnalysis</code> - AI-powered scoring and evaluation</li>
                    <li><code>getEnhancedScreeningSummary</code> - Comprehensive screening results</li>
                  </ul>
                </li>
                <li>
                  <strong>Components</strong>
                  <ul>
                    <li><code>UnifiedVoiceScreeningCall</code> - Production-ready screening component</li>
                  </ul>
                </li>
                <li>
                  <strong>Utilities</strong>
                  <ul>
                    <li><code>trackCallAnalytics</code> - Track usage data for future improvement</li>
                  </ul>
                </li>
              </ul>

              <h3>Usage Examples</h3>
              <pre><code>{`// Initialize the SDK
const status = initVapiScreening();

// Basic call data retrieval
const callData = await getCallData('call-123');

// Enhanced call data retrieval
const enhancedData = await retrieveCallDataWithRetry('call-123', 5);

// Generate insights from call data
const insights = generateEnhancedAnalysis(callData);

// Get comprehensive call analysis
const analysis = await analyzeScreeningCall('call-123');

// Get call audio links
const audioLinks = await getCallAudioLinks('call-123');

// Get enhanced screening summary with all details
const screeningSummary = await getEnhancedScreeningSummary('call-123');`}</code></pre>

              <p className="text-sm text-gray-500 mt-8">
                For more detailed documentation, see 
                <a href="/ENHANCED_SCREENING_GUIDE.md" className="text-blue-600 hover:text-blue-800 ml-1" target="_blank">
                  Enhanced Screening Guide
                </a> and 
                <a href="/ENHANCED_IMPLEMENTATION_SUMMARY.md" className="text-blue-600 hover:text-blue-800 ml-1" target="_blank">
                  Implementation Summary
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
