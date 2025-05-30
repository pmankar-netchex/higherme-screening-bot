import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the content component
const ScreeningContent = dynamic(() => import('./screening-content'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading configuration...</div>
});

export default function ScreeningConfigPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading configuration...</div>}>
      <ScreeningContent />
    </Suspense>
  );
}
