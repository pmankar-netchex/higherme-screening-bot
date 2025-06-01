'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedVoiceScreeningCall } from '../../../components/features/screening';
import { Job, Candidate } from '../../../lib/types';

interface ScreeningPageProps {
  params: { 
    screeningId: string;
  }
}

export default function ScreeningPage({ params }: ScreeningPageProps) {
  const router = useRouter();
  const { screeningId } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [screeningData, setScreeningData] = useState<{
    jobId: string;
    candidateId: string;
    applicationId: string;
    job?: Job;
    candidate?: Candidate;
    status?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callCompleted, setCallCompleted] = useState(false);
  
  // Fetch screening data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch screening details using the details API
        const response = await fetch(`/api/screening/details?id=${screeningId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.screening) {
          throw new Error('Screening data not found');
        }
        
        // Extract required data for the screening component
        const screeningData = {
          jobId: data.screening.jobId,
          candidateId: data.screening.candidateId,
          applicationId: data.screening.applicationId,
          status: data.screening.status,
          job: data.job,
          candidate: data.candidate
        };
        
        setScreeningData(screeningData);
      } catch (err: any) {
        console.error('Error fetching screening data:', err);
        setError(err.message || 'Failed to load screening data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [screeningId]);
  
  const handleCallEnd = useCallback(async (data: any) => {
    console.log('Call ended with data:', data);
    setCallCompleted(true);
    
    try {
      // Update the screening status via the API
      await fetch(`/api/screening/${screeningId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'screening_completed',
          completedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to update screening status:', error);
    }
    
    // Redirect to results page after a short delay
    setTimeout(() => {
      router.push(`/screening/results/${screeningId}`);
    }, 3000);
  }, [screeningId, router]);
  
  const handleCallError = useCallback(async (error: Error) => {
    console.error('Call error:', error);
    setError(error.message);
    
    try {
      // Update the screening status to indicate failure
      await fetch(`/api/screening/${screeningId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          errorMessage: error.message,
          updatedAt: new Date().toISOString()
        })
      });
    } catch (updateError) {
      console.error('Failed to update screening status with error:', updateError);
    }
  }, [screeningId]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-lg">Loading screening details...</p>
      </div>
    );
  }
  
  if (error || !screeningData) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error || 'Failed to load screening data'}</p>
          <button 
            onClick={() => router.refresh()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Voice Screening: {screeningData.job?.title}</h1>
      
      {/* Candidate and job information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Candidate</h2>
          {screeningData.candidate && (
            <>
              <p className="mb-1">
                <span className="font-medium">Name:</span> {screeningData.candidate.firstName} {screeningData.candidate.lastName}
              </p>
              <p className="mb-1">
                <span className="font-medium">Email:</span> {screeningData.candidate.email}
              </p>
              <p className="mb-1">
                <span className="font-medium">Phone:</span> {screeningData.candidate.phone}
              </p>
            </>
          )}
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Job</h2>
          {screeningData.job && (
            <>
              <p className="mb-1">
                <span className="font-medium">Title:</span> {screeningData.job.title}
              </p>
              <p className="mb-1">
                <span className="font-medium">Department:</span> {screeningData.job.department}
              </p>
              <p className="mb-1">
                <span className="font-medium">Requirements:</span> {screeningData.job.requirements}
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Show different content based on screening status */}
      {screeningData.status === 'screening_completed' || screeningData.status === 'completed' ? (
        <div className="p-4 mb-8 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Screening Already Completed</h2>
          <p>This screening has already been completed.</p>
          <div className="mt-4">
            <button
              onClick={() => router.push(`/screening/results/${screeningId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Results
            </button>
          </div>
        </div>
      ) : screeningData.status === 'rejected' || screeningData.status === 'failed' ? (
        <div className="p-4 mb-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Screening Failed</h2>
          <p>This screening has encountered an error and could not be completed.</p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        /* Voice screening call component */
        <div className="mb-8">
          <UnifiedVoiceScreeningCall
            jobId={screeningData.jobId}
            candidateId={screeningData.candidateId}
            applicationId={screeningData.applicationId}
            job={screeningData.job}
            candidate={screeningData.candidate}
            onCallEnd={handleCallEnd}
            onCallError={handleCallError}
            autoRetry={true}
            maxRetryAttempts={3}
          />
        </div>
      )}
      
      {/* Call completion notification */}
      {callCompleted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Call Completed</h2>
          <p>The screening call has been completed and the results have been saved.</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to results page...</p>
        </div>
      )}
    </div>
  );
}
