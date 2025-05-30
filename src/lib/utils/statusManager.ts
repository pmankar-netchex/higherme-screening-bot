import { ApplicationStatus, ApplicationStep } from '../types/common';

/**
 * Centralized status management utility to ensure consistency across the application
 */

export interface StatusDisplayInfo {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

/**
 * Get display information for an application status
 */
export function getStatusDisplayInfo(status: ApplicationStatus): StatusDisplayInfo {
  const statusMap: Record<ApplicationStatus, StatusDisplayInfo> = {
    submitted: {
      label: 'Submitted',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      description: 'Application has been submitted'
    },
    screening_scheduled: {
      label: 'Screening Scheduled',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      description: 'Screening call has been scheduled'
    },
    screening_in_progress: {
      label: 'Screening In Progress',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      description: 'Screening call is currently in progress'
    },
    screening_completed: {
      label: 'Screening Completed',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      description: 'Screening call has been completed'
    },
    under_review: {
      label: 'Under Review',
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
      description: 'Application is being reviewed by the recruiter'
    },
    interview_scheduled: {
      label: 'Interview Scheduled',
      color: 'text-indigo-800',
      bgColor: 'bg-indigo-100',
      description: 'Interview has been scheduled'
    },
    interview_completed: {
      label: 'Interview Completed',
      color: 'text-indigo-800',
      bgColor: 'bg-indigo-100',
      description: 'Interview has been completed'
    },
    hired: {
      label: 'Hired',
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      description: 'Candidate has been hired'
    },
    rejected: {
      label: 'Rejected',
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      description: 'Application has been rejected'
    },
    withdrawn: {
      label: 'Withdrawn',
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      description: 'Application has been withdrawn'
    }
  };

  return statusMap[status];
}

/**
 * Get the CSS classes for a status badge
 */
export function getStatusBadgeClasses(status: ApplicationStatus): string {
  const { color, bgColor } = getStatusDisplayInfo(status);
  return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${color}`;
}

/**
 * Get the next possible statuses for an application
 */
export function getNextPossibleStatuses(currentStatus: ApplicationStatus): ApplicationStatus[] {
  const statusTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    submitted: ['screening_scheduled', 'rejected', 'withdrawn'],
    screening_scheduled: ['screening_in_progress', 'screening_completed', 'rejected', 'withdrawn'],
    screening_in_progress: ['screening_completed', 'rejected', 'withdrawn'],
    screening_completed: ['under_review', 'interview_scheduled', 'rejected', 'withdrawn'],
    under_review: ['interview_scheduled', 'hired', 'rejected', 'withdrawn'],
    interview_scheduled: ['interview_completed', 'hired', 'rejected', 'withdrawn'],
    interview_completed: ['hired', 'rejected', 'withdrawn'],
    hired: ['withdrawn'], // Only allow withdrawal after hiring
    rejected: [], // Terminal state
    withdrawn: [] // Terminal state
  };

  return statusTransitions[currentStatus] || [];
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  const validNextStatuses = getNextPossibleStatuses(from);
  return validNextStatuses.includes(to);
}

/**
 * Get status priority for sorting (lower number = higher priority)
 */
export function getStatusPriority(status: ApplicationStatus): number {
  const priorities: Record<ApplicationStatus, number> = {
    submitted: 1,
    screening_scheduled: 2,
    screening_in_progress: 3,
    screening_completed: 4,
    under_review: 5,
    interview_scheduled: 6,
    interview_completed: 7,
    hired: 8,
    rejected: 9,
    withdrawn: 10
  };

  return priorities[status] || 999;
}

/**
 * Sort applications by status priority
 */
export function sortByStatusPriority(applications: { status: ApplicationStatus }[]): typeof applications {
  return [...applications].sort((a, b) => {
    return getStatusPriority(a.status) - getStatusPriority(b.status);
  });
}
