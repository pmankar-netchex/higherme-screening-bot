import Link from 'next/link';
import { getAllApplications } from '../../../lib/servers/applications-server';
import { getAllCandidates } from '../../../lib/servers/candidates-server';
import { getAllJobs } from '../../../lib/servers/jobs-server';
import ApplicantList from '../../../components/features/recruitment/ApplicantList';
import ExportData from '../../../components/features/recruitment/ExportData';
import { JobApplication } from '../../../lib/types';

export default async function ApplicationsPage() {
  const applications = await getAllApplications();
  const candidates = await getAllCandidates();
  const jobs = await getAllJobs();
  

  
  // Transform applications to JobApplication type by adding the missing properties and ensuring type compatibility
  const jobApplications: JobApplication[] = applications.map(app => {
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
      timeline: app.timeline.map(entry => {
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
