'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { validateResumeFile, FileValidationError } from '../../../../lib/integrations/file-upload/fileUpload';

interface ResumeUploadProps {
  onFileSelected: (file: File) => void;
  onFileError?: (error: string) => void;
  className?: string;
}

export default function ResumeUpload({ onFileSelected, onFileError, className = '' }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Use the utility function to validate the file
    const validationErrors = validateResumeFile(file);
    
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors[0].message;
      setError(errorMessage);
      if (onFileError) onFileError(errorMessage);
      return false;
    }

    // File is valid
    setError(null);
    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelected(file);
      } else {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFileName(null);
      }
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelected(file);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div 
        className={`border-2 border-dashed rounded-md p-4 text-center transition-colors cursor-pointer
          ${error ? 'border-red-400 bg-red-50' : isDragging ? 'border-blue-400 bg-blue-50' : fileName ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        {fileName ? (
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-700 font-medium mb-1">{fileName}</p>
            <button 
              type="button" 
              className="text-xs text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Change file
            </button>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">
              Drop your resume here or <span className="text-blue-600 hover:text-blue-800 cursor-pointer">browse files</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, or DOCX (max 5MB)
            </p>
          </>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        onChange={handleFileChange}
      />
    </div>
  );
}
