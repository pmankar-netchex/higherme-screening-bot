import fs from 'fs';
import path from 'path';
import { JobApplication, ApplicationStatus, ApplicationStep, ApplicationTimelineEntry } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

export function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readApplicationsFromFile(): JobApplication[] {
  ensureDataDirectory();
  
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

export function writeApplicationsToFile(applications: JobApplication[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
  } catch (error) {
    console.error('Error writing applications file:', error);
    throw error;
  }
}

export function updateApplicationStatus(
  id: string, 
  newStatus: ApplicationStatus, 
  newStep?: ApplicationStep,
  notes?: string,
  completedBy: string = 'system'
): JobApplication | null {
  const applications = readApplicationsFromFile();
  const appIndex = applications.findIndex(app => app.id === id);
  
  if (appIndex === -1) {
    return null;
  }

  const application = applications[appIndex];
  
  // Create a timeline entry for this status change
  const timelineEntry: ApplicationTimelineEntry = {
    step: newStep || application.currentStep || 'unknown',
    status: 'completed',
    timestamp: new Date().toISOString(),
    notes: notes,
    completedBy: completedBy,
    performedBy: completedBy as any
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

export function getApplicationById(id: string): JobApplication | null {
  const applications = readApplicationsFromFile();
  return applications.find(app => app.id === id) || null;
}

export function getAllApplications(): JobApplication[] {
  return readApplicationsFromFile();
}

export function createApplication(applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): JobApplication {
  const applications = readApplicationsFromFile();
  
  const newApplication: JobApplication = {
    ...applicationData,
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  applications.push(newApplication);
  writeApplicationsToFile(applications);
  
  return newApplication;
}

export function getApplicationsByCandidateId(candidateId: string): JobApplication[] {
  const applications = readApplicationsFromFile();
  return applications.filter(app => app.candidateId === candidateId);
}
