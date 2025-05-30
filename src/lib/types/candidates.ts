import fs from 'fs';
import path from 'path';

// Types for candidate data
export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeFileName?: string;
  resumePath?: string;
  appliedJobId: string;
  applicationDate: string;
  screeningCompleted: boolean;
  screeningCallId?: string;
  screeningSummary?: ScreeningSummary;
  status: 'applied' | 'screening_pending' | 'screening_completed' | 'under_review' | 'hired' | 'rejected';
  recruiterNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningSummary {
  callDuration: number;
  transcript?: string;
  audioUrl?: string;
  overallScore: number;
  recommendation: 'hire' | 'reject' | 'maybe';
  aiSummary?: string; // AI-generated summary, if applicable
  strengths: string[];
  concerns: string[];
  improvementAreas?: string[];
  overallEvaluation?: string; // Overall evaluation summary
  aiEvaluation?: string; // AI-generated evaluation, if applicable
  evaluations: {
    experience: {
      score: string;
      notes: string;
    };
    availability: {
      morningShift: boolean;
      eveningShift: boolean;
      weekendAvailable: boolean;
      transportation: boolean;
      notes: string;
    };
    softSkills: {
      score: string;
      notes: string;
    };
  };
  roleSpecificAnswers: Record<string, string>;
  overallSummary: string;
  recommendedNextSteps: string;
  completedAt: string;
}

const CANDIDATES_FILE_PATH = path.join(process.cwd(), 'data', 'candidates.json');

// Ensure data directory and file exist
const ensureCandidatesFile = () => {
  const dataDir = path.dirname(CANDIDATES_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(CANDIDATES_FILE_PATH)) {
    fs.writeFileSync(CANDIDATES_FILE_PATH, '[]', 'utf8');
  }
};

// Read all candidates
export const getAllCandidates = (): Candidate[] => {
  try {
    ensureCandidatesFile();
    const data = fs.readFileSync(CANDIDATES_FILE_PATH, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading candidates:', error);
    return [];
  }
};

// Get candidate by ID
export const getCandidateById = (id: string): Candidate | null => {
  const candidates = getAllCandidates();
  return candidates.find(candidate => candidate.id === id) || null;
};

// Get candidates by job ID
export const getCandidatesByJobId = (jobId: string): Candidate[] => {
  return getAllCandidates().filter(candidate => candidate.appliedJobId === jobId);
};

// Create new candidate
export const createCandidate = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Candidate => {
  const candidates = getAllCandidates();
  const newCandidate: Candidate = {
    ...candidateData,
    id: `candidate-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  candidates.push(newCandidate);
  fs.writeFileSync(CANDIDATES_FILE_PATH, JSON.stringify(candidates, null, 2), 'utf8');
  return newCandidate;
};

// Update existing candidate
export const updateCandidate = (id: string, updates: Partial<Candidate>): Candidate | null => {
  const candidates = getAllCandidates();
  const candidateIndex = candidates.findIndex(candidate => candidate.id === id);
  
  if (candidateIndex === -1) {
    return null;
  }
  
  candidates[candidateIndex] = {
    ...candidates[candidateIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(CANDIDATES_FILE_PATH, JSON.stringify(candidates, null, 2), 'utf8');
  return candidates[candidateIndex];
};

// Update candidate screening summary
export const updateCandidateScreeningSummary = (id: string, summary: ScreeningSummary): Candidate | null => {
  return updateCandidate(id, {
    screeningSummary: summary,
    screeningCompleted: true,
    status: 'screening_completed'
  });
};

// Delete candidate
export const deleteCandidate = (id: string): boolean => {
  const candidates = getAllCandidates();
  const initialLength = candidates.length;
  const filteredCandidates = candidates.filter(candidate => candidate.id !== id);
  
  if (filteredCandidates.length === initialLength) {
    return false; // Candidate not found
  }
  
  fs.writeFileSync(CANDIDATES_FILE_PATH, JSON.stringify(filteredCandidates, null, 2), 'utf8');
  return true;
};

// Search candidates by criteria
export const searchCandidates = (criteria: {
  jobId?: string;
  status?: string;
  screeningCompleted?: boolean;
  dateFrom?: string;
  dateTo?: string;
}): Candidate[] => {
  const candidates = getAllCandidates();
  
  return candidates.filter(candidate => {
    if (criteria.jobId && candidate.appliedJobId !== criteria.jobId) return false;
    if (criteria.status && candidate.status !== criteria.status) return false;
    if (criteria.screeningCompleted !== undefined && candidate.screeningCompleted !== criteria.screeningCompleted) return false;
    
    if (criteria.dateFrom) {
      const candidateDate = new Date(candidate.applicationDate);
      const fromDate = new Date(criteria.dateFrom);
      if (candidateDate < fromDate) return false;
    }
    
    if (criteria.dateTo) {
      const candidateDate = new Date(candidate.applicationDate);
      const toDate = new Date(criteria.dateTo);
      if (candidateDate > toDate) return false;
    }
    
    return true;
  });
};

// Get candidates grouped by status
export const getCandidatesByStatus = (): Record<string, Candidate[]> => {
  const candidates = getAllCandidates();
  const grouped: Record<string, Candidate[]> = {};
  
  candidates.forEach(candidate => {
    if (!grouped[candidate.status]) {
      grouped[candidate.status] = [];
    }
    grouped[candidate.status].push(candidate);
  });
  
  return grouped;
};
