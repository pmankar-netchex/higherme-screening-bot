import { BaseEntity, ApplicationStatus, ApplicationStep, TimelineEntry } from './common';

export interface JobApplication extends BaseEntity {
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  currentStep?: ApplicationStep;
  submittedAt: string;
  resumeUrl?: string;
  screeningCallId?: string;
  screeningSummary?: string;
  recruiterNotes?: string;
  timeline: TimelineEntry[];
  feedback: Record<string, any>;
}

export interface ApplicationTimelineEntry extends TimelineEntry {
  note?: string;
}
