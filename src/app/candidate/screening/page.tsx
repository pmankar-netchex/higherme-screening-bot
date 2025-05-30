'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VoiceScreeningCall from '@/components/features/screening/VoiceScreeningCall';
import { Job, Candidate, ScreeningSummary } from '@/lib/types';
import Link from 'next/link';

// Content component that uses search params
function ScreeningPageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '';
  const candidateId = searchParams.get('candidateId') || '';
  const applicationId = searchParams.get('applicationId') || '';
  
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callComplete, setCallComplete] = useState<boolean>(false);
  const [callError, setCallError] = useState<Error | null>(null);
  const [callSummary, setCallSummary] = useState<ScreeningSummary | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  
  // Fetch job and candidate data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch job data
        if (jobId) {
          const jobResponse = await fetch(`/api/jobs/${jobId}`);
          if (jobResponse.ok) {
            const jobData = await jobResponse.json();
            setJob(jobData);
          } else {
            setError('Failed to load job information');
            return;
          }
        }

        // Fetch candidate data
        if (candidateId) {
          const candidateResponse = await fetch(`/api/candidates/${candidateId}`);
          if (candidateResponse.ok) {
            const candidateData = await candidateResponse.json();
            setCandidate(candidateData);
          } else {
            setError('Failed to load candidate information');
            return;
          }
        }
      } catch (err) {
        setError('An error occurred while loading data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId || candidateId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [jobId, candidateId]);
  
  // Handle call events
  const handleCallStart = () => {
    console.log('Screening call started');
    // Here you would update the application status in a real app
  };
  
  const handleCallEnd = (summary?: any) => {
    console.log('Screening call ended', summary);
    setCallComplete(true);
    
    // Always navigate to the completed state
    // This ensures that even if the summary is not available, the user still sees the completion screen
    // And can provide feedback
    
    // Extract and set the summary if available
    if (summary?.summary) {
      try {
        // In a real implementation, we'd handle parsing summary here or use the parsed version
        setCallSummary(summary.parsedSummary || null);
      } catch (error) {
        console.error('Error processing summary:', error);
      }
    }
    
    // Scroll to the top to show the completion message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCallError = (error: Error) => {
    console.error('Call error:', error);
    setCallError(error);
  };
  
  // Handle candidate feedback submission
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we'd send this feedback to the server
    console.log('Feedback submitted:', { 
      rating: feedbackRating, 
      comment: feedbackComment,
      candidateId,
      jobId,
      applicationId
    });
    setFeedbackSubmitted(true);
  };

  // Missing parameters
  if (!jobId || !candidateId || !applicationId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Missing Information</h1>
          <p className="text-gray-600 mb-6">
            Required parameters are missing. Please make sure you access this page through the proper application process.
          </p>
          <Link 
            href="/candidate"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Job Listings
          </Link>
        </div>
      </div>
    );
  }
  
  // Job or candidate not found
  if (!job || !candidate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Information Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the job or candidate information. Please return to the job listings and try again.
          </p>
          <Link 
            href="/candidate"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Job Listings
          </Link>
        </div>
      </div>
    );
  }
  
  // Call complete view with feedback form
  if (callComplete && !feedbackSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Screening Complete!</h1>
            <p className="text-gray-600 mb-2">
              Thank you for completing your AI screening call for the {job.title} position.
              Our recruiting team will review your application and reach out to you soon.
            </p>
          </div>
          
          {/* Feedback Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How was your screening experience?</h2>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Rate your experience:</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFeedbackRating(rating)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        feedbackRating >= rating ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="feedback" className="block text-gray-700 mb-2">
                  Additional comments (optional):
                </label>
                <textarea
                  id="feedback"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Share your thoughts about the screening experience..."
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit Feedback
                </button>
                
                <Link 
                  href="/candidate"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Skip
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  // Feedback submitted - thank you page
  if (feedbackSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted. We appreciate your input on our screening process.
          </p>
          <Link 
            href="/candidate"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  // Main screening call view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Link href={`/candidate/apply/${jobId}`} className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Application
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Screening Interview</h1>
              <p className="text-gray-600">
                {job.title} position screening for {candidate.firstName} {candidate.lastName}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === 'active' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {job.status === 'active' ? 'Active Position' : 'Position Closed'}
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How it works:
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 pl-4">
              <li>Click "Start Screening Call" when you're ready</li>
              <li>The AI assistant will ask you questions about your experience and availability</li>
              <li>Answer naturally as you would in a phone interview</li>
              <li>The call will take approximately 2-3 minutes to complete</li>
              <li>The call will end automatically when all questions are answered</li>
              <li>You can also click the "End Call" button at any time if needed</li>
              <li>Make sure you're in a quiet environment with a stable internet connection</li>
            </ol>
          </div>
        </div>
        
        <VoiceScreeningCall
          jobId={jobId}
          candidateId={candidateId}
          applicationId={applicationId}
          job={job}
          candidate={candidate}
          onCallStart={handleCallStart}
          onCallEnd={handleCallEnd}
          onCallError={handleCallError}
        />
      </div>
    </div>
  );
}

// Export the page component wrapped in Suspense
export default function ScreeningPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading screening session...</div>}>
      <ScreeningPageContent />
    </Suspense>
  );
}
