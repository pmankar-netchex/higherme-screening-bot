import { JobApplication, ApplicationStatus, ApplicationStep } from '../types';
import { applicationRepository } from '../data/repositories/application-repository';

export class ApplicationService {
  async getAllApplications(): Promise<JobApplication[]> {
    return applicationRepository.findAll();
  }

  async getApplicationById(id: string): Promise<JobApplication | null> {
    return applicationRepository.findById(id);
  }

  async getApplicationsByJobId(jobId: string): Promise<JobApplication[]> {
    return applicationRepository.findByJobId(jobId);
  }

  async getApplicationsByCandidateId(candidateId: string): Promise<JobApplication[]> {
    return applicationRepository.findByCandidateId(candidateId);
  }

  async createApplication(applicationData: {
    jobId: string;
    candidateId: string;
    submittedAt?: string;
    resumeUrl?: string;
  }): Promise<JobApplication> {
    const newApplicationData = {
      ...applicationData,
      status: 'submitted' as ApplicationStatus,
      currentStep: 'application_submitted' as ApplicationStep,
      submittedAt: applicationData.submittedAt || new Date().toISOString(),
      timeline: [{
        step: 'application_submitted',
        status: 'completed' as const,
        timestamp: new Date().toISOString(),
        notes: 'Application submitted',
        performedBy: 'candidate' as const
      }],
      feedback: {}
    };

    return applicationRepository.create(newApplicationData);
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    step?: ApplicationStep,
    notes?: string,
    completedBy: string = 'system'
  ): Promise<JobApplication | null> {
    return applicationRepository.updateStatus(id, status, step, notes, completedBy);
  }

  async updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
    return applicationRepository.update(id, updates);
  }

  async deleteApplication(id: string): Promise<boolean> {
    return applicationRepository.delete(id);
  }

  async addScreeningResult(
    applicationId: string,
    screeningCallId: string,
    summary?: string
  ): Promise<JobApplication | null> {
    const updates: Partial<JobApplication> = {
      screeningCallId,
      status: 'screening_completed',
      currentStep: 'screening_call_completed'
    };

    if (summary) {
      updates.screeningSummary = summary;
    }

    return this.updateApplication(applicationId, updates);
  }

  async addRecruiterNotes(applicationId: string, notes: string): Promise<JobApplication | null> {
    return this.updateApplication(applicationId, { recruiterNotes: notes });
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
