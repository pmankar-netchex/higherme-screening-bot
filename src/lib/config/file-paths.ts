// File paths configuration
export const FILE_PATHS = {
  DATA_DIR: 'data',
  UPLOADS_DIR: 'public/uploads',
  RESUMES_DIR: 'public/uploads/resumes',
  BACKUPS_DIR: 'data/backups'
} as const;

// File size limits
export const FILE_LIMITS = {
  MAX_RESUME_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_RESUME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ALLOWED_RESUME_EXTENSIONS: ['.pdf', '.doc', '.docx']
} as const;

// Data file names
export const DATA_FILES = {
  APPLICATIONS: 'applications.json',
  CANDIDATES: 'candidates.json',
  JOBS: 'jobs.json',
  SCREENINGS: 'screenings.json',
  CONFIG: 'config.json'
} as const;
