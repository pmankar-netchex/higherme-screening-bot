// Server-side only data utilities for applications
import fs from 'fs';
import path from 'path';
import type { Application, ApplicationStatus, ApplicationStep, ApplicationTimelineEntry } from '../types/applications';

// Data file path
const APPLICATIONS_FILE = path.join(process.cwd(), 'data', 'applications.json');

// Mock data for development
const mockApplications: Application[] = [
  {
    id: 'app-001',
    candidateId: 'candidate-001',
    jobId: 'job-001',
    status: 'screening_completed',
    currentStep: 'screening_call_completed',
    timeline: [
      {
        step: 'application_submitted',
        status: 'completed',
        timestamp: '2024-01-15T10:30:00Z',
        notes: 'Application received via job board'
      },
      {
        step: 'resume_review',
        status: 'completed',
        timestamp: '2024-01-15T11:00:00Z',
        notes: 'Resume reviewed and approved',
        performedBy: 'recruiter'
      },
      {
        step: 'screening_call_completed',
        status: 'completed',
        timestamp: '2024-01-15T14:30:00Z',
        notes: 'Screening call completed successfully',
        performedBy: 'system'
      },
      {
        step: 'interview_scheduled',
        status: 'pending',
        timestamp: '2024-01-15T14:35:00Z'
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'app-002',
    candidateId: 'candidate-002',
    jobId: 'job-002',
    status: 'screening_scheduled',
    currentStep: 'screening_call_pending',
    timeline: [
      {
        step: 'application_submitted',
        status: 'completed',
        timestamp: '2024-01-16T09:15:00Z',
        notes: 'Application received'
      },
      {
        step: 'resume_review',
        status: 'completed',
        timestamp: '2024-01-16T10:00:00Z',
        notes: 'Resume approved for screening',
        performedBy: 'recruiter'
      },
      {
        step: 'screening_call_pending',
        status: 'in_progress',
        timestamp: '2024-01-16T10:30:00Z',
        notes: 'Screening call link sent to candidate'
      }
    ],
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  }
];

// Helper function to ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Helper function to read applications from file
function readApplicationsFromFile(): Application[] {
  try {
    ensureDataDirectory();
    if (fs.existsSync(APPLICATIONS_FILE)) {
      const data = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
    // If file doesn't exist, create it with mock data
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(mockApplications, null, 2));
    return mockApplications;
  } catch (error) {
    console.error('Error reading applications file:', error);
    return mockApplications;
  }
}

// Helper function to write applications to file
function writeApplicationsToFile(applications: Application[]) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
  } catch (error) {
    console.error('Error writing applications file:', error);
  }
}

// Update application status and advance workflow
export function updateApplicationStatus(
  id: string, 
  newStatus: ApplicationStatus, 
  newStep?: ApplicationStep,
  notes?: string,
  completedBy: string = 'system'
): Application | null {
  const applications = readApplicationsFromFile();
  const appIndex = applications.findIndex(app => app.id === id);
  
  if (appIndex === -1) {
    return null;
  }

  const application = applications[appIndex];
  
  // Create a timeline entry for this status change
  const timelineEntry: ApplicationTimelineEntry = {
    step: newStep || application.currentStep,
    status: 'completed',
    timestamp: new Date().toISOString(),
    notes: notes,
    performedBy: completedBy
  };

  // Update the application with new status and step
  applications[appIndex] = {
    ...application,
    status: newStatus,
    currentStep: newStep || application.currentStep,
    timeline: [...application.timeline, timelineEntry],
    updatedAt: new Date().toISOString()
  };
  
  writeApplicationsToFile(applications);
  return applications[appIndex];
}

// Get all applications
export function getAllApplications(): Application[] {
  return readApplicationsFromFile();
}

// Get application by ID
export function getApplicationById(id: string): Application | null {
  const applications = readApplicationsFromFile();
  return applications.find(app => app.id === id) || null;
}

// Get applications by candidate ID
export function getApplicationsByCandidateId(candidateId: string): Application[] {
  const applications = readApplicationsFromFile();
  return applications.filter(app => app.candidateId === candidateId);
}

// Get applications by job ID
export function getApplicationsByJobId(jobId: string): Application[] {
  const applications = readApplicationsFromFile();
  return applications.filter(app => app.jobId === jobId);
}

