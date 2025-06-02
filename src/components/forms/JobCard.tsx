import Link from 'next/link';
import { Job } from '../../lib/types';

interface JobCardProps {
  job: Job;
  showDetailsLink?: boolean;
  compact?: boolean;
}

export default function JobCard({ job, showDetailsLink = false, compact = false }: JobCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group ${
      compact ? 'p-4' : 'p-6'
    }`}>
      {/* Job Header */}
      <div className={`${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 group-hover:text-blue-900 transition-colors`}>
              {job.title}
            </h2>
            <div className="flex items-center text-gray-500 text-xs mt-1">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.status === 'active' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {job.status === 'active' ? '🟢 Hiring Now' : '⚫ Closed'}
          </span>
        </div>
        
        {/* Job Details Grid */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium">{job.department}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-sm font-semibold text-green-700">{job.hourlyRate}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{job.shiftTypes.join(', ')} shifts</span>
          </div>
          
          {job.weekendRequired && (
            <div className="flex items-center text-amber-600 bg-amber-50 rounded px-2 py-1">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">Weekend availability required</span>
            </div>
          )}
        </div>
      </div>

      {/* Job Description */}
      {!compact && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {job.description}
          </p>
        </div>
      )}

      {/* Requirements and Responsibilities */}
      <div className={`${compact ? 'mb-4' : 'mb-6'} space-y-4`}>
        {/* Key Requirements */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Requirements:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {job.requirements.slice(0, compact ? 2 : 3).map((req, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-400 mr-2 flex-shrink-0 mt-0.5">•</span>
                <span>{req}</span>
              </li>
            ))}
            {job.requirements.length > (compact ? 2 : 3) && (
              <li className="text-gray-500 text-xs mt-1 pl-4">
                +{job.requirements.length - (compact ? 2 : 3)} more requirements
              </li>
            )}
          </ul>
        </div>

        {/* Key Responsibilities - Show preview */}
        {!compact && job.responsibilities && job.responsibilities.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              You'll be doing:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {job.responsibilities.slice(0, 2).map((resp, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2 flex-shrink-0 mt-0.5">•</span>
                  <span>{resp}</span>
                </li>
              ))}
              {job.responsibilities.length > 2 && (
                <li className="text-gray-500 text-xs mt-1 pl-4">
                  +{job.responsibilities.length - 2} more responsibilities
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        {job.status === 'active' ? (
          <>
            <Link 
              href={`/candidate/apply/${job.id}`}
              className="block w-full bg-blue-600 text-white text-center px-4 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors group-hover:bg-blue-700"
            >
              🚀 Apply Now
            </Link>
            {showDetailsLink && (
              <Link
                href={`/candidate/jobs/${job.id}`}
                className="block w-full border border-gray-300 text-gray-700 text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                View Full Details
              </Link>
            )}
          </>
        ) : (
          <button 
            disabled
            className="block w-full bg-gray-300 text-gray-500 text-center px-4 py-2.5 rounded-md text-sm font-medium cursor-not-allowed"
          >
            ❌ Position Closed
          </button>
        )}
      </div>
    </div>
  );
}
