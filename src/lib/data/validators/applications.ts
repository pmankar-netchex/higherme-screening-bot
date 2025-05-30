import fs from 'fs';
import path from 'path';

// Types for application workflow
export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  currentStep: ApplicationStep;
  timeline: ApplicationTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'submitted' 
  | 'screening_scheduled' 
  | 'screening_in_progress' 
  | 'screening_completed' 
  | 'under_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'reference_check'
  | 'offer_pending'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type ApplicationStep = 
  | 'application_submitted'
  | 'resume_uploaded'
  | 'screening_call_pending'
  | 'screening_call_completed'
  | 'recruiter_review'
  | 'hiring_decision'
  | 'process_complete';

export interface ApplicationTimelineEntry {
  step: ApplicationStep;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  timestamp: string;
  notes?: string;
  performedBy?: 'system' | 'candidate' | 'recruiter' | 'admin';
}

const APPLICATIONS_FILE_PATH = path.join(process.cwd(), 'data', 'applications.json');

// Ensure data directory and file exist
const ensureApplicationsFile = () => {
  const dataDir = path.dirname(APPLICATIONS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(APPLICATIONS_FILE_PATH)) {
    fs.writeFileSync(APPLICATIONS_FILE_PATH, '[]', 'utf8');
  }
};

// Read all applications
export const getAllApplications = (): Application[] => {
  try {
    ensureApplicationsFile();
    const data = fs.readFileSync(APPLICATIONS_FILE_PATH, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading applications:', error);
    return [];
  }
};

// Get application by ID
export const getApplicationById = (id: string): Application | null => {
  const applications = getAllApplications();
  return applications.find(app => app.id === id) || null;
};

// Get application by candidate ID
export const getApplicationByCandidateId = (candidateId: string): Application | null => {
  const applications = getAllApplications();
  return applications.find(app => app.candidateId === candidateId) || null;
};

// Get applications by job ID
export const getApplicationsByJobId = (jobId: string): Application[] => {
  return getAllApplications().filter(app => app.jobId === jobId);
};

// Create new application
export const createApplication = (candidateId: string, jobId: string): Application => {
  const applications = getAllApplications();
  const initialTimeline: ApplicationTimelineEntry = {
    step: 'application_submitted',
    status: 'completed',
    timestamp: new Date().toISOString(),
    performedBy: 'candidate'
  };

  const newApplication: Application = {
    id: `app-${Date.now()}`,
    candidateId,
    jobId,
    status: 'submitted',
    currentStep: 'resume_uploaded',
    timeline: [initialTimeline],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  applications.push(newApplication);
  fs.writeFileSync(APPLICATIONS_FILE_PATH, JSON.stringify(applications, null, 2), 'utf8');
  return newApplication;
};

// Update application status and advance workflow
export const updateApplicationStatus = (
  id: string, 
  newStatus: ApplicationStatus, 
  newStep?: ApplicationStep,
  notes?: string,
  performedBy: 'system' | 'candidate' | 'recruiter' | 'admin' = 'system'
): Application | null => {
  const applications = getAllApplications();
  const appIndex = applications.findIndex(app => app.id === id);
  
  if (appIndex === -1) {
    return null;
  }

  const application = applications[appIndex];
  const timelineEntry: ApplicationTimelineEntry = {
    step: newStep || application.currentStep,
    status: 'completed',
    timestamp: new Date().toISOString(),
    notes,
    performedBy
  };

  applications[appIndex] = {
    ...application,
    status: newStatus,
    currentStep: newStep || application.currentStep,
    timeline: [...application.timeline, timelineEntry],
    updatedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(APPLICATIONS_FILE_PATH, JSON.stringify(applications, null, 2), 'utf8');
  return applications[appIndex];
};

// Advance to next step in workflow
export const advanceApplicationStep = (
  id: string, 
  notes?: string,
  performedBy: 'system' | 'candidate' | 'recruiter' | 'admin' = 'system'
): Application | null => {
  const application = getApplicationById(id);
  if (!application) return null;

  const stepFlow: Record<ApplicationStep, { nextStep: ApplicationStep; status: ApplicationStatus }> = {
    'application_submitted': { 
      nextStep: 'resume_uploaded', 
      status: 'submitted' 
    },
    'resume_uploaded': { 
      nextStep: 'screening_call_pending', 
      status: 'screening_scheduled' 
    },
    'screening_call_pending': { 
      nextStep: 'screening_call_completed', 
      status: 'screening_in_progress' 
    },
    'screening_call_completed': { 
      nextStep: 'recruiter_review', 
      status: 'under_review' 
    },
    'recruiter_review': { 
      nextStep: 'hiring_decision', 
      status: 'under_review' 
    },
    'hiring_decision': { 
      nextStep: 'process_complete', 
      status: 'hired' // This will be overridden based on actual decision
    },
    'process_complete': { 
      nextStep: 'process_complete', 
      status: application.status // No change
    }
  };

  const nextFlow = stepFlow[application.currentStep];
  if (!nextFlow) return null;

  return updateApplicationStatus(
    id, 
    nextFlow.status, 
    nextFlow.nextStep, 
    notes, 
    performedBy
  );
};

// Get applications by status
export const getApplicationsByStatus = (status: ApplicationStatus): Application[] => {
  return getAllApplications().filter(app => app.status === status);
};

// Get applications pending screening
export const getApplicationsPendingScreening = (): Application[] => {
  return getAllApplications().filter(app => 
    app.currentStep === 'screening_call_pending' || 
    app.status === 'screening_scheduled'
  );
};

// Get applications ready for review
export const getApplicationsForReview = (): Application[] => {
  return getAllApplications().filter(app => 
    app.currentStep === 'recruiter_review' && 
    app.status === 'under_review'
  );
};

// Delete application
export const deleteApplication = (id: string): boolean => {
  const applications = getAllApplications();
  const initialLength = applications.length;
  const filteredApplications = applications.filter(app => app.id !== id);
  
  if (filteredApplications.length === initialLength) {
    return false; // Application not found
  }
  
  fs.writeFileSync(APPLICATIONS_FILE_PATH, JSON.stringify(filteredApplications, null, 2), 'utf8');
  return true;
};
