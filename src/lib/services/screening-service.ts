import { ScreeningCall, ApplicationStatus, ScreeningSummary } from '../types';
import { screeningRepository } from '../data/repositories/screening-repository';

export class ScreeningService {
  async getAllScreenings(): Promise<ScreeningCall[]> {
    return screeningRepository.findAll();
  }

  async getScreeningById(id: string): Promise<ScreeningCall | null> {
    return screeningRepository.findById(id);
  }

  async getScreeningsByApplicationId(applicationId: string): Promise<ScreeningCall[]> {
    return screeningRepository.findByApplicationId(applicationId);
  }

  async getScreeningsByCandidateId(candidateId: string): Promise<ScreeningCall[]> {
    return screeningRepository.findByCandidateId(candidateId);
  }

  async getScreeningsByStatus(status: ApplicationStatus): Promise<ScreeningCall[]> {
    return screeningRepository.findByStatus(status);
  }

  async createScreening(screeningData: {
    applicationId: string;
    candidateId: string;
    jobId: string;
    scheduledAt: string;
  }): Promise<ScreeningCall> {
    const newScreeningData = {
      ...screeningData,
      status: 'screening_scheduled' as ApplicationStatus,
      role: 'general' as const,
      date: new Date().toISOString()
    };

    return screeningRepository.create(newScreeningData);
  }

  async updateScreeningStatus(
    id: string,
    status: ApplicationStatus,
    additionalData?: Partial<ScreeningCall>
  ): Promise<ScreeningCall | null> {
    return screeningRepository.updateStatus(id, status, additionalData);
  }

  async startScreening(id: string): Promise<ScreeningCall | null> {
    return this.updateScreeningStatus(id, 'screening_in_progress', {
      startedAt: new Date().toISOString()
    });
  }

  async completeScreening(
    id: string,
    summary: ScreeningSummary,
    transcript?: string,
    audioUrl?: string,
    duration?: number
  ): Promise<ScreeningCall | null> {
    const completionData: Partial<ScreeningCall> = {
      summary,
      completedAt: new Date().toISOString()
    };

    if (transcript) completionData.transcript = transcript;
    if (audioUrl) completionData.audioUrl = audioUrl;
    if (duration) completionData.duration = duration;

    return screeningRepository.updateSummary(id, summary);
  }

  async failScreening(id: string, errorMessage: string): Promise<ScreeningCall | null> {
    return this.updateScreeningStatus(id, 'rejected', {
      errorMessage,
      completedAt: new Date().toISOString()
    });
  }

  async updateScreening(id: string, updates: Partial<ScreeningCall>): Promise<ScreeningCall | null> {
    return screeningRepository.update(id, updates);
  }

  async deleteScreening(id: string): Promise<boolean> {
    return screeningRepository.delete(id);
  }

  async getCompletedScreenings(): Promise<ScreeningCall[]> {
    return this.getScreeningsByStatus('screening_completed');
  }

  async getPendingScreenings(): Promise<ScreeningCall[]> {
    return this.getScreeningsByStatus('screening_scheduled');
  }

  async getInProgressScreenings(): Promise<ScreeningCall[]> {
    return this.getScreeningsByStatus('screening_in_progress');
  }

  async getFailedScreenings(): Promise<ScreeningCall[]> {
    return this.getScreeningsByStatus('rejected');
  }
}

// Export singleton instance
export const screeningService = new ScreeningService();
