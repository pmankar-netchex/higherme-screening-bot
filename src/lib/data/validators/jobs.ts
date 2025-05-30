import fs from 'fs';
import path from 'path';

// Types for job data
export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  shiftTypes: string[];
  weekendRequired: boolean;
  hourlyRate: string;
  status: 'active' | 'inactive' | 'filled';
  createdAt: string;
  updatedAt: string;
}

const JOBS_FILE_PATH = path.join(process.cwd(), 'data', 'jobs.json');

// Ensure data directory and file exist
const ensureJobsFile = () => {
  const dataDir = path.dirname(JOBS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(JOBS_FILE_PATH)) {
    fs.writeFileSync(JOBS_FILE_PATH, '[]', 'utf8');
  }
};

// Read all jobs
export const getAllJobs = (): Job[] => {
  try {
    ensureJobsFile();
    const data = fs.readFileSync(JOBS_FILE_PATH, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading jobs:', error);
    return [];
  }
};

// Get active jobs only
export const getActiveJobs = (): Job[] => {
  return getAllJobs().filter(job => job.status === 'active');
};

// Get job by ID
export const getJobById = (id: string): Job | null => {
  const jobs = getAllJobs();
  return jobs.find(job => job.id === id) || null;
};

// Create new job
export const createJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job => {
  const jobs = getAllJobs();
  const newJob: Job = {
    ...jobData,
    id: `job-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  jobs.push(newJob);
  fs.writeFileSync(JOBS_FILE_PATH, JSON.stringify(jobs, null, 2), 'utf8');
  return newJob;
};

// Update existing job
export const updateJob = (id: string, updates: Partial<Job>): Job | null => {
  const jobs = getAllJobs();
  const jobIndex = jobs.findIndex(job => job.id === id);
  
  if (jobIndex === -1) {
    return null;
  }
  
  jobs[jobIndex] = {
    ...jobs[jobIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(JOBS_FILE_PATH, JSON.stringify(jobs, null, 2), 'utf8');
  return jobs[jobIndex];
};

// Delete job
export const deleteJob = (id: string): boolean => {
  const jobs = getAllJobs();
  const initialLength = jobs.length;
  const filteredJobs = jobs.filter(job => job.id !== id);
  
  if (filteredJobs.length === initialLength) {
    return false; // Job not found
  }
  
  fs.writeFileSync(JOBS_FILE_PATH, JSON.stringify(filteredJobs, null, 2), 'utf8');
  return true;
};

// Search jobs by criteria
export const searchJobs = (criteria: {
  department?: string;
  status?: string;
  shiftTypes?: string[];
  weekendRequired?: boolean;
}): Job[] => {
  const jobs = getAllJobs();
  
  return jobs.filter(job => {
    if (criteria.department && job.department !== criteria.department) return false;
    if (criteria.status && job.status !== criteria.status) return false;
    if (criteria.weekendRequired !== undefined && job.weekendRequired !== criteria.weekendRequired) return false;
    if (criteria.shiftTypes && !criteria.shiftTypes.some(shift => job.shiftTypes.includes(shift))) return false;
    
    return true;
  });
};
