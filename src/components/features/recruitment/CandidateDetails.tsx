'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Candidate } from '../../../lib/types';
import type { JobApplication, ApplicationTimelineEntry, ApplicationStatus } from '../../../lib/types';
import type { Job } from '../../../lib/types';
import type { ScreeningSummary as LegacyScreeningSummary } from '../../../lib/types/candidates';
import { getStatusDisplayInfo, getStatusBadgeClasses, getNextPossibleStatuses } from '../../../lib/utils/statusManager';
import RecruiterNotes from './RecruiterNotes';
import ScreeningSummary from './ScreeningSummary';

interface CandidateDetailsProps {
  candidate: Candidate;
  application: JobApplication;
  job: Job;
  onRefreshScreening?: () => Promise<void>;
  refreshing?: boolean;
}

export default function CandidateDetails({ candidate, application, job, onRefreshScreening, refreshing = false }: CandidateDetailsProps) {
  const [currentStatus, setCurrentStatus] = useState(application.status);
  
  // Convert CandidateScreeningSummary to legacy ScreeningSummary format
  const convertScreeningSummary = (summary: typeof candidate.screeningSummary): LegacyScreeningSummary | undefined => {
    if (!summary) return undefined;
    
    return {
      callDuration: summary.callDuration,
      transcript: summary.transcript,
      audioUrl: summary.audioUrl,
      evaluations: summary.evaluations,
      roleSpecificAnswers: summary.roleSpecificAnswers,
      overallSummary: summary.overallSummary,
      recommendedNextSteps: summary.recommendedNextSteps,
      completedAt: summary.completedAt,
      overallScore: summary.overallScore,
      recommendation: summary.recommendation,
      aiSummary: summary.aiSummary,
      concerns: summary.concerns,
      strengths: summary.strengths,
      improvementAreas: summary.concerns, // Map concerns to improvementAreas
    };
  };
  
  // Format application timeline for display
  const formattedTimeline = [...application.timeline].sort((a, b) => {
    if (!b.timestamp || !a.timestamp) return 0;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Handle saving recruiter notes
  const handleSaveNotes = async (notes: string) => {
    const response = await fetch(`/api/candidates/${candidate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recruiterNotes: notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to save notes');
    }

    const data = await response.json();
    return data;
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      // 1. Update application status
      const appResponse = await fetch(`/api/applications/${application.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!appResponse.ok) {
        throw new Error('Failed to update application status');
      }

      // 2. Update candidate status
      const candResponse = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!candResponse.ok) {
        throw new Error('Failed to update candidate status');
      }

      // 3. Update local state
      setCurrentStatus(newStatus as JobApplication['status']);

      // 4. Show success message
      alert(`Status updated to ${newStatus.replace(/_/g, ' ')}`);

    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  return (
    <div>
      {/* Header with breadcrumb navigation */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/recruiter" className="hover:text-blue-600">Dashboard</Link>
          <span>→</span>
          <Link href="/recruiter/applications" className="hover:text-blue-600">Applications</Link>
          <span>→</span>
          <span className="text-gray-900">Candidate Details</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {candidate.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {candidate.phone}
              </p>
              <div className="flex items-center">
                <span className="font-medium text-gray-600 mr-2">Status:</span>
                <span className={getStatusBadgeClasses(currentStatus)}>
                  {getStatusDisplayInfo(currentStatus).label}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Candidate
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Application
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content - 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Application Details</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Position</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold">{job.title}</p>
                  <p className="text-gray-500">{job.department}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job.hourlyRate || 'Competitive salary'}
                    </span>
                  </div>
                </div>
              </div>
            
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Resume</h3>
                {candidate.resumeUrl ? (
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{candidate.resumeFileName || "Resume.pdf"}</p>
                      <div className="mt-1 flex">
                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-500 mr-4">
                          View
                        </a>
                        <a href={candidate.resumeUrl} download className="text-sm text-blue-600 hover:text-blue-500">
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No resume uploaded</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Screening summary (if completed) */}
          {candidate.screeningCompleted && candidate.screeningSummary && (
            <ScreeningSummary 
              screeningSummary={candidate.screeningSummary}
              candidateId={candidate.id}
            />
          )}
          
          {/* Recruiter notes section with edit capability */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Recruiter Notes</h2>
            </div>
            <div className="p-6">
              <RecruiterNotes
                candidateId={candidate.id}
                initialNotes={candidate.recruiterNotes}
                onSave={handleSaveNotes}
              />
            </div>
          </div>
        </div>
        
        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Application status card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Application Status</h2>
            </div>
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-700 font-medium">Current Status:</span>
                <span className={getStatusBadgeClasses(currentStatus)}>
                  {getStatusDisplayInfo(currentStatus).label}
                </span>
              </div>
              
              <div className="my-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Update Status:</h3>
                <div className="flex flex-col space-y-2">
                  {getNextPossibleStatuses(currentStatus).map((status) => {
                    const statusInfo = getStatusDisplayInfo(status);
                    const buttonClass = status === 'hired' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                                      status === 'rejected' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                                      status === 'withdrawn' ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500' :
                                      status === 'interview_scheduled' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' :
                                      'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
                    
                    return (
                      <button 
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        className={`w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${buttonClass} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                      >
                        {statusInfo.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Application Timeline */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Application Timeline</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {formattedTimeline.map((event: ApplicationTimelineEntry, idx: number) => (
                    <li key={idx}>
                      <div className="relative pb-8">
                        {idx !== formattedTimeline.length - 1 && (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        )}
                        <div className="relative flex items-center space-x-3">
                          <div>
                            <div className={`relative px-1 bg-white border-2 rounded-full w-10 h-10 flex items-center justify-center ${
                              event.status === 'completed' ? 'bg-green-100' : 
                              event.status === 'in_progress' ? 'bg-yellow-100' : 
                              event.status === 'failed' ? 'bg-red-100' : 
                              'bg-blue-100'
                            }`}>
                              <svg className={`h-6 w-6 ${
                                event.status === 'completed' ? 'text-green-600' : 
                                event.status === 'in_progress' ? 'text-yellow-600' : 
                                event.status === 'failed' ? 'text-red-600' : 
                                'text-blue-600'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {event.status === 'completed' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                ) : event.status === 'in_progress' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                ) : event.status === 'failed' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {event.status.replace(/_/g, ' ')}
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'No timestamp'}
                              </p>
                            </div>
                            {event.note && (
                              <div className="mt-2 text-sm text-gray-700">
                                <p>{event.note}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
