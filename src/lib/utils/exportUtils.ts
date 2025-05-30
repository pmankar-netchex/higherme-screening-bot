import { Candidate, JobApplication, Job } from '../types';

/**
 * Convert candidate data to CSV format for export
 */
export function candidatesToCSV(
  candidates: Candidate[], 
  applications?: JobApplication[], 
  jobs?: Job[]
): string {
  // Define CSV headers
  const headers = [
    'ID',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Position Applied',
    'Department',
    'Application Date',
    'Application Status',
    'Screening Completed',
    'Recruiter Notes'
  ];

  // Helper to safely convert values and handle commas
  const safeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const strValue = String(value);
    // If value contains commas, quotes, or newlines, wrap in quotes
    if (/[,"\n\r]/.test(strValue)) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  // Create rows from candidate data
  const rows = candidates.map(candidate => {
    // Find related application and job if provided
    const application = applications?.find(app => app.candidateId === candidate.id);
    const job = application && jobs ? jobs.find(j => j.id === application.jobId) : undefined;

    return [
      candidate.id,
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.phone,
      job?.title || 'Unknown Position',
      job?.department || 'Unknown Department',
      application ? new Date(application.submittedAt).toLocaleDateString() : 'N/A',
      application?.status?.replace(/_/g, ' ') || 'Unknown',
      candidate.screeningCompleted ? 'Yes' : 'No',
      candidate.recruiterNotes || ''
    ].map(safeValue);
  });

  // Build CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Convert candidate data to JSON format for export
 */
export function candidatesToJSON(
  candidates: Candidate[], 
  applications?: JobApplication[], 
  jobs?: Job[]
): string {
  // Create a more user-friendly representation
  const exportData = candidates.map(candidate => {
    const application = applications?.find(app => app.candidateId === candidate.id);
    const job = application && jobs ? jobs.find(j => j.id === application.jobId) : undefined;
    
    return {
      id: candidate.id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      contactInfo: {
        email: candidate.email,
        phone: candidate.phone
      },
      application: {
        position: job?.title || 'Unknown Position',
        department: job?.department || 'Unknown Department',
        date: application ? new Date(application.submittedAt).toLocaleDateString() : 'N/A',
        status: application?.status?.replace(/_/g, ' ') || 'Unknown'
      },
      screening: {
        completed: candidate.screeningCompleted,
        summaryAvailable: Boolean(candidate.screeningSummary)
      },
      recruiterNotes: candidate.recruiterNotes || ''
    };
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate a filename for exported data
 */
export function generateExportFilename(prefix: string, format: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}_${date}.${format}`;
}

/**
 * Create and trigger a download for browser
 */
export function triggerDownload(content: string, filename: string, mimeType: string): void {
  // Create a blob with the data
  const blob = new Blob([content], { type: mimeType });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
