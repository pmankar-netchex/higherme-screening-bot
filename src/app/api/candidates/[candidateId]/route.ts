import { NextRequest, NextResponse } from 'next/server';
import { getCandidateById, updateCandidate } from '../../../../lib/services/candidateService';

export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const candidateId = params.candidateId;
    
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    const candidate = getCandidateById(candidateId);
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const candidateId = params.candidateId;
    const data = await request.json();
    
    // Get existing candidate
    const candidate = getCandidateById(candidateId);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    // Update with allowed fields only
    const allowedFields = ['recruiterNotes', 'status'];
    const updates: Record<string, any> = {};
    
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = data[key];
      }
    });
    
    // Update the candidate
    const updatedCandidate = updateCandidate(candidateId, updates);
    
    return NextResponse.json({ 
      success: true, 
      data: updatedCandidate 
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}
