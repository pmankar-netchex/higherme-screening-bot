import { NextRequest, NextResponse } from 'next/server';
import { getAllScreenings } from '../../../../lib/services/screeningService';
import { updateCandidateScreening, getCandidateById } from '../../../../lib/services/candidateService';

// Function to parse markdown summary and extract availability data
function parseMarkdownSummary(markdownSummary: string) {
  if (!markdownSummary) {
    return {};
  }

  const summary = markdownSummary.toLowerCase();

  // Extract availability information
  const availability = {
    morningShift: false,
    eveningShift: false,
    weekendAvailable: false,
    transportation: false,
    notes: ''
  };

  // Check for morning shift availability
  if (
    summary.includes('available only for morning') ||
    (summary.includes('morning shift') && !summary.includes('not available') && !summary.includes('unavailable'))
  ) {
    availability.morningShift = true;
  }

  // Check for evening shift availability
  if (
    summary.includes('available for evening') ||
    (summary.includes('evening shift') && !summary.includes('not available') && !summary.includes('unavailable'))
  ) {
    availability.eveningShift = true;
  }

  // Check for weekend availability
  if (
    summary.includes('willing to work weekends') ||
    summary.includes('available weekends') ||
    (summary.includes('weekends') && !summary.includes('not available') && !summary.includes('unavailable'))
  ) {
    availability.weekendAvailable = true;
  }

  // Check for transportation
  if (
    summary.includes('has personal vehicle') ||
    summary.includes('own car') ||
    summary.includes('reliable transportation') ||
    summary.includes('has transportation')
  ) {
    availability.transportation = true;
  }

  // Extract availability notes from the availability section
  const availabilityMatch = markdownSummary.match(/## 2\. Availability\s*([\s\S]*?)(?=##|$)/i);
  if (availabilityMatch) {
    availability.notes = availabilityMatch[1].trim().replace(/^-\s*/gm, '').trim();
  }

  return { availability };
}

// POST /api/screening/fix-summaries - Fix screening summaries by parsing markdown content
export async function POST(request: NextRequest) {
  try {
    const { candidateId, forceReprocess = false } = await request.json();
    
    // Get all screenings or filter by candidate
    const allScreenings = getAllScreenings();
    const targetScreenings = candidateId 
      ? allScreenings.filter(s => s.candidateId === candidateId)
      : allScreenings;

    // Find completed screenings with summary text but incorrect structured data
    const screeningsToFix = targetScreenings.filter(screening => {
      if (screening.status !== 'screening_completed' || !screening.summary) {
        return false;
      }

      // Check if we have a candidate with screening data that might be incorrect
      if (candidateId) {
        const candidate = getCandidateById(candidateId);
        if (!candidate?.screeningSummary) return false;
        
        // Check if availability data seems incorrect (all false) but summary mentions availability
        const availability = candidate.screeningSummary.evaluations?.availability;
        if (availability && 
            !availability.morningShift && 
            !availability.eveningShift && 
            !availability.weekendAvailable && 
            !availability.transportation) {
          // Check if the summary text mentions any availability
          const summaryText = screening.summary.toLowerCase();
          if (summaryText.includes('morning') || summaryText.includes('weekend') || summaryText.includes('vehicle') || summaryText.includes('transportation')) {
            return true;
          }
        }
      }
      
      return forceReprocess;
    });

    if (screeningsToFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No screenings found that need summary fixing',
        processed: 0
      });
    }

    const processedScreenings = [];
    const failedScreenings = [];

    for (const screening of screeningsToFix) {
      try {
        const candidateId = screening.candidateId;
        const candidate = getCandidateById(candidateId);
        
        if (!candidate?.screeningSummary) {
          failedScreenings.push({
            screeningId: screening.id,
            error: 'No existing screening summary found'
          });
          continue;
        }

        // Parse the markdown summary and update the structured data
        const parsedData = parseMarkdownSummary(screening.summary);
        
        const updatedSummary = {
          ...candidate.screeningSummary,
          evaluations: {
            ...candidate.screeningSummary.evaluations,
            availability: {
              ...candidate.screeningSummary.evaluations.availability,
              ...parsedData.availability
            }
          }
        };

        // Update the candidate with the corrected screening results
        updateCandidateScreening(candidateId, updatedSummary, screening.id);

        processedScreenings.push({
          screeningId: screening.id,
          candidateId: candidateId,
          updatedFields: parsedData.availability
        });

      } catch (error) {
        console.error(`Error processing screening ${screening.id}:`, error);
        failedScreenings.push({
          screeningId: screening.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedScreenings.length} screenings`,
      processed: processedScreenings.length,
      failed: failedScreenings.length,
      details: {
        processed: processedScreenings,
        failed: failedScreenings
      }
    });

  } catch (error) {
    console.error('Error fixing screening summaries:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix screening summaries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