// Add new application
export function addApplication(applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Application {
  const applications = readApplicationsFromFile();
  const newApplication: Application = {
    ...applicationData,
    id: `app-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  applications.push(newApplication);
  writeApplicationsToFile(applications);
  return newApplication;
}

// Update application
export function updateApplication(id: string, updates: Partial<Application>): Application | null {
  const applications = readApplicationsFromFile();
  const index = applications.findIndex(app => app.id === id);
  
  if (index === -1) {
    return null;
  }
  
  applications[index] = {
    ...applications[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  writeApplicationsToFile(applications);
  return applications[index];
}

// Delete application
export function deleteApplication(id: string): boolean {
  const applications = readApplicationsFromFile();
  const index = applications.findIndex(app => app.id === id);
  
  if (index === -1) {
    return false;
  }
  
  applications.splice(index, 1);
  writeApplicationsToFile(applications);
  return true;
}

// Update application step
export function updateApplicationStep(
  applicationId: string, 
  step: ApplicationStep,
  newStatus: ApplicationStatus, 
  notes?: string,
  completedBy?: string
): Application | null {
  const application = getApplicationById(applicationId);
  if (!application) {
    return null;
  }

  // Create new timeline entry
  const timelineEntry: ApplicationTimelineEntry = {
    step: step,
    status: 'completed',
    timestamp: new Date().toISOString(),
    notes: notes,
    performedBy: completedBy || 'system'
  };

  // Add to timeline
  application.timeline.push(timelineEntry);

  // Update current step and status
  application.currentStep = step;
  application.status = newStatus;

  return updateApplication(applicationId, application);
}

// Get applications with filters
export function getApplicationsWithFilters(filters: {
  jobId?: string;
  candidateId?: string;
  status?: ApplicationStatus;
  currentStep?: ApplicationStep;
}): Application[] {
  let applications = readApplicationsFromFile();
  
  if (filters.jobId) {
    applications = applications.filter(app => app.jobId === filters.jobId);
  }
  
  if (filters.candidateId) {
    applications = applications.filter(app => app.candidateId === filters.candidateId);
  }
  
  if (filters.status) {
    applications = applications.filter(app => app.status === filters.status);
  }
  
  if (filters.currentStep) {
    applications = applications.filter(app => app.currentStep === filters.currentStep);
  }
  
  return applications;
}

// Get application statistics
export function getApplicationStats() {
  const applications = readApplicationsFromFile();
  
  return {
    total: applications.length,
    byStatus: {
      submitted: applications.filter(app => app.status === 'submitted').length,
      screening_scheduled: applications.filter(app => app.status === 'screening_scheduled').length,
      screening_in_progress: applications.filter(app => app.status === 'screening_in_progress').length,
      screening_completed: applications.filter(app => app.status === 'screening_completed').length,
      under_review: applications.filter(app => app.status === 'under_review').length,
      interview_scheduled: applications.filter(app => app.status === 'interview_scheduled').length,
      interview_completed: applications.filter(app => app.status === 'interview_completed').length,
      reference_check: applications.filter(app => app.status === 'reference_check').length,
      offer_pending: applications.filter(app => app.status === 'offer_pending').length,
      hired: applications.filter(app => app.status === 'hired').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      withdrawn: applications.filter(app => app.status === 'withdrawn').length
    },
    byCurrentStep: {
      application_submitted: applications.filter(app => app.currentStep === 'application_submitted').length,
      resume_review: applications.filter(app => app.currentStep === 'resume_review').length,
      screening_call_pending: applications.filter(app => app.currentStep === 'screening_call_pending').length,
      screening_call_scheduled: applications.filter(app => app.currentStep === 'screening_call_scheduled').length,
      screening_call_completed: applications.filter(app => app.currentStep === 'screening_call_completed').length,
      interview_scheduled: applications.filter(app => app.currentStep === 'interview_scheduled').length,
      interview_completed: applications.filter(app => app.currentStep === 'interview_completed').length,
      reference_check: applications.filter(app => app.currentStep === 'reference_check').length,
      manager_review: applications.filter(app => app.currentStep === 'manager_review').length,
      offer_pending: applications.filter(app => app.currentStep === 'offer_pending').length,
      onboarding: applications.filter(app => app.currentStep === 'onboarding').length,
      completed: applications.filter(app => app.currentStep === 'completed').length,
      rejected: applications.filter(app => app.currentStep === 'rejected').length
    }
  };
}
