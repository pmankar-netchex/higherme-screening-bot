// Server-side only data utilities for jobs
import fs from 'fs';
import path from 'path';
import type { Job } from '../types';

// Data file path
const JOBS_FILE = path.join(process.cwd(), 'data', 'jobs.json');

// Mock data for development
const mockJobs: Job[] = [
  {
    id: 'job-001',
    title: 'Senior Chef',
    department: 'Kitchen',
    description: 'Seeking an experienced senior chef to lead our kitchen team.',
    requirements: ['5+ years culinary experience', 'Leadership skills', 'French cuisine expertise'],
    responsibilities: ['Lead kitchen operations', 'Train junior staff', 'Manage food quality'],
    shiftTypes: ['morning', 'evening'],
    weekendRequired: true,
    hourlyRate: '$30-35/hour',
    status: 'active',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'job-002',
    title: 'Restaurant Manager',
    department: 'Management',
    description: 'Looking for a dynamic restaurant manager to oversee daily operations.',
    requirements: ['3+ years management experience', 'Customer service focus', 'POS system knowledge'],
    responsibilities: ['Oversee daily operations', 'Manage staff schedules', 'Handle customer complaints'],
    shiftTypes: ['morning', 'evening'],
    weekendRequired: true,
    hourlyRate: '$25-30/hour',
    status: 'active',
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-12T10:30:00Z'
  }
];

// Helper function to ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Helper function to read jobs from file
function readJobsFromFile(): Job[] {
  try {
    ensureDataDirectory();
    if (fs.existsSync(JOBS_FILE)) {
      const data = fs.readFileSync(JOBS_FILE, 'utf8');
      return JSON.parse(data);
    }
    // If file doesn't exist, create it with mock data
    fs.writeFileSync(JOBS_FILE, JSON.stringify(mockJobs, null, 2));
    return mockJobs;
  } catch (error) {
    console.error('Error reading jobs file:', error);
    return mockJobs;
  }
}

// Helper function to write jobs to file
function writeJobsToFile(jobs: Job[]) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error writing jobs file:', error);
  }
}

// Get all jobs
export function getAllJobs(): Job[] {
  return readJobsFromFile();
}

// Get job by ID
export function getJobById(id: string): Job | null {
  const jobs = readJobsFromFile();
  return jobs.find(job => job.id === id) || null;
}

// Get active jobs
export function getActiveJobs(): Job[] {
  const jobs = readJobsFromFile();
  return jobs.filter(job => job.status === 'active');
}

// Add new job
export function addJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
  const jobs = readJobsFromFile();
  const newJob: Job = {
    ...jobData,
    id: `job-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  jobs.push(newJob);
  writeJobsToFile(jobs);
  return newJob;
}

// Update job
export function updateJob(id: string, updates: Partial<Job>): Job | null {
  const jobs = readJobsFromFile();
  const index = jobs.findIndex(job => job.id === id);
  
  if (index === -1) {
    return null;
  }
  
  jobs[index] = {
    ...jobs[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  writeJobsToFile(jobs);
  return jobs[index];
}

// Delete job
export function deleteJob(id: string): boolean {
  const jobs = readJobsFromFile();
  const index = jobs.findIndex(job => job.id === id);
  
  if (index === -1) {
    return false;
  }
  
  jobs.splice(index, 1);
  writeJobsToFile(jobs);
  return true;
}

// Get job statistics
export function getJobStats() {
  const jobs = readJobsFromFile();
  
  return {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    inactive: jobs.filter(j => j.status === 'inactive').length,
    filled: jobs.filter(j => j.status === 'filled').length
  };
}
