import { BaseEntity } from './common';

export interface Candidate extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumePath?: string; // Legacy property for compatibility
  resumeFileName?: string; // Legacy property for compatibility
  screeningSummary?: CandidateScreeningSummary;
  screeningId?: string;
  screeningCompleted?: boolean; // Legacy property for compatibility
  recruiterNotes?: string; // For recruiter notes
}

export interface CandidateScreeningSummary {
  callDuration: number;
  transcript?: string;
  audioUrl?: string;
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
  overallScore: number;
  recommendation: 'hire' | 'reject' | 'maybe';
  aiSummary: string;
  strengths: string[];
  concerns: string[];
}
