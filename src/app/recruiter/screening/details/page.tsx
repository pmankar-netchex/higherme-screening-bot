'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ScreeningCall, Candidate, Job } from '../../../../lib/types';

interface ScreeningDetailsData {
  screening: ScreeningCall;
  candidate: Candidate | null;
  job: Job | null;
}

function ScreeningDetailsContent() {
  const searchParams = useSearchParams();
  const screeningId = searchParams.get('id');
  
  const [data, setData] = useState<ScreeningDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!screeningId) {
      setError('Screening ID not provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/screening/details?id=${screeningId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load screening details');
          return;
        }
        
        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        setError('Failed to load screening details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [screeningId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'screening_completed':
        return 'bg-green-100 text-green-800';
      case 'screening_scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'screening_in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'text-gray-500';
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                  <p className="mt-2 text-gray-600">Loading screening details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/recruiter/screening" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Screening Dashboard
            </Link>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Screening</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Link href="/recruiter/screening" className="text-blue-600 hover:text-blue-800 font-medium">
                  Return to Screening Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { screening, candidate, job } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/recruiter/screening" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Screening Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Screening Details
            </h1>
            <p className="text-gray-600">
              Detailed information about the voice screening session
            </p>
          </div>

          {/* Screening Overview */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Screening Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Screening ID</h3>
                <p className="text-gray-900 font-mono text-sm">{screening.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(screening.status)}`}>
                  {screening.status.charAt(0).toUpperCase() + screening.status.slice(1)}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Scheduled</h3>
                <p className="text-gray-900">{formatDate(screening.scheduledAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                <p className="text-gray-900">{formatDate(screening.updatedAt)}</p>
              </div>
              {screening.score !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Score</h3>
                  <p className={`text-2xl font-bold ${getScoreColor(screening.score)}`}>
                    {screening.score}/10
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Information */}
          {candidate && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Name</h3>
                  <p className="text-gray-900">{candidate.firstName} {candidate.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
                  <p className="text-gray-900">{candidate.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
                  <p className="text-gray-900">{candidate.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Resume</h3>
                  <p className="text-gray-900">{candidate.resumeFileName || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Job Information */}
          {job && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Position Applied For</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Job Title</h3>
                  <p className="text-gray-900">{job.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Department</h3>
                  <p className="text-gray-900">{job.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Hourly Rate</h3>
                  <p className="text-gray-900">{job.hourlyRate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Weekend Required</h3>
                  <p className="text-gray-900">{job.weekendRequired ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Screening Results */}
          {screening.status === 'screening_completed' && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Screening Results</h2>
              
              {screening.transcript && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Transcript</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{screening.transcript}</p>
                  </div>
                </div>
              )}

              {screening.audioUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Audio Recording</h3>
                  <audio controls className="w-full">
                    <source src={screening.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {screening.aiEvaluation && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">AI Evaluation</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700">{screening.aiEvaluation}</p>
                  </div>
                </div>
              )}

              {screening.aiRecommendations && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">AI Recommendations</h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-gray-700">{screening.aiRecommendations}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Information */}
          {screening.status === 'rejected' && screening.errorMessage && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Error Details</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Screening Failed</h3>
                    <p className="text-red-700 mt-1">{screening.errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link 
                href={`/recruiter/candidate/${candidate?.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Full Candidate Profile
              </Link>
              {screening.status === 'rejected' && (
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                  Reschedule Screening
                </button>
              )}
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div 
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-gray-600">Loading screening details...</p>
        </div>
      </div>
    </div>
  );
}

export default function ScreeningDetailsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ScreeningDetailsContent />
    </Suspense>
  );
}
