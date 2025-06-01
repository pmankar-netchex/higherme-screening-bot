'use client';

import { useState } from 'react';
import { CandidateScreeningSummary } from '../../../lib/types/candidate';

interface ScreeningSummaryProps {
  screeningSummary: CandidateScreeningSummary;
  candidateId: string;
  onRefreshScreening?: () => Promise<void>;
  refreshing?: boolean;
}

export default function ScreeningSummary({ screeningSummary, candidateId, onRefreshScreening, refreshing = false }: ScreeningSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to parse availability from overall summary text as fallback
  const parseAvailabilityFromText = (text: string) => {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    return {
      morningShift: lowerText.includes('morning') && !lowerText.includes('not available morning'),
      eveningShift: lowerText.includes('evening') && !lowerText.includes('not available evening'),
      weekendAvailable: lowerText.includes('weekend') && !lowerText.includes('not available weekend'),
      transportation: lowerText.includes('vehicle') || lowerText.includes('transportation') || lowerText.includes('own car')
    };
  };

  // Get availability data with fallback parsing
  const getAvailabilityData = () => {
    const structuredAvailability = screeningSummary.evaluations?.availability;
    
    // If structured data exists and has at least one true value, use it
    if (structuredAvailability && 
        (structuredAvailability.morningShift || 
         structuredAvailability.eveningShift || 
         structuredAvailability.weekendAvailable || 
         structuredAvailability.transportation)) {
      return structuredAvailability;
    }
    
    // Otherwise, try to parse from text summary as fallback
    const parsedFromText = parseAvailabilityFromText(screeningSummary.overallSummary);
    if (parsedFromText) {
      return {
        ...structuredAvailability,
        ...parsedFromText,
        notes: structuredAvailability?.notes || 'Parsed from summary text'
      };
    }
    
    return structuredAvailability;
  };

  // Helper to render appropriate badge color based on score
  const getScoreColor = (score: string) => {
    switch (score) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const availabilityData = getAvailabilityData();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Screening Summary</h2>
        {onRefreshScreening && (
          <button
            onClick={onRefreshScreening}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Fetch Latest Results
              </>
            )}
          </button>
        )}
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-900 mb-2">Overall Summary</h3>
          <p className="text-gray-700">{screeningSummary.overallSummary}</p>
        </div>
        
        {screeningSummary.evaluations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {screeningSummary.evaluations.experience ? (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Experience</h4>
                <div className="mb-2 flex items-center">
                  <div className="font-medium mr-2">Score:</div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(screeningSummary.evaluations.experience.score)}`}>
                    {screeningSummary.evaluations.experience.score}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{screeningSummary.evaluations.experience.notes}</p>
              </div>
            ) : null}
            
            {screeningSummary.evaluations.softSkills ? (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Soft Skills</h4>
                <div className="mb-2 flex items-center">
                  <div className="font-medium mr-2">Score:</div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(screeningSummary.evaluations.softSkills.score)}`}>
                    {screeningSummary.evaluations.softSkills.score}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{screeningSummary.evaluations.softSkills.notes}</p>
              </div>
            ) : null}
          </div>
        ) : null}
        
        {availabilityData ? (
          <div className="border rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Availability</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Morning Shift:</span> {' '}
                  {availabilityData.morningShift ? '✅ Available' : '❌ Unavailable'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Evening Shift:</span> {' '}
                  {availabilityData.eveningShift ? '✅ Available' : '❌ Unavailable'}
                </p>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Weekends:</span> {' '}
                  {availabilityData.weekendAvailable ? '✅ Available' : '❌ Unavailable'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Transportation:</span> {' '}
                  {availabilityData.transportation ? '✅ Available' : '❌ Unavailable'}
                </p>
              </div>
            </div>
            {availabilityData.notes && (
              <div className="mt-2 text-sm text-gray-700">
                <p>{availabilityData.notes}</p>
              </div>
            )}
          </div>
        ) : null}
        
        {/* Role-specific answers - show only when expanded */}
        {screeningSummary.roleSpecificAnswers && Object.keys(screeningSummary.roleSpecificAnswers).length > 0 ? (
          <>
            <div className="mb-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <span>Role-Specific Responses</span>
                <svg 
                  className={`w-5 h-5 transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isExpanded && (
                <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                  {Object.entries(screeningSummary.roleSpecificAnswers).map(([question, answer], index) => (
                    <div key={index} className={index > 0 ? 'mt-3 pt-3 border-t border-gray-200' : ''}>
                      <p className="text-sm font-medium text-gray-700">{question}</p>
                      <p className="mt-1 text-sm text-gray-600">{String(answer)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
        
        {screeningSummary.recommendedNextSteps && (
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">Recommended Next Steps</h3>
            <p className="text-gray-700">{screeningSummary.recommendedNextSteps}</p>
          </div>
        )}
        
        {screeningSummary.audioUrl && (
          <div className="mb-4 border rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">Screening Recording</h3>
            <div className="flex items-center">
              <audio 
                controls
                src={screeningSummary.audioUrl}
                className="w-full"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}
        
        <div className="mt-6 border-t pt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Screening completed on: {screeningSummary.completedAt ? new Date(screeningSummary.completedAt).toLocaleString() : 'N/A'}
          </div>
          
          <button 
            onClick={() => window.open(`/recruiter/screening/${candidateId}`, '_blank')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Full Screening Results
          </button>
        </div>
      </div>
    </div>
  );
}
