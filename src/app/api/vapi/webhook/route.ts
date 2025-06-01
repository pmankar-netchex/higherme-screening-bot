import { NextRequest, NextResponse } from 'next/server';
import { getAllScreenings, updateScreeningStatus } from '../../../../lib/services/screeningService';
import { updateApplicationStatus } from '../../../../lib/services/applicationService';

// POST /api/vapi/webhook - Handle VAPI webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate webhook event
    if (!body || !body.type) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    console.log('VAPI webhook received:', body.type, body);

    // Handle different VAPI event types
    switch (body.type) {
      case 'call-ended':
      case 'call-completed':
        return await handleCallCompleted(body);
      
      case 'call-failed':
      case 'call-error':
        return await handleCallFailed(body);
      
      default:
        console.log('Unhandled VAPI webhook event type:', body.type);
        return NextResponse.json({ success: true, message: 'Event ignored' });
    }
    
  } catch (error) {
    console.error('Error processing VAPI webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle call completion events
async function handleCallCompleted(webhookData: any) {
  const { callId, transcript, summary, duration, metadata } = webhookData;
  
  try {
    // Find the screening by call ID or metadata
    const screeningId = metadata?.screeningId || findScreeningByCallId(callId);
    
    if (!screeningId) {
      console.warn('No screening found for call ID:', callId);
      return NextResponse.json({ success: true, message: 'No screening found' });
    }

    // Update screening status to completed
    const updatedScreening = updateScreeningStatus(screeningId, 'screening_completed', {
      transcript: transcript || 'Call completed - transcript processing in progress',
      duration: duration || 0,
      completedAt: new Date().toISOString(),
      aiCallId: callId
    });

    if (!updatedScreening) {
      throw new Error('Failed to update screening status');
    }

    // If we have a summary from VAPI, process it immediately
    if (summary) {
      // Call our existing summary processing endpoint
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/screening/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screeningId,
          transcript: transcript || '',
          rawSummary: summary
        })
      });
    } else {
      // If no summary yet, it will be processed later or caught by our diagnostic tool
      console.warn('Call completed but no summary provided for screening:', screeningId);
    }

    // Update application status
    if (updatedScreening.applicationId) {
      updateApplicationStatus(
        updatedScreening.applicationId,
        'screening_completed',
        'screening_call_completed',
        'AI screening completed successfully via webhook',
        'system'
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Call completion processed',
      screeningId 
    });

  } catch (error) {
    console.error('Error handling call completion:', error);
    return NextResponse.json(
      { error: 'Failed to process call completion' },
      { status: 500 }
    );
  }
}

// Handle call failure events
async function handleCallFailed(webhookData: any) {
  const { callId, error, metadata } = webhookData;
  
  try {
    // Find the screening by call ID or metadata
    const screeningId = metadata?.screeningId || findScreeningByCallId(callId);
    
    if (!screeningId) {
      console.warn('No screening found for failed call ID:', callId);
      return NextResponse.json({ success: true, message: 'No screening found' });
    }

    // Update screening status to failed
    const errorMessage = error?.message || 'Call failed';
    const updatedScreening = updateScreeningStatus(screeningId, 'rejected', {
      errorMessage,
      transcript: 'Call failed - no transcript available',
      completedAt: new Date().toISOString(),
      aiCallId: callId
    });

    if (!updatedScreening) {
      throw new Error('Failed to update screening status');
    }

    // Important: Keep application in submitted state, not rejected
    // A failed call doesn't mean the candidate is rejected
    if (updatedScreening.applicationId) {
      updateApplicationStatus(
        updatedScreening.applicationId,
        'submitted',
        'screening_call_pending',
        `Screening call failed: ${errorMessage}. Manual review required.`,
        'system'
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Call failure processed',
      screeningId 
    });

  } catch (error) {
    console.error('Error handling call failure:', error);
    return NextResponse.json(
      { error: 'Failed to process call failure' },
      { status: 500 }
    );
  }
}

// Helper function to find screening by call ID
function findScreeningByCallId(callId: string): string | null {
  const allScreenings = getAllScreenings();
  
  // Look for screening with matching call ID in aiCallId field
  const screening = allScreenings.find(s => 
    s.aiCallId === callId
  );
  
  return screening?.id || null;
}

// GET method for webhook verification (if VAPI requires it)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const verifyToken = url.searchParams.get('verify_token');
  
  // Add your VAPI webhook verification logic here if needed
  // This is typically used to verify the webhook endpoint during setup
  
  return NextResponse.json({ 
    success: true, 
    message: 'VAPI webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}
