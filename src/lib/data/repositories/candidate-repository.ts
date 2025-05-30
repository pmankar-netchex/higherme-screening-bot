import fs from 'fs';
import path from 'path';
import { Candidate } from '../../types/candidate';

const DATA_DIR = path.join(process.cwd(), 'data');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');

export class CandidateRepository {
  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readCandidatesFromFile(): Candidate[] {
    this.ensureDataDirectory();
    
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

  private writeCandidatesToFile(candidates: Candidate[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2));
    } catch (error) {
      console.error('Error writing candidates file:', error);
      throw error;
    }
  }

  findAll(): Candidate[] {
    return this.readCandidatesFromFile();
  }

  findById(id: string): Candidate | null {
    const candidates = this.readCandidatesFromFile();
    return candidates.find(candidate => candidate.id === id) || null;
  }

  findByEmail(email: string): Candidate | null {
    const candidates = this.readCandidatesFromFile();
    return candidates.find(candidate => candidate.email === email) || null;
  }

  create(candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Candidate {
    const candidates = this.readCandidatesFromFile();
    const newCandidate: Candidate = {
      ...candidateData,
      id: `candidate-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    candidates.push(newCandidate);
    this.writeCandidatesToFile(candidates);
    return newCandidate;
  }

  update(id: string, updates: Partial<Candidate>): Candidate | null {
    const candidates = this.readCandidatesFromFile();
    const index = candidates.findIndex(candidate => candidate.id === id);
    
    if (index === -1) {
      return null;
    }
    
    candidates[index] = {
      ...candidates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.writeCandidatesToFile(candidates);
    return candidates[index];
  }

  delete(id: string): boolean {
    const candidates = this.readCandidatesFromFile();
    const initialLength = candidates.length;
    const filteredCandidates = candidates.filter(candidate => candidate.id !== id);
    
    if (filteredCandidates.length < initialLength) {
      this.writeCandidatesToFile(filteredCandidates);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const candidateRepository = new CandidateRepository();
