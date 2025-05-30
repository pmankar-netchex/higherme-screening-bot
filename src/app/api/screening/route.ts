import { NextRequest, NextResponse } from 'next/server';
import { ScreeningCall, ApplicationStatus } from '../../../lib/types';
import { 
  getAllScreenings, 
  createScreening,
  updateScreening,
  updateScreeningStatus,
  getScreeningsByFilters
} from '../../../lib/services/screeningService';

// GET /api/screening - List all screening calls or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const jobId = searchParams.get('jobId');
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status') as ApplicationStatus;
    
    // If no filters provided, return all screenings
    if (!candidateId && !jobId && !applicationId && !status) {
      const screenings = getAllScreenings();
      return NextResponse.json(screenings);
    }
    
    // Apply filters using the service
    const screenings = getScreeningsByFilters({
      candidateId: candidateId || undefined,
      jobId: jobId || undefined,
      applicationId: applicationId || undefined,
      status: status || undefined
    });
    
    return NextResponse.json(screenings);
  } catch (error) {
    console.error('Error fetching screenings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screenings' },
      { status: 500 }
    );
  }
}

// POST /api/screening - Create a new screening call record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { applicationId, candidateId, jobId } = body;
    
    if (!applicationId || !candidateId || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, candidateId, jobId' },
        { status: 400 }
      );
    }
    
    // Extract additional data (everything except the required fields)
    const { applicationId: _, candidateId: __, jobId: ___, ...additionalData } = body;
    
    // Create new screening using the service
    const newScreening = createScreening(
      applicationId,
      candidateId,
      jobId,
      additionalData
    );
    
    return NextResponse.json(newScreening, { status: 201 });
  } catch (error) {
    console.error('Error creating screening:', error);
    return NextResponse.json(
      { error: 'Failed to create screening record' },
      { status: 500 }
    );
  }
}

// PUT /api/screening/:id - Update screening call status and data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const screeningId = params.id;
    const body = await request.json();
    
    // Update the screening using the service
    const updatedScreening = updateScreening(screeningId, body);
    
    if (!updatedScreening) {
      return NextResponse.json(
        { error: 'Screening not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedScreening);
  } catch (error) {
    console.error('Error updating screening:', error);
    return NextResponse.json(
      { error: 'Failed to update screening record' },
      { status: 500 }
    );
  }
}

// PATCH /api/screening/:id/summary - Add or update the screening summary
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const screeningId = params.id;
    const body = await request.json();
    
    if (!body.summary) {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      );
    }
    
    // Update just the summary using the service
    const updatedScreening = updateScreening(screeningId, { 
      summary: body.summary 
    });
    
    if (!updatedScreening) {
      return NextResponse.json(
        { error: 'Screening not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedScreening);
  } catch (error) {
    console.error('Error updating screening summary:', error);
    return NextResponse.json(
      { error: 'Failed to update screening summary' },
      { status: 500 }
    );
  }
}
