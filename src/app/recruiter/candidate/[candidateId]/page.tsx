'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import CandidateDetails from '../../../../components/features/recruitment/CandidateDetails';
import { Candidate } from '../../../../lib/types/candidate';
import { JobApplication } from '../../../../lib/types/application';
import { Job } from '../../../../lib/types/job';

interface CandidatePageProps {
  params: { candidateId: string };
  searchParams: { jobId?: string; applicationId?: string };
}

export default function CandidatePage({ params, searchParams }: CandidatePageProps) {
  const [candidateData, setCandidateData] = useState<{
    candidate: Candidate;
    application: JobApplication;
    job: Job;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { candidateId } = params;
  const { applicationId } = searchParams;

  // Function to fetch and process data
  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch candidate
      const candidateResponse = await fetch(`/api/candidates/${candidateId}`);
      if (!candidateResponse.ok) {
        throw new Error('Candidate not found');
      }
      const candidate = await candidateResponse.json();

      // Fetch applications for candidate
      const applicationsResponse = await fetch(`/api/applications?candidateId=${candidateId}`);
      if (!applicationsResponse.ok) {
        throw new Error('Failed to fetch applications');
      }
      const applicationsData = await applicationsResponse.json();
      
      // Check if the response has the expected structure
      if (!applicationsData.success || !Array.isArray(applicationsData.applications)) {
        throw new Error('Invalid applications response format');
      }
      
      const applications = applicationsData.applications;
      
      // Get the specific application or the first one
      const application = applicationId 
        ? applications.find((app: JobApplication) => app.id === applicationId)
        : applications[0];

      if (!application) {
        throw new Error('Application not found');
      }

      // Fetch job data
      const jobResponse = await fetch(`/api/jobs/${application.jobId}`);
      if (!jobResponse.ok) {
        throw new Error('Job not found');
      }
      const job = await jobResponse.json();

      // Fetch screening data for this candidate
      const screeningsResponse = await fetch(`/api/screening?candidateId=${candidateId}`);
      if (!screeningsResponse.ok) {
        console.warn('Failed to fetch screening data');
      } else {
        const screeningsData = await screeningsResponse.json();
        
        // Handle different response formats
        const screenings = Array.isArray(screeningsData) ? screeningsData : 
                          (screeningsData.screenings || screeningsData.data || []);
        
        // Find the most recent completed screening or any screening data
        const latestScreening = screenings
          .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
          .find((s: any) => s.status === 'screening_completed' && s.summary) || 
          screenings.find((s: any) => s.status === 'completed' && s.summary);
        
        // Convert ScreeningSummary to CandidateScreeningSummary format if screening exists and has summary
        if (latestScreening?.summary) {
          const summary = latestScreening.summary;
          
          // Handle case where summary is a string (markdown) instead of structured object
          let parsedSummary;
          if (typeof summary === 'string') {
            // Create a basic structure from string summary
            parsedSummary = {
              experience: { highlights: [], evaluation: '' },
              availability: { morning: false, evening: false, weekends: false, notes: '' },
              transportation: { hasReliableTransportation: false, notes: '' },
              softSkills: { highlights: [], evaluation: '' },
              roleSpecific: { evaluation: '', strengths: [], areas_of_improvement: [] }
            };
          } else {
            parsedSummary = summary;
          }
          
          const candidateScreeningSummary = {
            callDuration: latestScreening.duration || 0,
            transcript: latestScreening.transcript,
            audioUrl: latestScreening.audioUrl,
            evaluations: {
              experience: {
                score: parsedSummary.experience?.highlights?.length > 2 ? 'Good' : 'Average',
                notes: parsedSummary.experience?.evaluation || ''
              },
              availability: {
                morningShift: parsedSummary.availability?.morning || false,
                eveningShift: parsedSummary.availability?.evening || false,
                weekendAvailable: parsedSummary.availability?.weekends || false,
                transportation: parsedSummary.transportation?.hasReliableTransportation || false,
                notes: parsedSummary.availability?.notes || ''
              },
              softSkills: {
                score: parsedSummary.softSkills?.highlights?.length > 2 ? 'Good' : 'Average',
                notes: parsedSummary.softSkills?.evaluation || ''
              }
            },
            roleSpecificAnswers: {
              'Role-specific evaluation': parsedSummary.roleSpecific?.evaluation || '',
              'Strengths': parsedSummary.roleSpecific?.strengths?.join(', ') || '',
              'Areas for improvement': parsedSummary.roleSpecific?.areas_of_improvement?.join(', ') || ''
            },
            overallSummary: typeof summary === 'string' ? summary : `${parsedSummary.experience?.evaluation || ''} ${parsedSummary.softSkills?.evaluation || ''}`.trim(),
            recommendedNextSteps: (parsedSummary.roleSpecific?.strengths?.length || 0) > (parsedSummary.roleSpecific?.areas_of_improvement?.length || 0) ? 
              'Recommended for further consideration' : 'Review additional qualifications',
            completedAt: latestScreening.completedAt || new Date().toISOString(),
            overallScore: 7.5,
            recommendation: 'maybe' as const,
            aiSummary: typeof summary === 'string' ? summary : JSON.stringify(parsedSummary),
            strengths: parsedSummary.roleSpecific?.strengths || [],
            concerns: parsedSummary.roleSpecific?.areas_of_improvement || []
          };

          // Merge screening data into candidate object
          candidate.screeningCompleted = true;
          candidate.screeningSummary = candidateScreeningSummary;
        }
      }

      setCandidateData({
        candidate,
        application,
        job
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [candidateId, applicationId]);

  // Function to refresh screening results
  const refreshScreeningResults = async () => {
    setRefreshing(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const previousScreeningStatus = candidateData?.candidate.screeningCompleted;
      
      // Force refetch all data to get the latest screening information
      await fetchData();
      
      // Check if we found new screening data
      const newScreeningStatus = candidateData?.candidate.screeningCompleted;
      
      if (!previousScreeningStatus && newScreeningStatus) {
        setSuccessMessage('New screening results found and loaded successfully!');
      } else if (newScreeningStatus) {
        setSuccessMessage('Screening data refreshed successfully.');
      } else {
        setSuccessMessage('No new screening results found. The candidate may not have completed screening yet.');
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh screening data');
      console.error('Error refreshing screening data:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Loading candidate data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidateData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Candidate not found'}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <CandidateDetails
          candidate={candidateData.candidate}
          application={candidateData.application}
          job={candidateData.job}
          onRefreshScreening={refreshScreeningResults}
          refreshing={refreshing}
        />
      </div>
    </div>
  );
}