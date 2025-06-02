'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ApplicantList from '../../../components/features/recruitment/ApplicantList';
import ExportData from '../../../components/features/recruitment/ExportData';
import { JobApplication, Candidate, Job } from '../../../lib/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [applicationsRes, candidatesRes, jobsRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/candidates'),
          fetch('/api/jobs')
        ]);

        if (!applicationsRes.ok || !candidatesRes.ok || !jobsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [applicationsData, candidatesData, jobsData] = await Promise.all([
          applicationsRes.json(),
          candidatesRes.json(),
          jobsRes.json()
        ]);

        setApplications(applicationsData.applications || applicationsData);
        setCandidates(candidatesData);
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Transform applications to JobApplication type by adding the missing properties and ensuring type compatibility
  const jobApplications: JobApplication[] = applications.map((app: any) => {
    // Filter the status to ensure it's compatible with JobApplication.status
    let status = app.status;
    if (status === 'reference_check' || status === 'offer_pending') {
      status = 'under_review'; // Map to compatible status
    }
    
    return {
      id: app.id,
      jobId: app.jobId,
      candidateId: app.candidateId,
      status: status as any,
      currentStep: app.currentStep,
      submittedAt: app.createdAt || new Date().toISOString(),
      timeline: app.timeline.map((entry: any) => {
        // Map 'skipped' status to 'failed' which is compatible with TimelineEntry
        let entryStatus: 'pending' | 'in_progress' | 'completed' | 'failed' = 
          entry.status === 'skipped' ? 'failed' : entry.status as any;
        
        return {
          step: entry.step,
          status: entryStatus,
          timestamp: entry.timestamp, 
          notes: entry.notes || '',
          completedBy: entry.performedBy || 'system'
        };
      }),
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      feedback: {}
    } as JobApplication;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link href="/recruiter" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              All Applications
            </h1>
            <p className="text-gray-600">
              View and manage all candidate applications
            </p>
          </div>
          <div>
            <ExportData
              candidates={candidates}
              applications={jobApplications}
              jobs={jobs}
              buttonText="Export Candidates"
              variant="primary"
              className="mt-6"
            />
          </div>
        </div>

        {/* Applicant List Component */}
        <ApplicantList 
          applications={jobApplications}
          candidates={candidates}
          jobs={jobs}
          showJobInfo={true}
        />
      </div>
    </div>
  );
}
