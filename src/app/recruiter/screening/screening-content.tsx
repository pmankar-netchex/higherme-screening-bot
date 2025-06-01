'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ScreeningCall, Candidate, Job, ScreeningSummary } from '@/lib/types';

interface ScreeningPageData {
  screenings: ScreeningCall[];
  candidates: Candidate[];
  jobs: Job[];
}

export default function ScreeningContent() {
  const [data, setData] = useState<ScreeningPageData>({ screenings: [], candidates: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [fetchingResults, setFetchingResults] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        if (candidateId) params.append('candidateId', candidateId);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);

        const [screeningsRes, candidatesRes, jobsRes] = await Promise.all([
          fetch(`/api/screening?${params.toString()}`),
          fetch('/api/candidates'),
          fetch('/api/jobs')
        ]);

        if (!screeningsRes.ok || !candidatesRes.ok || !jobsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [screenings, candidates, jobs] = await Promise.all([
          screeningsRes.json(),
          candidatesRes.json(),
          jobsRes.json()
        ]);

        setData({ screenings, candidates, jobs });
      } catch (error) {
        console.error('Error fetching screening data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateId, selectedStatus]);

  // Find candidate and job information for a screening
  const findAssociatedData = (screening: ScreeningCall) => {
    const candidate = data.candidates.find(c => c.id === screening.candidateId);
    const job = data.jobs.find(j => j.id === screening.jobId);
    return { candidate, job };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fetch latest screening results
  const fetchLatestResults = async () => {
    setFetchingResults(true);
    setFetchError(null);
    
    try {
      const params = new URLSearchParams();
      if (candidateId) params.append('candidateId', candidateId);
      
      const response = await fetch(`/api/applications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setApplications(result.applications);
        // Optionally refresh screening data as well
        const screeningsRes = await fetch(`/api/screening?${params.toString()}`);
        if (screeningsRes.ok) {
          const screeningsData = await screeningsRes.json();
          setData(prev => ({ ...prev, screenings: screeningsData }));
        }
      } else {
        setFetchError(result.error || 'Failed to fetch results');
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch latest results');
      console.error('Error fetching latest results:', err);
    } finally {
      setFetchingResults(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/recruiter" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Voice Screening Sessions
          </h1>
          <p className="text-gray-600">
            Review and manage automated voice screening sessions and their results.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
              <option value="all">All Sessions</option>
              <option value="screening_completed">Screening Completed</option>
              <option value="screening_scheduled">Scheduled</option>
              <option value="screening_in_progress">In Progress</option>
              <option value="rejected">Failed</option>
            </select>
          </div>
        </div>
        
        {/* Fetch Results Button */}
        <div className="mb-4">
          <button
            onClick={fetchLatestResults}
            disabled={fetchingResults}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchingResults ? (
              <>
                <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Fetching...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Fetch Latest Screening Results
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{fetchError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Applications Results */}
        {applications.length > 0 && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Latest Results Fetched Successfully
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Found {applications.length} application(s) for {candidateId ? `candidate ${candidateId}` : 'all candidates'}.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-2 text-gray-600">Loading screening data...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Results */}
            {data.screenings.length > 0 ? (
              <div className="bg-white shadow overflow-hidden rounded-lg">
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
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.screenings.map((screening) => {
                      const { candidate, job } = findAssociatedData(screening);
                      
                      return (
                        <tr key={screening.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidate?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{job?.title || 'Unknown Position'}</div>
                            <div className="text-sm text-gray-500">{job?.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(screening.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${screening.status === 'screening_completed' ? 'bg-green-100 text-green-800' : 
                                screening.status === 'screening_scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                                screening.status === 'screening_in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'}`}>
                              {screening.status === 'screening_completed' ? 'Screening Completed' : 
                               screening.status === 'screening_scheduled' ? 'Scheduled' : 
                               screening.status === 'screening_in_progress' ? 'In Progress' :
                               screening.status === 'rejected' ? 'Failed' :
                               screening.status.charAt(0).toUpperCase() + screening.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {screening.status === 'screening_completed' && screening.score !== undefined ? (
                              <div className="text-sm text-gray-900">
                                <span className={`font-semibold ${
                                  screening.score >= 8 ? 'text-green-600' : 
                                  screening.score >= 5 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {screening.score}/10
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link href={`/recruiter/screening/details?id=${screening.id}`} className="text-blue-600 hover:text-blue-900">
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
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No screening sessions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {candidateId ? "This candidate hasn't participated in any screenings yet." : "No screenings match your current filters."}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
