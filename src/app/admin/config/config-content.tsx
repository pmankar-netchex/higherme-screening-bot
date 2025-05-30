'use client';

import Link from 'next/link';
import AdminConfigPanel from '@/components/features/admin/AdminConfigPanel';

export default function ConfigContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            System Configuration
          </h1>
          <p className="text-gray-600">
            Configure application settings, screening options, and recruitment workflows.
          </p>
        </div>
        
        {/* Config Panel */}
        <AdminConfigPanel />
      </div>
    </div>
  );
}
