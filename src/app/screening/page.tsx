'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Components to load dynamically based on user role
const AdminScreeningContent = dynamic(
  () => import('../admin/screening/screening-content'),
  { 
    ssr: false,
    loading: () => <LoadingState message="Loading configuration..." />
  }
);

const RecruiterScreeningContent = dynamic(
  () => import('../recruiter/screening/screening-content'),
  { 
    ssr: false,
    loading: () => <LoadingState message="Loading screening data..." />
  }
);

const CandidateScreeningContent = dynamic(
  () => import('../../app/candidate/screening/screening-content').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => <LoadingState message="Loading screening session..." />
  }
);

// Loading state component
interface LoadingStateProps {
  message?: string;
}

function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div 
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  message: string;
  backUrl: string;
  backText: string;
}

function ErrorState({ message, backUrl, backText }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{message}</p>
            </div>
          </div>
        </div>
        <Link href={backUrl} className="text-blue-600 hover:text-blue-800">
          ← {backText}
        </Link>
      </div>
    </div>
  );
}

// Main component that uses search params
function ScreeningContent() {
  const searchParams = useSearchParams();
  const role = searchParams?.get('role') || '';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check user role and permissions
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // You could add a check to verify that the user has permission to access the requested role
        // For now, we just validate that the role parameter is valid
        if (role && !['admin', 'recruiter', 'candidate'].includes(role)) {
          setError('Invalid role specified');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Failed to verify access permissions');
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [role]);
  
  if (isLoading) {
    return <LoadingState message="Preparing screening interface..." />;
  }

  if (error) {
    return <ErrorState 
      message={error} 
      backUrl="/" 
      backText="Back to Dashboard" 
    />;
  }
  
  // Determine which content component to render based on role
  return (
    <>
      {role === 'admin' && <AdminScreeningContent />}
      {role === 'recruiter' && <RecruiterScreeningContent />}
      {role === 'candidate' && <CandidateScreeningContent />}
      {!role && (
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Welcome to Screening</h1>
          <p className="mb-6">Please select your role to continue:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/screening?role=candidate"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Candidate
            </Link>
            <Link 
              href="/screening?role=recruiter"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Recruiter
            </Link>
            <Link 
              href="/screening?role=admin"
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Admin
            </Link>
          </div>

          {/* Test Enhanced SDK Link */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Developer Tools</h2>
            <Link 
              href="/screening/test-enhanced"
              className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 inline-block"
            >
              Test Enhanced Vapi SDK
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Test the enhanced Vapi SDK features for audio links and screening summaries
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function ScreeningPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingState message="Loading screening interface..." />}>
          <ScreeningContent />
        </Suspense>
      </div>
    </div>
  );
}
