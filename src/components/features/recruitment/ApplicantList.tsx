'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { JobApplication, Job, Candidate } from '../../../lib/types';
import { getStatusDisplayInfo, getStatusBadgeClasses } from '../../../lib/utils/statusManager';

interface ApplicantListProps {
  applications: JobApplication[];
  candidates: Candidate[];
  jobs: Job[];
  showJobInfo?: boolean;
}

export default function ApplicantList({ 
  applications, 
  candidates, 
  jobs, 
  showJobInfo = true 
}: ApplicantListProps) {
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [screeningFilter, setScreeningFilter] = useState<string>('all');

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        // Apply status filter
        if (statusFilter !== 'all' && app.status !== statusFilter) {
          return false;
        }
        
        // Apply job filter
        if (jobFilter !== 'all' && app.jobId !== jobFilter) {
          return false;
        }
        
        // Apply screening filter
        if (screeningFilter !== 'all') {
          if (screeningFilter === 'completed' && !['screening_completed'].includes(app.status)) {
            return false;
          }
          if (screeningFilter === 'pending' && !['submitted', 'screening_scheduled', 'screening_in_progress'].includes(app.status)) {
            return false;
          }
          if (screeningFilter === 'not_started' && (app.status.includes('screening') || app.status === 'hired' || app.status === 'rejected')) {
            return false;
          }
        }
        
        // Apply search term filter
        if (searchTerm) {
          const candidate = candidates.find(c => c.id === app.candidateId);
          if (!candidate) return false;
          
          const job = jobs.find(j => j.id === app.jobId);
          if (!job) return false;
          
          const searchFields = [
            candidate.firstName,
            candidate.lastName,
            candidate.email,
            job.title,
            app.status
          ].map(field => field?.toLowerCase() || '');
          
          const normalizedSearchTerm = searchTerm.toLowerCase();
          return searchFields.some(field => field.includes(normalizedSearchTerm));
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'createdAt') {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortField === 'name') {
          const candidateA = candidates.find(c => c.id === a.candidateId);
          const candidateB = candidates.find(c => c.id === b.candidateId);
          const nameA = candidateA ? `${candidateA.lastName}, ${candidateA.firstName}` : '';
          const nameB = candidateB ? `${candidateB.lastName}, ${candidateB.firstName}` : '';
          return sortDirection === 'asc' 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        } else if (sortField === 'status') {
          return sortDirection === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        }
        return 0;
      });
  }, [applications, candidates, jobs, statusFilter, jobFilter, screeningFilter, searchTerm, sortField, sortDirection]);

  // Handle sort toggle
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">All Applicants</h2>
        <p className="text-gray-500 text-sm mt-1">Filter and review all job applications</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="screening_scheduled">Screening Scheduled</option>
              <option value="screening_in_progress">Screening In Progress</option>
              <option value="screening_completed">Screening Completed</option>
              <option value="under_review">Under Review</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="job-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              id="job-filter"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Positions</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="screening-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Screening Status
            </label>
            <select
              id="screening-filter"
              value={screeningFilter}
              onChange={(e) => setScreeningFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Screening Statuses</option>
              <option value="completed">Screening Completed</option>
              <option value="pending">Screening Pending</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or position..."
                className="block w-full border-gray-300 rounded-md pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Tags - show active filters */}
        <div className="mt-3 flex flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
              Status: {statusFilter.replace(/_/g, ' ')}
              <button 
                onClick={() => setStatusFilter('all')} 
                className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {jobFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
              Position: {jobs.find(j => j.id === jobFilter)?.title || jobFilter}
              <button 
                onClick={() => setJobFilter('all')} 
                className="ml-1.5 inline-flex text-green-400 hover:text-green-600 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {screeningFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
              Screening: {screeningFilter.replace(/_/g, ' ')}
              <button 
                onClick={() => setScreeningFilter('all')} 
                className="ml-1.5 inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
              Search: "{searchTerm}"
              <button 
                onClick={() => setSearchTerm('')} 
                className="ml-1.5 inline-flex text-purple-400 hover:text-purple-600 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {(statusFilter !== 'all' || jobFilter !== 'all' || screeningFilter !== 'all' || searchTerm) && (
            <button 
              onClick={() => {
                setStatusFilter('all');
                setJobFilter('all');
                setScreeningFilter('all');
                setSearchTerm('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Applicants List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortToggle('name')}
              >
                <div className="flex items-center">
                  Candidate
                  {sortField === 'name' && (
                    <svg className={`ml-1 w-4 h-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
              {showJobInfo && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application Date
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortToggle('status')}  
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'status' && (
                    <svg className={`ml-1 w-4 h-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Screening
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.length > 0 ? (
              filteredApplications.map(application => {
                const candidate = candidates.find(c => c.id === application.candidateId);
                const job = jobs.find(j => j.id === application.jobId);
                
                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {candidate?.email || 'No email'}
                      </div>
                    </td>
                    {showJobInfo && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {job?.title || 'Unknown Position'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {job?.department || 'Unknown Department'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(application.status)}`}>
                        {getStatusDisplayInfo(application.status).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.status === 'screening_completed' ? (
                        <span className="text-green-600 flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      ) : application.status === 'screening_in_progress' ? (
                        <span className="text-yellow-600 flex items-center">
                          <svg className="w-5 h-5 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          In Progress
                        </span>
                      ) : application.status === 'screening_scheduled' ? (
                        <span className="text-blue-600 flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Scheduled
                        </span>
                      ) : (
                        <span className="text-gray-500">Not started</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/recruiter/candidate/${application.candidateId}?jobId=${application.jobId}&applicationId=${application.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showJobInfo ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-500">No applications match your search criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination would go here in a real app */}
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </div>
    </div>
  );
}
