import { NextRequest, NextResponse } from 'next/server';
import { getAllScreenings } from '../../../../lib/services/screeningService';
import { getAllCandidates } from '../../../../lib/servers/candidates-server';
import { getAllJobs } from '../../../../lib/servers/jobs-server';

// This route requires query parameters, so it must be dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const screeningId = request.nextUrl.searchParams.get('id');

    if (!screeningId) {
      return NextResponse.json(
        { error: 'Screening ID is required' },
        { status: 400 }
      );
    }

    // Get all data
    const screenings = getAllScreenings();
    const candidates = getAllCandidates();
    const jobs = getAllJobs();
    
    // Find the specific screening
    const screening = screenings.find(s => s.id === screeningId);
    if (!screening) {
      return NextResponse.json(
        { error: 'Screening not found' },
        { status: 404 }
      );
    }
    
    // Find associated candidate and job
    const candidate = candidates.find(c => c.id === screening.candidateId);
    const job = jobs.find(j => j.id === screening.jobId);
    
    return NextResponse.json({
      screening,
      candidate: candidate || null,
      job: job || null
    });
  } catch (error) {
    console.error('Error fetching screening details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
