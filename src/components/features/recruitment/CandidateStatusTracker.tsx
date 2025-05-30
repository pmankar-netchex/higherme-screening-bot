'use client';

import { useState, useEffect, useMemo } from 'react';
import { JobApplication, ApplicationStatus } from '../../../lib/types';
import { Candidate } from '../../../lib/types';
import { Job } from '../../../lib/types';
import { getStatusDisplayInfo, getStatusBadgeClasses } from '../../../lib/utils/statusManager';
import Link from 'next/link';

interface CandidateStatusTrackerProps {
  applications: JobApplication[];
  candidates: Candidate[];
  jobs: Job[];
}

interface StatusGroup {
  status: string;
  label: string;
  color: string;
  count: number;
  icon: React.ReactNode;
  applications: JobApplication[];
}

export default function CandidateStatusTracker({ 
  applications, 
  candidates, 
  jobs 
}: CandidateStatusTrackerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Define status groups
  const statusGroups = useMemo(() => {
    const groups: StatusGroup[] = [
      {
        status: 'submitted',
        label: 'New Applications',
        color: 'blue',
        count: 0,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        applications: []
      },
      {
        status: 'screening',
        label: 'Screening Process',
        color: 'yellow',
        count: 0,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a2 2 0 012-2h2a2 2 0 012 2v6a3 3 0 01-3 3z" />
          </svg>
        ),
        applications: []
      },
      {
        status: 'review',
        label: 'Under Review',
        color: 'purple',
        count: 0,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        applications: []
      },
      {
        status: 'interview',
        label: 'Interview Process',
        color: 'indigo',
        count: 0,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        applications: []
      },
      {
        status: 'hired',
        label: 'Hired',
        color: 'green',
        count: 0,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        applications: []
      },
      {
        status: 'rejected',
        label: 'Rejected',
        color: 'red',
        count: 0,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        applications: []
      }
    ];
    
    // Group applications by status
    applications.forEach(app => {
      const status = app.status as ApplicationStatus;
      
      if (status === 'submitted') {
        groups[0].applications.push(app);
        groups[0].count++;
      } 
      else if (status === 'screening_scheduled' || status === 'screening_in_progress' || status === 'screening_completed') {
        groups[1].applications.push(app);
        groups[1].count++;
      }
      else if (status === 'under_review') {
        groups[2].applications.push(app);
        groups[2].count++;
      }
      else if (status === 'interview_scheduled') {
        groups[3].applications.push(app);
        groups[3].count++;
      }
      else if (status === 'hired') {
        groups[4].applications.push(app);
        groups[4].count++;
      }
      else if (status === 'rejected' || status === 'withdrawn') {
        groups[5].applications.push(app);
        groups[5].count++;
      }
    });
    
    return groups;
  }, [applications]);
  
  // Get filtered applications based on selected status and search term
  const filteredApplications = useMemo(() => {
    if (!selectedStatus) return [];
    
    const statusGroup = statusGroups.find(group => group.status === selectedStatus);
    if (!statusGroup) return [];
    
    if (!searchTerm) return statusGroup.applications;
    
    // Filter applications by search term
    return statusGroup.applications.filter(app => {
      const candidate = candidates.find(c => c.id === app.candidateId);
      const job = jobs.find(j => j.id === app.jobId);
      
      if (!candidate || !job) return false;
      
      const searchFields = [
        candidate.firstName,
        candidate.lastName,
        candidate.email,
        job.title,
        app.status
      ].map(field => field?.toLowerCase() || '');
      
      const normalizedSearchTerm = searchTerm.toLowerCase();
      return searchFields.some(field => field.includes(normalizedSearchTerm));
    });
  }, [selectedStatus, statusGroups, searchTerm, candidates, jobs]);

  // Helper function to get candidate and job info
  const getCandidateAndJobInfo = (app: JobApplication) => {
    const candidate = candidates.find(c => c.id === app.candidateId);
    const job = jobs.find(j => j.id === app.jobId);
    return { candidate, job };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Candidate Status Tracker</h2>
        <p className="text-gray-500 text-sm mt-1">Track and manage candidates through each stage of the hiring process</p>
      </div>
      
      {/* Status groups */}
      <div className="px-6 py-4 bg-gray-50 flex flex-wrap gap-4">
        {statusGroups.map((group) => (
          <button
            key={group.status}
            onClick={() => setSelectedStatus(group.status === selectedStatus ? null : group.status)}
            className={`flex items-center p-3 rounded-lg border transition-all ${
              selectedStatus === group.status 
                ? `bg-${group.color}-100 border-${group.color}-400 ring-2 ring-${group.color}-400 ring-opacity-50` 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`p-2 rounded-full bg-${group.color}-100 text-${group.color}-600`}>
              {group.icon}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{group.label}</p>
              <p className="text-xl font-semibold text-gray-900">{group.count}</p>
            </div>
          </button>
        ))}
      </div>
      
      {/* Selected applications list */}
      {selectedStatus && (
        <div className="p-6">
          {/* Search box */}
          <div className="mb-4">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates..."
                className="block w-full border-gray-300 rounded-md pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Applications list */}
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map(app => {
                    const { candidate, job } = getCandidateAndJobInfo(app);
                    
                    return (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {candidate?.email || 'No email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {job?.title || 'Unknown Position'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {job?.department || 'Unknown Department'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(app.status)}`}>
                            {getStatusDisplayInfo(app.status).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link 
                            href={`/recruiter/candidate/${app.candidateId}?applicationId=${app.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try different search terms or filters.' : 'No applications in this status.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
