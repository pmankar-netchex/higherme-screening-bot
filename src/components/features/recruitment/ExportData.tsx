'use client';

import { useState } from 'react';
import { Candidate, JobApplication, Job } from '../../../lib/types';
import { candidatesToCSV, candidatesToJSON, generateExportFilename, triggerDownload } from '../../../lib/utils/exportUtils';

interface ExportDataProps {
  candidates: Candidate[];
  applications?: JobApplication[];
  jobs?: Job[];
  buttonText?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function ExportData({ 
  candidates, 
  applications, 
  jobs, 
  buttonText = 'Export Data', 
  className = '',
  variant = 'primary'
}: ExportDataProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);

    try {
      let content = '';
      let mimeType = '';
      let filename = '';

      if (format === 'csv') {
        content = candidatesToCSV(candidates, applications, jobs);
        mimeType = 'text/csv;charset=utf-8;';
        filename = generateExportFilename('candidate_data', 'csv');
      } else {
        content = candidatesToJSON(candidates, applications, jobs);
        mimeType = 'application/json;charset=utf-8;';
        filename = generateExportFilename('candidate_data', 'json');
      }

      triggerDownload(content, filename, mimeType);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          variantClasses[variant]
        } ${className}`}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {buttonText}
          </>
        )}
      </button>

      {isExportMenuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="export-menu">
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
