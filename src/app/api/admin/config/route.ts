import { NextRequest, NextResponse } from 'next/server';

// In a real application, this would be stored in a database
let systemConfig = {
  applicationSettings: {
    allowOpenApplications: true,
    requireScreening: true,
    autoScheduleScreening: false,
    notifyRecruitersOnNewApplication: true
  },
  screeningSettings: {
    defaultScreeningDuration: 20,
    recordCalls: true,
    generateSummary: true,
    sendCandidateFollowup: true
  },
  recruitmentSettings: {
    hiringWorkflowSteps: [
      'Application Submission',
      'Resume Screening',
      'Phone Screening',
      'Hiring Manager Review',
      'Interview',
      'Offer / Rejection'
    ],
    notificationEmails: ['recruiters@restaurant.com', 'hiring@restaurant.com'],
    defaultApplicationDeadlineDays: 14
  },
  notificationTemplates: {
    applicationReceived: 'Dear {{candidateName}},\n\nThank you for applying to the {{position}} position at our restaurant. We have received your application and will review it shortly.\n\nBest regards,\nThe Recruitment Team',
    screeningInvitation: 'Dear {{candidateName}},\n\nWe would like to invite you to complete a brief AI screening call for the {{position}} position. Please click the link below to schedule your screening.\n\n{{screeningLink}}\n\nBest regards,\nThe Recruitment Team',
    screeningComplete: 'Dear {{candidateName}},\n\nThank you for completing the screening call for the {{position}} position. Our team will review your responses and get back to you soon.\n\nBest regards,\nThe Recruitment Team',
    interviewInvitation: 'Dear {{candidateName}},\n\nWe would like to invite you for an interview for the {{position}} position. Please choose a suitable time from the available slots.\n\n{{interviewLink}}\n\nBest regards,\nThe Recruitment Team',
    offerLetter: 'Dear {{candidateName}},\n\nWe are pleased to offer you the {{position}} position at our restaurant. Please find the details of our offer below:\n\n{{offerDetails}}\n\nBest regards,\nThe Recruitment Team',
    rejectionEmail: 'Dear {{candidateName}},\n\nThank you for your interest in the {{position}} position. After careful consideration, we have decided to pursue other candidates whose qualifications better match our needs at this time.\n\nWe appreciate your interest in our company and wish you success in your job search.\n\nBest regards,\nThe Recruitment Team'
  }
};

// GET handler - retrieve the current configuration
export async function GET() {
  try {
    // In a real application, this would be fetched from a database
    return NextResponse.json(systemConfig, { status: 200 });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

// POST handler - update the configuration
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid configuration data' },
        { status: 400 }
      );
    }
    
    // In a real application, you would validate each field properly
    // and save to a database
    
    // For now, just update our in-memory config
    systemConfig = {
      ...systemConfig,
      ...data
    };
    
    return NextResponse.json(
      { 
        message: 'Configuration updated successfully',
        config: systemConfig 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
