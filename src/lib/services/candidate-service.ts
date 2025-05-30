import { Candidate, CandidateScreeningSummary } from '../types';
import { candidateRepository } from '../data/repositories/candidate-repository';

export class CandidateService {
  async getAllCandidates(): Promise<Candidate[]> {
    return candidateRepository.findAll();
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    return candidateRepository.findById(id);
  }

  async getCandidateByEmail(email: string): Promise<Candidate | null> {
    return candidateRepository.findByEmail(email);
  }

  async createCandidate(candidateData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
  }): Promise<Candidate> {
    // Check if candidate already exists
    const existingCandidate = await this.getCandidateByEmail(candidateData.email);
    if (existingCandidate) {
      throw new Error('Candidate with this email already exists');
    }

    return candidateRepository.create(candidateData);
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | null> {
    return candidateRepository.update(id, updates);
  }

  async updateResumeUrl(id: string, resumeUrl: string): Promise<Candidate | null> {
    return this.updateCandidate(id, { resumeUrl });
  }

  async updateScreeningSummary(
    id: string, 
    summary: CandidateScreeningSummary
  ): Promise<Candidate | null> {
    return this.updateCandidate(id, { 
      screeningSummary: summary,
      screeningCompleted: true 
    });
  }

  async addRecruiterNotes(id: string, notes: string): Promise<Candidate | null> {
    return this.updateCandidate(id, { recruiterNotes: notes });
  }

  async deleteCandidate(id: string): Promise<boolean> {
    return candidateRepository.delete(id);
  }

  async searchCandidates(searchTerm: string): Promise<Candidate[]> {
    const allCandidates = await this.getAllCandidates();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return allCandidates.filter(candidate => 
      candidate.firstName.toLowerCase().includes(lowerSearchTerm) ||
      candidate.lastName.toLowerCase().includes(lowerSearchTerm) ||
      candidate.email.toLowerCase().includes(lowerSearchTerm)
    );
  }

  async getCandidatesWithScreening(): Promise<Candidate[]> {
    const allCandidates = await this.getAllCandidates();
    return allCandidates.filter(candidate => candidate.screeningCompleted);
  }

  async getCandidatesPendingScreening(): Promise<Candidate[]> {
    const allCandidates = await this.getAllCandidates();
    return allCandidates.filter(candidate => !candidate.screeningCompleted);
  }
}

// Export singleton instance
export const candidateService = new CandidateService();
