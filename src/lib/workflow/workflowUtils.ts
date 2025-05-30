import { Application, ApplicationStatus, ApplicationStep } from '../types/applications';

// Workflow configuration and utilities
export interface WorkflowConfig {
  steps: WorkflowStepConfig[];
  statusTransitions: StatusTransition[];
}

export interface WorkflowStepConfig {
  step: ApplicationStep;
  label: string;
  description: string;
  requiredFor: string[]; // Array of job roles this step is required for
  isOptional: boolean;
  estimatedDuration: string; // e.g., "5 minutes", "1-2 days"
  automatable: boolean; // Can this step be automated?
}

export interface StatusTransition {
  from: ApplicationStatus;
  to: ApplicationStatus;
  allowedBy: ('system' | 'candidate' | 'recruiter' | 'admin')[];
  requiresNotes: boolean;
}

// Default workflow configuration
export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  steps: [
    {
      step: 'application_submitted',
      label: 'Application Submitted',
      description: 'Candidate has submitted their application',
      requiredFor: ['all'],
      isOptional: false,
      estimatedDuration: 'Immediate',
      automatable: true
    },
    {
      step: 'resume_uploaded',
      label: 'Resume Uploaded',
      description: 'Candidate has uploaded their resume',
      requiredFor: ['all'],
      isOptional: false,
      estimatedDuration: '5 minutes',
      automatable: false
    },
    {
      step: 'screening_call_pending',
      label: 'Screening Call Scheduled',
      description: 'AI voice screening call is scheduled',
      requiredFor: ['server', 'cook', 'host'],
      isOptional: false,
      estimatedDuration: '1-2 hours',
      automatable: true
    },
    {
      step: 'screening_call_completed',
      label: 'Screening Call Completed',
      description: 'AI voice screening has been completed',
      requiredFor: ['server', 'cook', 'host'],
      isOptional: false,
      estimatedDuration: '10-15 minutes',
      automatable: true
    },
    {
      step: 'recruiter_review',
      label: 'Under Review',
      description: 'Recruiter is reviewing the application and screening results',
      requiredFor: ['all'],
      isOptional: false,
      estimatedDuration: '1-3 days',
      automatable: false
    },
    {
      step: 'hiring_decision',
      label: 'Hiring Decision',
      description: 'Final hiring decision has been made',
      requiredFor: ['all'],
      isOptional: false,
      estimatedDuration: '1-2 days',
      automatable: false
    },
    {
      step: 'process_complete',
      label: 'Process Complete',
      description: 'Application process has been completed',
      requiredFor: ['all'],
      isOptional: false,
      estimatedDuration: 'Immediate',
      automatable: true
    }
  ],
  statusTransitions: [
    {
      from: 'submitted',
      to: 'screening_scheduled',
      allowedBy: ['system', 'recruiter', 'admin'],
      requiresNotes: false
    },
    {
      from: 'screening_scheduled',
      to: 'screening_in_progress',
      allowedBy: ['system'],
      requiresNotes: false
    },
    {
      from: 'screening_in_progress',
      to: 'screening_completed',
      allowedBy: ['system'],
      requiresNotes: false
    },
    {
      from: 'screening_completed',
      to: 'under_review',
      allowedBy: ['system'],
      requiresNotes: false
    },
    {
      from: 'under_review',
      to: 'interview_scheduled',
      allowedBy: ['recruiter', 'admin'],
      requiresNotes: true
    },
    {
      from: 'under_review',
      to: 'hired',
      allowedBy: ['recruiter', 'admin'],
      requiresNotes: true
    },
    {
      from: 'under_review',
      to: 'rejected',
      allowedBy: ['recruiter', 'admin'],
      requiresNotes: true
    },
    {
      from: 'interview_scheduled',
      to: 'hired',
      allowedBy: ['recruiter', 'admin'],
      requiresNotes: true
    },
    {
      from: 'interview_scheduled',
      to: 'rejected',
      allowedBy: ['recruiter', 'admin'],
      requiresNotes: true
    },
    {
      from: 'submitted',
      to: 'withdrawn',
      allowedBy: ['candidate', 'admin'],
      requiresNotes: false
    },
    {
      from: 'screening_scheduled',
      to: 'withdrawn',
      allowedBy: ['candidate', 'admin'],
      requiresNotes: false
    },
    {
      from: 'screening_completed',
      to: 'withdrawn',
      allowedBy: ['candidate', 'admin'],
      requiresNotes: false
    },
    {
      from: 'under_review',
      to: 'withdrawn',
      allowedBy: ['candidate', 'admin'],
      requiresNotes: false
    }
  ]
};

/**
 * Get the next possible steps for an application
 */
