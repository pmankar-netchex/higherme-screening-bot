import { NextRequest, NextResponse } from 'next/server';
import { ScreeningCall, ApplicationStatus } from '../../../lib/types';
import { 
  readScreeningsFromFile,
  writeScreeningsToFile,
  updateScreeningStatus
} from '../../../lib/services/screeningService';

/**
 * API endpoint for browser-compatible screening operations
 * GET /api/screenings - Get all screenings
 * POST /api/screenings - Save all screenings (bulk update)
 */

// GET /api/screenings - Read all screening calls (browser-compatible)
export async function GET(request: NextRequest) {
  try {
    const screenings = readScreeningsFromFile();
    return NextResponse.json(screenings);
  } catch (error) {
    console.error('Error reading screenings:', error);
    return NextResponse.json(
      { error: 'Failed to read screenings' },
      { status: 500 }
    );
  }
}

// POST /api/screenings - Write all screenings (browser-compatible bulk update)
export async function POST(request: NextRequest) {
  try {
    const screenings: ScreeningCall[] = await request.json();
    
    // Validate that we received an array
    if (!Array.isArray(screenings)) {
      return NextResponse.json(
        { error: 'Request body must be an array of screening calls' },
        { status: 400 }
      );
    }
    
    writeScreeningsToFile(screenings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing screenings:', error);
    return NextResponse.json(
      { error: 'Failed to write screenings' },
      { status: 500 }
    );
  }
}

// PUT /api/screenings - Update a single screening by ID
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Screening ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status, ...additionalData } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required for screening update' },
        { status: 400 }
      );
    }
    
    const updatedScreening = updateScreeningStatus(id, status as ApplicationStatus, additionalData);
    
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
      { error: 'Failed to update screening' },
      { status: 500 }
    );
  }
}
