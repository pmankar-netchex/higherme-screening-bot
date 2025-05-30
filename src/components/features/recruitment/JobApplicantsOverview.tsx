'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Job, JobApplication, Candidate } from '../../../lib/types';

interface JobApplicantsOverviewProps {
  jobs: Job[];
  applications: JobApplication[];
  candidates: Candidate[];
}

export default function JobApplicantsOverview({ jobs, applications, candidates }: JobApplicantsOverviewProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  // Group applications by job
  const applicationsByJob = jobs.reduce<Record<string, JobApplication[]>>((acc, job) => {
    acc[job.id] = applications.filter(application => application.jobId === job.id);
    return acc;
  }, {});
  
  // Calculate statistics for each job
  const jobStats = jobs.map(job => {
    const jobApplications = applicationsByJob[job.id] || [];
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      status: job.status,
      totalApplicants: jobApplications.length,
      pending: jobApplications.filter(app => 
        app.status === 'submitted' || 
        app.status === 'screening_scheduled' || 
        app.status === 'screening_in_progress'
      ).length,
      completed: jobApplications.filter(app => 
        app.status === 'screening_completed' || 
        app.status === 'under_review' || 
        app.status === 'interview_scheduled' || 
        app.status === 'hired' || 
        app.status === 'rejected'
      ).length,
      hired: jobApplications.filter(app => app.status === 'hired').length,
      rejected: jobApplications.filter(app => app.status === 'rejected').length
    };
  });
  
  // Toggle expanded job view
  const toggleExpandJob = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Job Applicants Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Manage applications by position</p>
      </div>
      
      <div className="p-4">
        {jobStats.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Listed</h3>
            <p className="text-gray-500">Job postings will appear here once they are created.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobStats.map(job => (
              <div key={job.id} className="border rounded-lg overflow-hidden">
                <div 
                  onClick={() => toggleExpandJob(job.id)}
                  className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.department}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : job.status === 'closed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                        <span className="text-sm font-medium">{job.totalApplicants} applicant{job.totalApplicants !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedJobId === job.id ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {expandedJobId === job.id && (
                  <div className="p-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="border rounded-lg p-3 bg-blue-50">
                        <div className="text-sm text-blue-500">Total Applicants</div>
                        <div className="text-2xl font-bold text-blue-700">{job.totalApplicants}</div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-yellow-50">
                        <div className="text-sm text-yellow-500">Pending</div>
                        <div className="text-2xl font-bold text-yellow-700">{job.pending}</div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-green-50">
                        <div className="text-sm text-green-500">Hired</div>
                        <div className="text-2xl font-bold text-green-700">{job.hired}</div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-red-50">
                        <div className="text-sm text-red-500">Rejected</div>
                        <div className="text-2xl font-bold text-red-700">{job.rejected}</div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Candidate
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Application Date
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Screening
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {applicationsByJob[job.id]?.map(application => {
                            const candidate = candidates.find(c => c.id === application.candidateId);
                            
                            return (
                              <tr key={application.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {candidate?.email || 'No email'}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(application.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    application.status === 'hired' ? 'bg-green-100 text-green-800' :
                                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    application.status === 'under_review' ? 'bg-purple-100 text-purple-800' :
                                    application.status === 'screening_completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {application.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
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
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link 
                                    href={`/recruiter/candidate/${application.candidateId}?jobId=${job.id}&applicationId=${application.id}`}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                  >
                                    Details
                                  </Link>
                                </td>
                              </tr>
                            );
                          }) || (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                No applications for this position
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 text-right">
                      <Link 
                        href={`/recruiter/job/${job.id}/applicants`}
                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50"
                      >
                        View All Applicants
                        <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
