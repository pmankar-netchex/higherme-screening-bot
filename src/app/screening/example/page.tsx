'use client';

import React, { useState } from 'react';
import { UnifiedVoiceScreeningCall } from '../../../components/features/screening';
import { Job, Candidate } from '../../../lib/types';

export default function ScreeningCallPage({ 
  params 
}: { 
  params: { jobId: string; candidateId: string; applicationId: string } 
}) {
  const [callCompleted, setCallCompleted] = useState(false);
  const [callData, setCallData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Example job and candidate data - typically this would be fetched from your API
  const exampleJob: Job = {
    id: params.jobId,
    title: 'Front-End Developer',
    department: 'Engineering',
    description: 'We are looking for a skilled front-end developer with experience in React.',
    requirements: 'Experience with React, TypeScript, and modern frontend frameworks.',
    location: 'Remote',
    salary: '$80,000 - $120,000',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  
  const exampleCandidate: Candidate = {
    id: params.candidateId,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+15551234567',
    resumeUrl: '/uploads/resumes/john-smith-resume.pdf',
    experience: '5 years',
    education: 'Bachelor of Computer Science',
    skills: ['React', 'TypeScript', 'Node.js'],
    createdAt: new Date().toISOString(),
  };
  
  const handleCallStart = () => {
    console.log('Call started');
    setError(null);
  };
  
  const handleCallError = (error: Error) => {
    console.error('Call error:', error);
    setError(error.message);
  };
  
  const handleCallEnd = (data: any) => {
    console.log('Call ended with data:', data);
    setCallCompleted(true);
    setCallData(data);
  };
  
  const handleDataRetrieved = (data: any) => {
    console.log('Retrieved call data:', data);
    setCallData(data);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Voice Screening Call</h1>
      
      {/* Candidate and job information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Candidate</h2>
          <p className="mb-1">
            <span className="font-medium">Name:</span> {exampleCandidate.firstName} {exampleCandidate.lastName}
          </p>
          <p className="mb-1">
            <span className="font-medium">Email:</span> {exampleCandidate.email}
          </p>
          <p className="mb-1">
            <span className="font-medium">Phone:</span> {exampleCandidate.phone}
          </p>
          <p className="mb-1">
            <span className="font-medium">Experience:</span> {exampleCandidate.experience}
          </p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Job</h2>
          <p className="mb-1">
            <span className="font-medium">Title:</span> {exampleJob.title}
          </p>
          <p className="mb-1">
            <span className="font-medium">Department:</span> {exampleJob.department}
          </p>
          <p className="mb-1">
            <span className="font-medium">Location:</span> {exampleJob.location}
          </p>
          <p className="mb-1">
            <span className="font-medium">Requirements:</span> {exampleJob.requirements}
          </p>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {/* Voice screening call component */}
      <div className="mb-8">
        <UnifiedVoiceScreeningCall
          jobId={params.jobId}
          candidateId={params.candidateId}
          applicationId={params.applicationId}
          job={exampleJob}
          candidate={exampleCandidate}
          onCallStart={handleCallStart}
          onCallEnd={handleCallEnd}
          onCallError={handleCallError}
          onDataRetrieved={handleDataRetrieved}
          autoRetry={true}
          maxRetryAttempts={3}
          showDebugInfo={true} // Set to false in production
        />
      </div>
      
      {/* Post-call actions */}
      {callCompleted && callData && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Call Completed</h2>
          <p className="mb-4">The screening call has been completed and the results have been saved.</p>
          
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Full Transcript
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Schedule Follow-Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
