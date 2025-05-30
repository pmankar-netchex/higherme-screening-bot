'use client';

import { useState } from 'react';
import { CandidateScreeningSummary } from '../../../../lib/types/candidate';

interface ScreeningSummaryProps {
  screeningSummary: CandidateScreeningSummary;
  candidateId: string;
}

export default function ScreeningSummary({ screeningSummary, candidateId }: ScreeningSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Screening Summary</h2>
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
        
        {screeningSummary.evaluations && screeningSummary.evaluations.availability ? (
          <div className="border rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Availability</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Morning Shift:</span> {' '}
                  {screeningSummary.evaluations.availability.morningShift ? '✅ Available' : '❌ Unavailable'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Evening Shift:</span> {' '}
                  {screeningSummary.evaluations.availability.eveningShift ? '✅ Available' : '❌ Unavailable'}
                </p>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Weekends:</span> {' '}
                  {screeningSummary.evaluations.availability.weekendAvailable ? '✅ Available' : '❌ Unavailable'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Transportation:</span> {' '}
                  {screeningSummary.evaluations.availability.transportation ? '✅ Available' : '❌ Unavailable'}
                </p>
              </div>
            </div>
            {screeningSummary.evaluations.availability.notes && (
              <div className="mt-2 text-sm text-gray-700">
                <p>{screeningSummary.evaluations.availability.notes}</p>
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
