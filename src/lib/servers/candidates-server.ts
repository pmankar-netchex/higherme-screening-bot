// Server-side only data utilities for candidates
import fs from 'fs';
import path from 'path';
import type { Candidate, CandidateScreeningSummary } from '../types';

// Type augmentation for local use
interface ExtendedCandidate extends Candidate {
  status?: 'applied' | 'screening_pending' | 'screening_completed' | 'under_review' | 'hired' | 'rejected';
  applicationDate?: string;
  appliedJobId?: string;
}

// Data file path
const CANDIDATES_FILE = path.join(process.cwd(), 'data', 'candidates.json');

// Mock data for development - COMMENTED OUT FOR PRODUCTION
/*
const mockCandidates: ExtendedCandidate[] = [
  {
    id: 'candidate-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1-555-0101',
    appliedJobId: 'job-001',
    applicationDate: '2024-01-15',
    screeningCompleted: true,
    status: 'screening_completed',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    screeningSummary: {
      overallScore: 8.5,
      strengths: ['Strong communication', 'Relevant experience'],
      concerns: ['Limited leadership experience'],
      recommendation: 'maybe',
      callDuration: 600,
      evaluations: {
        experience: {
          score: 'Good',
          notes: 'Has relevant experience in the industry'
        },
        availability: {
          morningShift: true,
          eveningShift: true,
          weekendAvailable: true,
          transportation: true,
          notes: 'Fully available'
        },
        softSkills: {
          score: 'Excellent',
          notes: 'Strong communication skills'
        }
      },
      roleSpecificAnswers: {},
      overallSummary: 'Excellent candidate with strong technical background',
      recommendedNextSteps: 'Proceed to interview',
      completedAt: '2024-01-15T11:00:00Z',
      aiSummary: ''
    }
  },
  {
    id: 'candidate-002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '+1-555-0102',
    appliedJobId: 'job-002',
    applicationDate: '2024-01-16',
    screeningCompleted: false,
    status: 'screening_pending',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  }
];
*/

// Helper function to ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Helper function to read candidates from file
function readCandidatesFromFile(): ExtendedCandidate[] {
  try {
    ensureDataDirectory();
    if (fs.existsSync(CANDIDATES_FILE)) {
      const data = fs.readFileSync(CANDIDATES_FILE, 'utf8');
      return JSON.parse(data);
    }
    // If file doesn't exist, create it with empty array
    const emptyCandidates: ExtendedCandidate[] = [];
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(emptyCandidates, null, 2));
    return emptyCandidates;
  } catch (error) {
    console.error('Error reading candidates file:', error);
    return []; // Return empty array instead of mock data
  }
}

// Helper function to write candidates to file
function writeCandidatesToFile(candidates: ExtendedCandidate[]) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2));
  } catch (error) {
    console.error('Error writing candidates file:', error);
  }
}

// Get all candidates
export function getAllCandidates(): ExtendedCandidate[] {
  return readCandidatesFromFile();
}

// Get candidate by ID
export function getCandidateById(id: string): ExtendedCandidate | null {
  const candidates = readCandidatesFromFile();
  return candidates.find(candidate => candidate.id === id) || null;
}

// Get candidates by job ID
export function getCandidatesByJobId(jobId: string): ExtendedCandidate[] {
  const candidates = readCandidatesFromFile();
  return candidates.filter(candidate => candidate.appliedJobId === jobId);
}

// Add new candidate
export function addCandidate(candidateData: Omit<ExtendedCandidate, 'id' | 'createdAt' | 'updatedAt'>): ExtendedCandidate {
  const candidates = readCandidatesFromFile();
  const newCandidate: Candidate = {
    ...candidateData,
    id: `candidate-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  candidates.push(newCandidate);
  writeCandidatesToFile(candidates);
  return newCandidate;
}

// Update candidate
export function updateCandidate(id: string, updates: Partial<ExtendedCandidate>): ExtendedCandidate | null {
  const candidates = readCandidatesFromFile();
  const index = candidates.findIndex(candidate => candidate.id === id);
  
  if (index === -1) {
    return null;
  }
  
  candidates[index] = {
    ...candidates[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  writeCandidatesToFile(candidates);
  return candidates[index];
}

// Delete candidate
export function deleteCandidate(id: string): boolean {
  const candidates = readCandidatesFromFile();
  const index = candidates.findIndex(candidate => candidate.id === id);
  
  if (index === -1) {
    return false;
  }
  
  candidates.splice(index, 1);
  writeCandidatesToFile(candidates);
  return true;
}

// Update candidate screening results
export function updateCandidateScreening(
  candidateId: string, 
  summary: CandidateScreeningSummary, 
  callId?: string
): ExtendedCandidate | null {
  return updateCandidate(candidateId, {
    screeningCompleted: true,
    screeningSummary: summary,
    screeningId: callId,
    status: 'screening_completed'
  });
}

// Get candidates with filters
export function getCandidatesWithFilters(filters: {
  jobId?: string;
  status?: ExtendedCandidate['status'];
  screeningCompleted?: boolean;
}): ExtendedCandidate[] {
  let candidates = readCandidatesFromFile();
  
  if (filters.jobId) {
    candidates = candidates.filter(c => c.appliedJobId === filters.jobId);
  }
  
  if (filters.status) {
    candidates = candidates.filter(c => c.status === filters.status);
  }
  
  if (filters.screeningCompleted !== undefined) {
    candidates = candidates.filter(c => c.screeningCompleted === filters.screeningCompleted);
  }
  
  return candidates;
}

// Export statistics
export function getCandidateStats() {
  const candidates = readCandidatesFromFile();
  
  return {
    total: candidates.length,
    byStatus: {
      applied: candidates.filter(c => c.status === 'applied').length,
      screening_pending: candidates.filter(c => c.status === 'screening_pending').length,
      screening_completed: candidates.filter(c => c.status === 'screening_completed').length,
      under_review: candidates.filter(c => c.status === 'under_review').length,
      hired: candidates.filter(c => c.status === 'hired').length,
      rejected: candidates.filter(c => c.status === 'rejected').length
    },
    screeningCompleted: candidates.filter(c => c.screeningCompleted).length,
    averageScore: candidates
      .filter(c => c.screeningSummary?.overallScore)
      .reduce((acc, c) => acc + (c.screeningSummary?.overallScore || 0), 0) / 
      candidates.filter(c => c.screeningSummary?.overallScore).length || 0
  };
}
