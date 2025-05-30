import { NextRequest, NextResponse } from 'next/server';
import { ScreeningSummary } from '../../../../lib/types/screening';
import { CandidateScreeningSummary } from '../../../../lib/types/candidate';
import { updateScreeningSummary, getScreeningById } from '../../../../lib/services/screeningService';
import { updateCandidateScreening } from '../../../../lib/services/candidateService';
import { updateApplicationStatus } from '../../../../lib/services/applicationService';

// POST /api/screening/summary - Update a screening call summary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screeningId, summary } = body;
    
    if (!screeningId || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the screening with the summary
    const updatedScreening = updateScreeningSummary(screeningId, summary);
    
    if (!updatedScreening) {
      return NextResponse.json(
        { error: 'Screening not found' },
        { status: 404 }
      );
    }

    // Convert the summary to the format expected by the candidate record
    const candidateScreeningSummary: CandidateScreeningSummary = {
      callDuration: updatedScreening.duration || 0,
      transcript: updatedScreening.transcript,
      audioUrl: updatedScreening.audioUrl,
      evaluations: {
        experience: {
          score: summary.experience?.highlights?.length ? 'Good' : 'Average',
          notes: summary.experience?.evaluation || '',
        },
        availability: {
          morningShift: summary.availability?.morning || false,
          eveningShift: summary.availability?.evening || false,
          weekendAvailable: summary.availability?.weekends || false,
          transportation: summary.transportation?.hasReliableTransportation || false,
          notes: summary.availability?.notes || '',
        },
        softSkills: {
          score: summary.softSkills?.highlights?.length ? 'Good' : 'Average',
          notes: summary.softSkills?.evaluation || '',
        }
      },
      roleSpecificAnswers: {
        'Role-specific evaluation': summary.roleSpecific?.evaluation || '',
      },
      overallSummary: `${summary.experience?.evaluation || ''} ${summary.softSkills?.evaluation || ''}`.trim(),
      recommendedNextSteps: summary.roleSpecific?.strengths?.length > summary.roleSpecific?.areas_of_improvement?.length ? 
        'Recommended for further consideration' : 'Review additional qualifications',
      completedAt: updatedScreening.completedAt || new Date().toISOString(),
      overallScore: 7.5,
      recommendation: 'maybe' as const,
      aiSummary: JSON.stringify(summary),
      strengths: summary.roleSpecific?.strengths || [],
      concerns: summary.roleSpecific?.areas_of_improvement || [],
    };
    
    // Update the candidate with the screening results
    const candidateId = updatedScreening.candidateId;
    if (candidateId) {
      updateCandidateScreening(candidateId, candidateScreeningSummary, updatedScreening.id);
    }
    
    // Update the application status to screening_completed
    const applicationId = updatedScreening.applicationId;
    if (applicationId) {
      updateApplicationStatus(
        applicationId,
        'screening_completed',
        'screening_call_completed',
        'AI screening completed successfully',
        'system'
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
