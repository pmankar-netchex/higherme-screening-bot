import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '../../../../../lib/services/application-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const applicationId = params.applicationId;
    const data = await request.json();
    
    // Get existing application
    const application = await applicationService.getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Update with allowed fields only
    const allowedFields = ['status', 'currentStep'];
    const updates: Record<string, any> = {};
    
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = data[key];
      }
    });
    
    // Update timeline if status is changed
    if (updates.status && updates.status !== application.status) {
      const timestamp = new Date().toISOString();
      const statusMap: Record<string, string> = {
        'screening_scheduled': 'screening_call_pending',
        'interview_scheduled': 'recruiter_review',
        'hired': 'process_complete',
        'rejected': 'process_complete'
      };
      
      // Add timeline entry
      if (!updates.timeline) {
        updates.timeline = [...application.timeline];
      }
      
      updates.timeline.push({
        step: statusMap[updates.status] || application.currentStep,
        status: 'completed',
        timestamp,
        notes: `Application status changed to ${updates.status.replace(/_/g, ' ')}`,
        performedBy: 'recruiter'
      });
    }
    
    // Update the application
    const updatedApplication = await applicationService.updateApplication(
      applicationId, 
      updates
    );
    
    return NextResponse.json({ 
      success: true, 
      data: updatedApplication 
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
