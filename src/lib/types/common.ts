// Shared types and interfaces used across client and server
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEntry {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: string;
  notes?: string;
  completedBy?: string;
  performedBy?: 'system' | 'candidate' | 'recruiter' | 'admin';
}

export type ApplicationStatus = 
  | 'submitted' 
  | 'screening_scheduled' 
  | 'screening_in_progress' 
  | 'screening_completed' 
  | 'under_review' 
  | 'interview_scheduled' 
  | 'interview_completed' 
  | 'hired' 
  | 'rejected' 
  | 'withdrawn';

export type ApplicationStep = 
  | 'application_submitted'
  | 'resume_uploaded'
  | 'resume_review'
  | 'screening_call_pending'
  | 'screening_call_scheduled'
  | 'screening_call_completed'
  | 'recruiter_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'reference_check'
  | 'hiring_decision'
  | 'process_complete';

export type ScreeningRole = 'server' | 'cook' | 'host' | 'manager' | 'general';
