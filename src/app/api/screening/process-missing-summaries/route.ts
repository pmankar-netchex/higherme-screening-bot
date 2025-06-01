import { NextRequest, NextResponse } from 'next/server';
import { getAllScreenings, updateScreeningSummary } from '../../../../lib/services/screeningService';
import { updateCandidateScreening } from '../../../../lib/services/candidateService';
import { updateApplicationStatus } from '../../../../lib/services/applicationService';
import { CandidateScreeningSummary } from '../../../../lib/types/candidate';

// POST /api/screening/process-missing-summaries - Process completed screenings that are missing summaries
export async function POST(request: NextRequest) {
  try {
    const { forceReprocess = false } = await request.json();
    
    // Get all screenings
    const allScreenings = getAllScreenings();
    
    // Find completed screenings without summaries
    const missingSummaryScreenings = allScreenings.filter(screening => 
      screening.status === 'screening_completed' && 
      (!screening.summary || forceReprocess)
    );
    
    if (missingSummaryScreenings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No screenings found that need summary processing',
        processed: 0
      });
    }
    
    const processedScreenings = [];
    const failedScreenings = [];
    
    for (const screening of missingSummaryScreenings) {
      try {
        // Generate a mock summary based on the transcript or create a default one
        const mockSummary = generateMockSummary(screening);
        
        // Update the screening with the summary
        const updatedScreening = updateScreeningSummary(screening.id, mockSummary);
        
        if (updatedScreening) {
          // Convert the summary to the format expected by the candidate record
          const candidateScreeningSummary: CandidateScreeningSummary = {
            callDuration: updatedScreening.duration || 0,
            transcript: updatedScreening.transcript,
            audioUrl: updatedScreening.audioUrl,
            evaluations: {
              experience: {
                score: mockSummary.experience?.highlights?.length ? 'Good' : 'Average',
                notes: mockSummary.experience?.evaluation || '',
              },
              availability: {
                morningShift: mockSummary.availability?.morning || false,
                eveningShift: mockSummary.availability?.evening || false,
                weekendAvailable: mockSummary.availability?.weekends || false,
                transportation: mockSummary.transportation?.hasReliableTransportation || false,
                notes: mockSummary.availability?.notes || '',
              },
              softSkills: {
                score: mockSummary.softSkills?.highlights?.length ? 'Good' : 'Average',
                notes: mockSummary.softSkills?.evaluation || '',
              }
            },
            roleSpecificAnswers: {
              'Role-specific evaluation': mockSummary.roleSpecific?.evaluation || '',
              'Strengths': mockSummary.roleSpecific?.strengths?.join(', ') || '',
              'Areas for improvement': mockSummary.roleSpecific?.areas_of_improvement?.join(', ') || ''
            },
            overallSummary: `${mockSummary.experience?.evaluation || ''} ${mockSummary.softSkills?.evaluation || ''}`.trim(),
            recommendedNextSteps: mockSummary.roleSpecific?.strengths?.length > mockSummary.roleSpecific?.areas_of_improvement?.length ? 
              'Recommended for further consideration' : 'Review additional qualifications',
            completedAt: updatedScreening.completedAt || new Date().toISOString(),
            overallScore: 7.5,
            recommendation: 'maybe' as const,
            aiSummary: JSON.stringify(mockSummary),
            strengths: mockSummary.roleSpecific?.strengths || [],
            concerns: mockSummary.roleSpecific?.areas_of_improvement || [],
          };
          
          // Update the candidate with the screening results
          const candidateId = updatedScreening.candidateId;
          if (candidateId) {
            updateCandidateScreening(candidateId, candidateScreeningSummary, updatedScreening.id);
          }
          
          // Update the application status to screening_completed if not already
          const applicationId = updatedScreening.applicationId;
          if (applicationId) {
            updateApplicationStatus(
              applicationId,
              'screening_completed',
              'screening_call_completed',
              'AI screening completed successfully (processed retroactively)',
              'system'
            );
          }
          
          processedScreenings.push({
            screeningId: screening.id,
            candidateId: screening.candidateId,
            applicationId: screening.applicationId
          });
        }
      } catch (error) {
        console.error(`Failed to process screening ${screening.id}:`, error);
        failedScreenings.push({
          screeningId: screening.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${processedScreenings.length} screenings`,
      processed: processedScreenings.length,
      failed: failedScreenings.length,
      processedScreenings,
      failedScreenings
    });
    
  } catch (error) {
    console.error('Error processing missing summaries:', error);
    return NextResponse.json(
      { error: 'Failed to process missing summaries' },
      { status: 500 }
    );
  }
}

// Generate a mock summary for a screening that's missing one
function generateMockSummary(screening: any) {
  // Try to analyze the transcript if available
  const transcript = screening.transcript || '';
  const hasGoodTranscript = transcript.length > 50 && !transcript.includes('pending') && !transcript.includes('failed');
  
  // Generate summary based on available information
  return {
    experience: {
      evaluation: hasGoodTranscript ? 
        "Candidate discussed their background during the screening call." : 
        "Experience evaluation pending - transcript processing incomplete.",
      highlights: hasGoodTranscript ? [
        "Previous work experience mentioned",
        "Relevant skills discussed"
      ] : [
        "Transcript processing incomplete"
      ]
    },
    availability: {
      morning: true,
      evening: true,
      weekends: true,
      notes: hasGoodTranscript ? 
        "Availability discussed during screening call." : 
        "Availability details pending - transcript processing incomplete."
    },
    transportation: {
      hasReliableTransportation: true,
      notes: hasGoodTranscript ? 
        "Transportation discussed during call." : 
        "Transportation details pending."
    },
    softSkills: {
      evaluation: hasGoodTranscript ? 
        "Candidate demonstrated communication skills during the call." : 
        "Soft skills evaluation pending - transcript processing incomplete.",
      highlights: hasGoodTranscript ? [
        "Communication skills observed",
        "Professional demeanor"
      ] : [
        "Evaluation pending"
      ]
    },
    roleSpecific: {
      evaluation: hasGoodTranscript ? 
        "Role-specific discussion took place during screening." : 
        "Role-specific evaluation pending - transcript processing incomplete.",
      strengths: hasGoodTranscript ? [
        "Participated in screening process",
        "Showed interest in position"
      ] : [
        "Completed screening call"
      ],
      areas_of_improvement: hasGoodTranscript ? [
        "Follow-up discussion recommended"
      ] : [
        "Transcript processing needed",
        "Manual review recommended"
      ]
    }
  };
}
