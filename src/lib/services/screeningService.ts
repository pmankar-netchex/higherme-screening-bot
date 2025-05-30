import fs from 'fs';
import path from 'path';
import { ScreeningCall, ScreeningSummary, ApplicationStatus } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCREENINGS_FILE = path.join(DATA_DIR, 'screenings.json');

export function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readScreeningsFromFile(): ScreeningCall[] {
  ensureDataDirectory();
  
  if (!fs.existsSync(SCREENINGS_FILE)) {
    fs.writeFileSync(SCREENINGS_FILE, JSON.stringify([]));
    return [];
  }
  
  try {
    const rawData = fs.readFileSync(SCREENINGS_FILE, 'utf-8');
    return JSON.parse(rawData) as ScreeningCall[];
  } catch (error) {
    console.error('Error reading screenings file:', error);
    return [];
  }
}

export function writeScreeningsToFile(screenings: ScreeningCall[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(SCREENINGS_FILE, JSON.stringify(screenings, null, 2));
  } catch (error) {
    console.error('Error writing screenings file:', error);
    throw error;
  }
}

export function updateScreeningStatus(
  id: string,
  status: ApplicationStatus,
  additionalData: Partial<ScreeningCall> = {}
): ScreeningCall | null {
  const screenings = readScreeningsFromFile();
  const screeningIndex = screenings.findIndex(s => s.id === id);
  
  if (screeningIndex === -1) {
    return null;
  }

  // Update the screening
  screenings[screeningIndex] = {
    ...screenings[screeningIndex],
    status,
    ...additionalData,
    updatedAt: new Date().toISOString()
  };

  // Add timestamps based on status
  if (status === 'screening_completed' && screenings[screeningIndex].status !== 'screening_completed') {
    screenings[screeningIndex].completedAt = new Date().toISOString();
    
    // Calculate duration if we have start time
    if (screenings[screeningIndex].startedAt) {
      const startTime = new Date(screenings[screeningIndex].startedAt!).getTime();
      const endTime = new Date(screenings[screeningIndex].completedAt!).getTime();
      screenings[screeningIndex].duration = Math.round((endTime - startTime) / 1000);
    }
  }
  
  if (status === 'screening_in_progress' && screenings[screeningIndex].status !== 'screening_in_progress') {
    screenings[screeningIndex].startedAt = new Date().toISOString();
  }
  
  writeScreeningsToFile(screenings);
  return screenings[screeningIndex];
}

export function updateScreeningSummary(
  id: string,
  summary: ScreeningSummary
): ScreeningCall | null {
  const screenings = readScreeningsFromFile();
  const screeningIndex = screenings.findIndex(s => s.id === id);
  
  if (screeningIndex === -1) {
    return null;
  }

  screenings[screeningIndex] = {
    ...screenings[screeningIndex],
    summary,
    updatedAt: new Date().toISOString()
  };
  
  writeScreeningsToFile(screenings);
  return screenings[screeningIndex];
}

export function getScreeningById(id: string): ScreeningCall | null {
  const screenings = readScreeningsFromFile();
  return screenings.find(s => s.id === id) || null;
}

export function getAllScreenings(): ScreeningCall[] {
  return readScreeningsFromFile();
}

export function getScreeningsByCandidate(candidateId: string): ScreeningCall[] {
  const screenings = readScreeningsFromFile();
  return screenings.filter(s => s.candidateId === candidateId);
}

export function getScreeningsByApplication(applicationId: string): ScreeningCall[] {
  const screenings = readScreeningsFromFile();
  return screenings.filter(s => s.applicationId === applicationId);
}

export function createScreening(
  applicationId: string,
  candidateId: string,
  jobId: string,
  additionalData: Partial<ScreeningCall> = {}
): ScreeningCall {
  const screenings = readScreeningsFromFile();
  
  // Generate a unique ID for the new screening
  const id = `screening_${Date.now()}`;
  const now = new Date().toISOString();
  
  // Create new screening record
  const newScreening: ScreeningCall = {
    id,
    applicationId,
    candidateId,
    jobId,
    status: 'screening_scheduled',
    scheduledAt: now,
    createdAt: now,
    updatedAt: now,
    date: additionalData.date || now, // Ensure date is always defined
    // Using a type assertion to handle the role until ScreeningRole is updated
    role: 'general', // Default role value
    ...additionalData
  };
  
  screenings.push(newScreening);
  writeScreeningsToFile(screenings);
  
  return newScreening;
}

export function updateScreening(
  id: string,
  updates: Partial<ScreeningCall>
): ScreeningCall | null {
  const screenings = readScreeningsFromFile();
  const screeningIndex = screenings.findIndex(s => s.id === id);
  
  if (screeningIndex === -1) {
    return null;
  }

  // Update the screening data
  screenings[screeningIndex] = {
    ...screenings[screeningIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Handle status-specific logic
  if (updates.status) {
    if (updates.status === 'screening_completed' && screenings[screeningIndex].status !== 'screening_completed') {
      screenings[screeningIndex].completedAt = new Date().toISOString();
      
      // Calculate duration if we have start time
      if (screenings[screeningIndex].startedAt) {
        const startTime = new Date(screenings[screeningIndex].startedAt!).getTime();
        const endTime = new Date(screenings[screeningIndex].completedAt!).getTime();
        screenings[screeningIndex].duration = Math.round((endTime - startTime) / 1000);
      }
    }
    
    if (updates.status === 'screening_in_progress' && screenings[screeningIndex].status !== 'screening_in_progress') {
      screenings[screeningIndex].startedAt = new Date().toISOString();
    }
  }
  
  writeScreeningsToFile(screenings);
  return screenings[screeningIndex];
}

export function getScreeningsByFilters(filters: {
  candidateId?: string;
  jobId?: string;
  applicationId?: string;
  status?: ApplicationStatus;
}): ScreeningCall[] {
  let screenings = readScreeningsFromFile();
  
  // Apply filters if provided
  if (filters.candidateId) {
    screenings = screenings.filter(s => s.candidateId === filters.candidateId);
  }
  
  if (filters.jobId) {
    screenings = screenings.filter(s => s.jobId === filters.jobId);
  }
  
  if (filters.applicationId) {
    screenings = screenings.filter(s => s.applicationId === filters.applicationId);
  }
  
  if (filters.status) {
    screenings = screenings.filter(s => s.status === filters.status);
  }
  
  return screenings;
}
