import fs from 'fs';
import path from 'path';
import { Job } from '../../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

export class JobRepository {
  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readJobsFromFile(): Job[] {
    this.ensureDataDirectory();
    
    if (!fs.existsSync(JOBS_FILE)) {
      fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
      return [];
    }
    
    try {
      const rawData = fs.readFileSync(JOBS_FILE, 'utf-8');
      return JSON.parse(rawData) as Job[];
    } catch (error) {
      console.error('Error reading jobs file:', error);
      return [];
    }
  }

  private writeJobsToFile(jobs: Job[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    } catch (error) {
      console.error('Error writing jobs file:', error);
      throw error;
    }
  }

  findAll(): Job[] {
    return this.readJobsFromFile();
  }

  findById(id: string): Job | null {
    const jobs = this.readJobsFromFile();
    return jobs.find(job => job.id === id) || null;
  }

  findActive(): Job[] {
    const jobs = this.readJobsFromFile();
    return jobs.filter(job => job.status === 'active');
  }

  findByDepartment(department: string): Job[] {
    const jobs = this.readJobsFromFile();
    return jobs.filter(job => job.department === department);
  }

  create(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
    const jobs = this.readJobsFromFile();
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    jobs.push(newJob);
    this.writeJobsToFile(jobs);
    return newJob;
  }

  update(id: string, updates: Partial<Job>): Job | null {
    const jobs = this.readJobsFromFile();
    const index = jobs.findIndex(job => job.id === id);
    
    if (index === -1) {
      return null;
    }
    
    jobs[index] = {
      ...jobs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.writeJobsToFile(jobs);
    return jobs[index];
  }

  delete(id: string): boolean {
    const jobs = this.readJobsFromFile();
    const initialLength = jobs.length;
    const filteredJobs = jobs.filter(job => job.id !== id);
    
    if (filteredJobs.length < initialLength) {
      this.writeJobsToFile(filteredJobs);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const jobRepository = new JobRepository();
