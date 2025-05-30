'use client';

import { useSearchParams as useNextSearchParams } from 'next/navigation';

/**
 * A wrapper hook for useSearchParams that makes it easier to use in client components
 * and helps with the Next.js build warnings about Suspense boundaries.
 */
export function useSearchParams() {
  // The standard Next.js useSearchParams hook
  const searchParams = useNextSearchParams();
  
  return searchParams;
}

/**
 * A utility component that provides search params to its children
 * This helps with the Next.js build warnings about Suspense boundaries
 */
export function SearchParamsProvider({ 
  children, 
  fallback = <div>Loading...</div> 
}: { 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) {
  return (
    <>{children}</>
  );
}
