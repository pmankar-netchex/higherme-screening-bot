import { NextRequest, NextResponse } from 'next/server';
import { candidateService } from '@/lib/services/candidate-service';
import { applicationService } from '@/lib/services/application-service';
import { Candidate, JobApplication } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the received data for debugging
    console.log('Received candidate data:', JSON.stringify(data));
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.jobId) {
      console.log('Missing required fields:', 
        !data.firstName ? 'firstName' : '',
        !data.lastName ? 'lastName' : '',
        !data.email ? 'email' : '',
        !data.phone ? 'phone' : '',
        !data.jobId ? 'jobId' : ''
      );
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create candidate
    console.log('Creating candidate with data:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      resumeUrl: data.resumeUrl || ''
    });
    
    const candidate = await candidateService.createCandidate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      resumeUrl: data.resumeUrl || '' // Ensure resumeUrl is handled even if it's not provided
    });
    
    console.log('Candidate created:', candidate);

    // Create application
    console.log('Creating application with data:', {
      candidateId: candidate.id,
      jobId: data.jobId,
      submittedAt: new Date().toISOString()
    });
    
    const application = await applicationService.createApplication({
      candidateId: candidate.id,
      jobId: data.jobId,
      submittedAt: new Date().toISOString()
    });
    
    console.log('Application created:', application);

    return NextResponse.json({ candidate, application });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const candidates = await candidateService.getAllCandidates();
    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
