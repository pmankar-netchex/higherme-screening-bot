// Application constants
export const APP_CONFIG = {
  APP_NAME: 'Restaurant Recruitment Platform',
  VERSION: '1.0.0',
  COMPANY_NAME: 'Your Restaurant Chain'
} as const;

// Screening configuration
export const SCREENING_CONFIG = {
  DEFAULT_CALL_DURATION: 600, // 10 minutes in seconds
  MIN_CALL_DURATION: 60, // 1 minute
  MAX_CALL_DURATION: 1800, // 30 minutes
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_VOICE_PROVIDER: 'elevenlabs'
} as const;

// Application workflow steps
export const WORKFLOW_STEPS = {
  APPLICATION_SUBMITTED: 'application_submitted',
  RESUME_UPLOADED: 'resume_uploaded',
  RESUME_REVIEW: 'resume_review',
  SCREENING_CALL_PENDING: 'screening_call_pending',
  SCREENING_CALL_SCHEDULED: 'screening_call_scheduled',
  SCREENING_CALL_COMPLETED: 'screening_call_completed',
  RECRUITER_REVIEW: 'recruiter_review',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_COMPLETED: 'interview_completed',
  REFERENCE_CHECK: 'reference_check',
  HIRING_DECISION: 'hiring_decision',
  PROCESS_COMPLETE: 'process_complete'
} as const;

// Application statuses
export const APPLICATION_STATUSES = {
  SUBMITTED: 'submitted',
  SCREENING_SCHEDULED: 'screening_scheduled',
  SCREENING_IN_PROGRESS: 'screening_in_progress',
  SCREENING_COMPLETED: 'screening_completed',
  UNDER_REVIEW: 'under_review',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_COMPLETED: 'interview_completed',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
} as const;

// Screening statuses
export const SCREENING_STATUSES = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

// Job departments
export const DEPARTMENTS = {
  FRONT_OF_HOUSE: 'Front of House',
  BACK_OF_HOUSE: 'Back of House',
  MANAGEMENT: 'Management',
  SUPPORT: 'Support'
} as const;

// Shift types
export const SHIFT_TYPES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  OVERNIGHT: 'overnight'
} as const;
