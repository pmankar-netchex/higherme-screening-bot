import fs from 'fs';
import path from 'path';
import { JobApplication, ApplicationStatus, ApplicationStep, ApplicationTimelineEntry } from '../../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

export class ApplicationRepository {
  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readApplicationsFromFile(): JobApplication[] {
    this.ensureDataDirectory();
    
    if (!fs.existsSync(APPLICATIONS_FILE)) {
      fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([]));
      return [];
    }
    
    try {
      const rawData = fs.readFileSync(APPLICATIONS_FILE, 'utf-8');
      return JSON.parse(rawData) as JobApplication[];
    } catch (error) {
      console.error('Error reading applications file:', error);
      return [];
    }
  }

  private writeApplicationsToFile(applications: JobApplication[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
    } catch (error) {
      console.error('Error writing applications file:', error);
      throw error;
    }
  }

  findAll(): JobApplication[] {
    return this.readApplicationsFromFile();
  }

  findById(id: string): JobApplication | null {
    const applications = this.readApplicationsFromFile();
    return applications.find(app => app.id === id) || null;
  }

  findByJobId(jobId: string): JobApplication[] {
    const applications = this.readApplicationsFromFile();
    return applications.filter(app => app.jobId === jobId);
  }

  findByCandidateId(candidateId: string): JobApplication[] {
    const applications = this.readApplicationsFromFile();
    return applications.filter(app => app.candidateId === candidateId);
  }

  create(applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): JobApplication {
    const applications = this.readApplicationsFromFile();
    const newApplication: JobApplication = {
      ...applicationData,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    applications.push(newApplication);
    this.writeApplicationsToFile(applications);
    return newApplication;
  }

  update(id: string, updates: Partial<JobApplication>): JobApplication | null {
    const applications = this.readApplicationsFromFile();
    const index = applications.findIndex(app => app.id === id);
    
    if (index === -1) {
      return null;
    }
    
    applications[index] = {
      ...applications[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.writeApplicationsToFile(applications);
    return applications[index];
  }

  updateStatus(
    id: string, 
    newStatus: ApplicationStatus, 
    newStep?: ApplicationStep,
    notes?: string,
    completedBy: string = 'system'
  ): JobApplication | null {
    const applications = this.readApplicationsFromFile();
    const appIndex = applications.findIndex(app => app.id === id);
    
    if (appIndex === -1) {
      return null;
    }

    const application = applications[appIndex];
    
    // Create timeline entry
    const timelineEntry: ApplicationTimelineEntry = {
      step: newStep || application.currentStep || 'application_submitted',
      status: 'completed',
      timestamp: new Date().toISOString(),
      notes,
      completedBy,
      performedBy: completedBy === 'system' ? 'system' : 'recruiter'
    };

    // Update application
    applications[appIndex] = {
      ...application,
      status: newStatus,
      currentStep: newStep || application.currentStep,
      timeline: [...(application.timeline || []), timelineEntry],
      updatedAt: new Date().toISOString()
    };

    this.writeApplicationsToFile(applications);
    return applications[appIndex];
  }

  delete(id: string): boolean {
    const applications = this.readApplicationsFromFile();
    const initialLength = applications.length;
    const filteredApplications = applications.filter(app => app.id !== id);
    
    if (filteredApplications.length < initialLength) {
      this.writeApplicationsToFile(filteredApplications);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const applicationRepository = new ApplicationRepository();
