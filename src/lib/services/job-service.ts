import { Job } from '../types';
import { jobRepository } from '../data/repositories/job-repository';

export class JobService {
  async getAllJobs(): Promise<Job[]> {
    return jobRepository.findAll();
  }

  async getJobById(id: string): Promise<Job | null> {
    return jobRepository.findById(id);
  }

  async getActiveJobs(): Promise<Job[]> {
    return jobRepository.findActive();
  }

  async getJobsByDepartment(department: string): Promise<Job[]> {
    return jobRepository.findByDepartment(department);
  }

  async createJob(jobData: {
    title: string;
    department: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    shiftTypes: string[];
    weekendRequired: boolean;
    hourlyRate: string;
    status?: string;
  }): Promise<Job> {
    const newJobData = {
      ...jobData,
      status: jobData.status || 'active'
    };

    return jobRepository.create(newJobData);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    return jobRepository.update(id, updates);
  }

  async activateJob(id: string): Promise<Job | null> {
    return this.updateJob(id, { status: 'active' });
  }

  async deactivateJob(id: string): Promise<Job | null> {
    return this.updateJob(id, { status: 'inactive' });
  }

  async deleteJob(id: string): Promise<boolean> {
    return jobRepository.delete(id);
  }

  async searchJobs(searchTerm: string): Promise<Job[]> {
    const allJobs = await this.getAllJobs();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return allJobs.filter(job => 
      job.title.toLowerCase().includes(lowerSearchTerm) ||
      job.department.toLowerCase().includes(lowerSearchTerm) ||
      job.description.toLowerCase().includes(lowerSearchTerm)
    );
  }

  async getJobsByShiftType(shiftType: string): Promise<Job[]> {
    const allJobs = await this.getAllJobs();
    return allJobs.filter(job => job.shiftTypes.includes(shiftType));
  }

  async getJobsRequiringWeekends(): Promise<Job[]> {
    const allJobs = await this.getAllJobs();
    return allJobs.filter(job => job.weekendRequired);
  }
}

// Export singleton instance
export const jobService = new JobService();
