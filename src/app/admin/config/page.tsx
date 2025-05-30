import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the content component
const ConfigContent = dynamic(() => import('./config-content'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading configuration panel...</div>
});

export default function ConfigPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading configuration panel...</div>}>
      <ConfigContent />
    </Suspense>
  );
}
