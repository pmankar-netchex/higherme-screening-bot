import { BaseEntity } from './common';

export interface Job extends BaseEntity {
  title: string;
  department: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  shiftTypes: string[];
  weekendRequired: boolean;
  hourlyRate: string;
  status: string;
}
