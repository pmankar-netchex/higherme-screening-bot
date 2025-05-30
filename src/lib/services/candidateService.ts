import fs from 'fs';
import path from 'path';
import { Candidate, CandidateScreeningSummary } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');

export function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readCandidatesFromFile(): Candidate[] {
  ensureDataDirectory();
  
  if (!fs.existsSync(CANDIDATES_FILE)) {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify([]));
    return [];
  }
  
  try {
    const rawData = fs.readFileSync(CANDIDATES_FILE, 'utf-8');
    return JSON.parse(rawData) as Candidate[];
  } catch (error) {
    console.error('Error reading candidates file:', error);
    return [];
  }
}

export function writeCandidatesToFile(candidates: Candidate[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2));
  } catch (error) {
    console.error('Error writing candidates file:', error);
    throw error;
  }
}

export function updateCandidateScreening(
  candidateId: string,
  screeningSummary: CandidateScreeningSummary,
  screeningId: string
): Candidate | null {
  const candidates = readCandidatesFromFile();
  const candidateIndex = candidates.findIndex(c => c.id === candidateId);
  
  if (candidateIndex === -1) {
    console.error(`Candidate with ID ${candidateId} not found`);
    return null;
  }

  // Update the candidate with screening data
  candidates[candidateIndex] = {
    ...candidates[candidateIndex],
    screeningSummary,
    screeningId,
    updatedAt: new Date().toISOString()
  };
  
  writeCandidatesToFile(candidates);
  return candidates[candidateIndex];
}

export function getCandidateById(id: string): Candidate | null {
  const candidates = readCandidatesFromFile();
  return candidates.find(candidate => candidate.id === id) || null;
}

export function getAllCandidates(): Candidate[] {
  return readCandidatesFromFile();
}

export function createCandidate(candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Candidate {
  const candidates = readCandidatesFromFile();
  
  const newCandidate: Candidate = {
    id: `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...candidateData
  };
  
  candidates.push(newCandidate);
  writeCandidatesToFile(candidates);
  
  return newCandidate;
}

export function updateCandidate(candidateId: string, updates: Partial<Candidate>): Candidate | null {
  const candidates = readCandidatesFromFile();
  const candidateIndex = candidates.findIndex(c => c.id === candidateId);
  
  if (candidateIndex === -1) {
    return null;
  }
  
  candidates[candidateIndex] = {
    ...candidates[candidateIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  writeCandidatesToFile(candidates);
  return candidates[candidateIndex];
}
