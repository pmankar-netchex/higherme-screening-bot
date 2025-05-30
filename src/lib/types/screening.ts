import { BaseEntity, ScreeningRole, ApplicationStatus } from './common';

export interface ScreeningSummary {
  experience: {
    evaluation: string;
    highlights: string[];
  };
  availability: {
    morning: boolean;
    evening: boolean;
    weekends: boolean;
    notes: string;
  };
  transportation: {
    hasReliableTransportation: boolean;
    notes: string;
  };
  softSkills: {
    evaluation: string;
    highlights: string[];
  };
  roleSpecific: {
    evaluation: string;
    strengths: string[];
    areas_of_improvement: string[];
  };
}

export interface ScreeningCall extends BaseEntity {
  applicationId: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string; 
  duration?: number;
  summary?: ScreeningSummary;
  transcript?: string;
  audioUrl?: string;
  questions?: ScreeningQuestion[];
  responses?: ScreeningResponse[];
  errorMessage?: string;
  score?: number; // Overall score for the screening
  role: ScreeningRole;
  date: string; // Date of the screening
  aiSummary?: string; // AI-generated summary, if applicable
  aiEvaluation?: string; // AI-generated evaluation, if applicable
  aiRecommendations?: string; // AI-generated recommendations, if applicable
  aiStrengths?: string[]; // AI-generated strengths, if applicable
  aiConcerns?: string[]; // AI-generated concerns, if applicable
  aiImprovementAreas?: string[]; // AI-generated areas for improvement, if applicable
  aiCallDuration?: number; // AI-generated call duration, if applicable
  aiCallTranscript?: string; // AI-generated call transcript, if applicable
  aiCallAudioUrl?: string; // AI-generated call audio URL, if applicable
  aiCallId?: string; // AI-generated call ID, if applicable
  aiCallCreatedAt?: string; // AI-generated call creation timestamp, if applicable
  aiCallUpdatedAt?: string; // AI-generated call update timestamp, if applicable
  aiCallStatus?: 'pending' | 'completed' | 'failed'; // AI-generated call status, if applicable
  aiCallError?: string; // AI-generated call error message, if applicable
  aiCallModel?: string; // AI model used for the call, if applicable
  aiCallModelVersion?: string; // AI model version used for the call, if applicable
  aiCallProvider?: string; // AI provider used for the call, if applicable
  aiCallProviderResponse?: string; // AI provider response for the call, if applicable
  aiCallProviderError?: string; // AI provider error message for the call, if applicable
  aiCallProviderRequestId?: string; // AI provider request ID for the call, if applicable
  aiCallProviderCreatedAt?: string; // AI provider request creation timestamp, if applicable
  aiCallProviderUpdatedAt?: string; // AI provider request update timestamp, if applicable
  aiCallProviderStatus?: 'pending' | 'completed' | 'failed'; // AI provider request status, if applicable
  aiCallProviderErrorMessage?: string; // AI provider request error message, if applicable
  aiCallProviderResponseTime?: number; // AI provider request response time in milliseconds, if applicable
  aiCallProviderCost?: number; // AI provider request cost, if applicable
  aiCallProviderUsage?: number; // AI provider request usage, if applicable
  aiCallProviderQuota?: number; // AI provider request quota, if applicable
  aiCallProviderQuotaUsed?: number; // AI provider request quota used, if applicable
  aiCallProviderQuotaRemaining?: number; // AI provider request quota remaining, if applicable
  aiCallProviderQuotaReset?: string; // AI provider request quota reset timestamp, if applicable
  aiCallProviderQuotaLimit?: number; // AI provider request quota limit, if applicable
  aiCallProviderQuotaExceeded?: boolean; // AI provider request quota exceeded flag, if applicable
  aiCallProviderQuotaExceededAt?: string; // AI provider request quota exceeded timestamp, if applicable
  aiCallProviderQuotaExceededMessage?: string; // AI provider request quota exceeded message, if applicable
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'open' | 'boolean' | 'choice';
  required: boolean;
  category: string;
}

export interface ScreeningResponse {
  questionId: string;
  response: string;
  score?: number;
}
