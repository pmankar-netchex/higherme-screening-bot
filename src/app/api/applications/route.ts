import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  submittedAt: string;
  currentStep: string;
  timeline: Array<{
    step: string;
    status: string;
    timestamp: string;
    notes: string;
    performedBy: string;
  }>;
  feedback: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    
    // Read applications data
    const dataPath = path.join(process.cwd(), 'data', 'applications.json');
    const applicationsData = fs.readFileSync(dataPath, 'utf8');
    const applications: Application[] = JSON.parse(applicationsData);
    
    // Filter by candidateId if provided
    let filteredApplications = applications;
    if (candidateId) {
      filteredApplications = applications.filter(app => app.candidateId === candidateId);
    }
    
    return NextResponse.json({
      success: true,
      applications: filteredApplications,
      total: filteredApplications.length,
      candidateId: candidateId || null
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch applications',
        applications: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Read current applications
    const dataPath = path.join(process.cwd(), 'data', 'applications.json');
    const applicationsData = fs.readFileSync(dataPath, 'utf8');
    const applications: Application[] = JSON.parse(applicationsData);
    
    // Create new application
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      candidateId: body.candidateId,
      jobId: body.jobId,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      currentStep: 'application_submitted',
      timeline: [{
        step: 'application_submitted',
        status: 'completed',
        timestamp: new Date().toISOString(),
        notes: body.notes || 'Application submitted',
        performedBy: 'candidate'
      }],
      feedback: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to applications array
    applications.push(newApplication);
    
    // Save back to file
    fs.writeFileSync(dataPath, JSON.stringify(applications, null, 2));
    
    return NextResponse.json({
      success: true,
      application: newApplication
    });
    
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create application'
      },
      { status: 500 }
    );
  }
}