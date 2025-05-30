'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';

interface ConfigBackupRestoreProps {
  onBackupComplete?: () => void;
  onRestoreComplete?: () => void;
}

export default function ConfigBackupRestore({ 
  onBackupComplete, 
  onRestoreComplete 
}: ConfigBackupRestoreProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleBackup = async () => {
    setIsBackingUp(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/config/backup');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create a Blob containing the config data
      const configBlob = new Blob(
        [JSON.stringify(data, null, 2)], 
        { type: 'application/json' }
      );
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `restaurant-recruitment-config-${date}.json`;
      
      // Download the file
      saveAs(configBlob, filename);
      
      setSuccess('Configuration backup downloaded successfully.');
      if (onBackupComplete) onBackupComplete();
    } catch (err) {
      console.error('Backup failed:', err);
      setError('Failed to backup configuration. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };
  
  const handleRestore = async () => {
    if (!selectedFile) {
      setError('Please select a configuration file to restore');
      return;
    }
    
    setIsRestoring(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Read the file contents
      const fileContent = await readFileAsText(selectedFile);
      
      // Validate JSON format
      let configData;
      try {
        configData = JSON.parse(fileContent);
      } catch (err) {
        throw new Error('Invalid configuration file format');
      }
      
      // Send to API for restoration
      const response = await fetch('/api/admin/config/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore configuration');
      }
      
      setSuccess('Configuration restored successfully!');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('configFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      if (onRestoreComplete) onRestoreComplete();
    } catch (err: any) {
      console.error('Restore failed:', err);
      setError(err.message || 'Failed to restore configuration. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };
  
  // Helper to read file content as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Configuration Backup & Restore</h2>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Backup Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download your current configuration settings as a JSON file. You can use this file later to restore your settings.
          </p>
          <button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
          >
            {isBackingUp ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Backup
              </>
            )}
          </button>
        </div>
        
        {/* Restore Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Restore Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Restore your settings from a previously downloaded configuration file.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuration File
            </label>
            <input
              id="configFile"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            onClick={handleRestore}
            disabled={isRestoring || !selectedFile}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300 flex items-center"
          >
            {isRestoring ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Restoring...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Restore Configuration
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t text-sm text-gray-500">
        <p className="flex items-center mb-1">
          <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <strong>Important:</strong> Restoring a configuration will overwrite all current settings.
        </p>
        <p className="ml-6">Make sure to backup your current configuration before restoring.</p>
      </div>
    </div>
  );
}
