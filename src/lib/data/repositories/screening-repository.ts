import fs from 'fs';
import path from 'path';
import { ScreeningCall, ApplicationStatus, ScreeningSummary } from '../../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCREENINGS_FILE = path.join(DATA_DIR, 'screenings.json');

export class ScreeningRepository {
  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readScreeningsFromFile(): ScreeningCall[] {
    this.ensureDataDirectory();
    
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

  private writeScreeningsToFile(screenings: ScreeningCall[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(SCREENINGS_FILE, JSON.stringify(screenings, null, 2));
    } catch (error) {
      console.error('Error writing screenings file:', error);
      throw error;
    }
  }

  findAll(): ScreeningCall[] {
    return this.readScreeningsFromFile();
  }

  findById(id: string): ScreeningCall | null {
    const screenings = this.readScreeningsFromFile();
    return screenings.find(screening => screening.id === id) || null;
  }

  findByApplicationId(applicationId: string): ScreeningCall[] {
    const screenings = this.readScreeningsFromFile();
    return screenings.filter(screening => screening.applicationId === applicationId);
  }

  findByCandidateId(candidateId: string): ScreeningCall[] {
    const screenings = this.readScreeningsFromFile();
    return screenings.filter(screening => screening.candidateId === candidateId);
  }

  findByStatus(status: ApplicationStatus): ScreeningCall[] {
    const screenings = this.readScreeningsFromFile();
    return screenings.filter(screening => screening.status === status);
  }

  create(screeningData: Omit<ScreeningCall, 'id' | 'createdAt' | 'updatedAt'>): ScreeningCall {
    const screenings = this.readScreeningsFromFile();
    const newScreening: ScreeningCall = {
      ...screeningData,
      id: `screening-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    screenings.push(newScreening);
    this.writeScreeningsToFile(screenings);
    return newScreening;
  }

  update(id: string, updates: Partial<ScreeningCall>): ScreeningCall | null {
    const screenings = this.readScreeningsFromFile();
    const index = screenings.findIndex(screening => screening.id === id);
    
    if (index === -1) {
      return null;
    }
    
    screenings[index] = {
      ...screenings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.writeScreeningsToFile(screenings);
    return screenings[index];
  }

  updateStatus(id: string, status: ApplicationStatus, additionalData: Partial<ScreeningCall> = {}): ScreeningCall | null {
    const updates: Partial<ScreeningCall> = {
      status,
      ...additionalData
    };

    if (status === 'screening_in_progress' && !additionalData.startedAt) {
      updates.startedAt = new Date().toISOString();
    }

    if (status === 'screening_completed' && !additionalData.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    return this.update(id, updates);
  }

  updateSummary(id: string, summary: ScreeningSummary): ScreeningCall | null {
    return this.update(id, { 
      summary,
      status: 'screening_completed',
      completedAt: new Date().toISOString()
    });
  }

  delete(id: string): boolean {
    const screenings = this.readScreeningsFromFile();
    const initialLength = screenings.length;
    const filteredScreenings = screenings.filter(screening => screening.id !== id);
    
    if (filteredScreenings.length < initialLength) {
      this.writeScreeningsToFile(filteredScreenings);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const screeningRepository = new ScreeningRepository();