export function getNextPossibleSteps(currentStep: ApplicationStep): ApplicationStep[] {
  const stepFlow: Record<ApplicationStep, ApplicationStep[]> = {
    'application_submitted': ['resume_uploaded'],
    'resume_uploaded': ['screening_call_pending'],
    'screening_call_pending': ['screening_call_completed'],
    'screening_call_completed': ['recruiter_review'],
    'recruiter_review': ['hiring_decision'],
    'hiring_decision': ['process_complete'],
    'process_complete': []
  };

  return stepFlow[currentStep] || [];
}

/**
 * Get valid status transitions from current status
 */
export function getValidStatusTransitions(
  currentStatus: ApplicationStatus,
  userRole: 'system' | 'candidate' | 'recruiter' | 'admin'
): ApplicationStatus[] {
  return DEFAULT_WORKFLOW_CONFIG.statusTransitions
    .filter(transition => 
      transition.from === currentStatus && 
      transition.allowedBy.includes(userRole)
    )
    .map(transition => transition.to);
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
  userRole: 'system' | 'candidate' | 'recruiter' | 'admin'
): boolean {
  return DEFAULT_WORKFLOW_CONFIG.statusTransitions.some(transition =>
    transition.from === from &&
    transition.to === to &&
    transition.allowedBy.includes(userRole)
  );
}

/**
 * Check if notes are required for a status transition
 */
export function requiresNotesForTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  const transition = DEFAULT_WORKFLOW_CONFIG.statusTransitions.find(t =>
    t.from === from && t.to === to
  );
  return transition?.requiresNotes || false;
}

/**
 * Get step configuration for a specific step
 */
export function getStepConfig(step: ApplicationStep): WorkflowStepConfig | null {
  return DEFAULT_WORKFLOW_CONFIG.steps.find(s => s.step === step) || null;
}

/**
 * Calculate workflow progress percentage
 */
export function calculateWorkflowProgress(application: Application): number {
  const totalSteps = DEFAULT_WORKFLOW_CONFIG.steps.length;
  const completedSteps = application.timeline.filter(entry => 
    entry.status === 'completed'
  ).length;
  
  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Get workflow status display information
 */
export function getStatusDisplayInfo(status: ApplicationStatus): {
  label: string;
  color: string;
  description: string;
} {
  const statusInfo: Record<ApplicationStatus, { label: string; color: string; description: string }> = {
    'submitted': {
      label: 'Submitted',
      color: 'blue',
      description: 'Application has been submitted'
    },
    'screening_scheduled': {
      label: 'Screening Scheduled',
      color: 'yellow',
      description: 'Voice screening call is scheduled'
    },
    'screening_in_progress': {
      label: 'Screening in Progress',
      color: 'orange',
      description: 'Voice screening call is currently in progress'
    },
    'screening_completed': {
      label: 'Screening Completed',
      color: 'green',
      description: 'Voice screening has been completed'
    },
    'under_review': {
      label: 'Under Review',
      color: 'purple',
      description: 'Application is being reviewed by recruiter'
    },
    'interview_scheduled': {
      label: 'Interview Scheduled',
      color: 'indigo',
      description: 'In-person interview has been scheduled'
    },
    'hired': {
      label: 'Hired',
      color: 'green',
      description: 'Candidate has been hired'
    },
    'rejected': {
      label: 'Rejected',
      color: 'red',
      description: 'Application has been rejected'
    },
    'withdrawn': {
      label: 'Withdrawn',
      color: 'gray',
      description: 'Application has been withdrawn'
    }
  };

  return statusInfo[status];
}

/**
 * Check if an application can be advanced to the next step
 */
export function canAdvanceToNextStep(application: Application): boolean {
  const nextSteps = getNextPossibleSteps(application.currentStep);
  return nextSteps.length > 0 && !['hired', 'rejected', 'withdrawn'].includes(application.status);
}

/**
 * Get estimated completion time for remaining steps
 */
export function getEstimatedCompletionTime(application: Application): string {
  const currentStepIndex = DEFAULT_WORKFLOW_CONFIG.steps.findIndex(
    step => step.step === application.currentStep
  );
  
  if (currentStepIndex === -1) return 'Unknown';
  
  const remainingSteps = DEFAULT_WORKFLOW_CONFIG.steps.slice(currentStepIndex + 1);
  
  if (remainingSteps.length === 0) return 'Complete';
  
  // Simple estimation - sum up estimated durations
  // In a real application, this would be more sophisticated
  const estimatedDays = remainingSteps.reduce((total, step) => {
    if (step.estimatedDuration.includes('day')) {
      const match = step.estimatedDuration.match(/(\d+)/);
      return total + (match ? parseInt(match[1]) : 1);
    }
    return total;
  }, 0);
  
  if (estimatedDays === 0) return 'Within 24 hours';
  if (estimatedDays === 1) return '1 day';
  return `${estimatedDays} days`;
}
