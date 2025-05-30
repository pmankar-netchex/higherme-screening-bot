import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus } from '../../../../lib/types';
import { updateScreeningStatus as updateStatus } from '../../../../lib/services/screeningService';

// POST /api/screening/status - Update screening call status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screeningId, status, ...additionalData } = body;
    
    if (!screeningId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the screening status using the service
    const updatedScreening = updateStatus(screeningId, status as ApplicationStatus, additionalData);
    
    if (!updatedScreening) {
      return NextResponse.json(
        { error: 'Screening not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedScreening);
  } catch (error) {
    console.error('Error updating screening status:', error);
    return NextResponse.json(
      { error: 'Failed to update screening status' },
      { status: 500 }
    );
  }
}
