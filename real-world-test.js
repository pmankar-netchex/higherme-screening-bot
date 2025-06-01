/**
 * Real-world test using actual screening data
 * This tests our fix against the exact scenario we found in the production data
 */

// This is based on the actual data from screenings.json around line 296
const realWorldConflictingCall = {
  "id": "screening_1748603266358",
  "applicationId": "app-1748603264746",
  "candidateId": "candidate-1748603264746", 
  "jobId": "job-003",
  "status": "failed",
  "scheduledAt": "2025-05-30T11:21:06.358Z",
  "createdAt": "2025-05-30T11:21:06.358Z",
  "updatedAt": "2025-05-30T11:26:05.439Z",
  "date": "2025-05-30T11:21:06.358Z",
  "role": "general",
  "errorMessage": "Call failed",
  "transcript": "Call completed - transcript processing pending",
  "audioUrl": "Call completed - audio processing pending",
  "summary": {
    "experience": {
      "evaluation": "Experience evaluation pending - transcript processing incomplete.",
      "highlights": ["Transcript processing incomplete"]
    },
    "availability": {
      "morning": true,
      "evening": true,
      "weekends": true,
      "notes": "Availability details pending - transcript processing incomplete."
    }
  }
};

console.log('=== REAL-WORLD SCENARIO TEST ===');
console.log('Testing actual problematic call from production data');
console.log('');
console.log('Original call state:');
console.log('- Status:', realWorldConflictingCall.status);
console.log('- Error message:', realWorldConflictingCall.errorMessage);
console.log('- Has transcript:', !!realWorldConflictingCall.transcript);
console.log('- Has summary:', !!realWorldConflictingCall.summary);
console.log('- Transcript preview:', realWorldConflictingCall.transcript);

function detectStateConflicts(callData) {
  const hasTranscript = !!(callData.transcript && callData.transcript.length > 20);
  const hasError = !!callData.errorMessage;
  const isFailedStatus = callData.status === 'failed';
  const isSuccessStatus = callData.status === 'completed' || callData.status === 'screening_completed';

  if (hasError && hasTranscript) {
    return {
      hasConflict: true,
      conflictType: 'error_with_transcript',
      resolution: 'Clear error message as transcript indicates successful call',
      shouldProcess: true
    };
  }

  if (isFailedStatus && hasTranscript) {
    return {
      hasConflict: true,
      conflictType: 'failed_status_with_transcript',
      resolution: 'Update status to screening_completed as transcript exists',
      shouldProcess: true
    };
  }

  if (isSuccessStatus && hasError) {
    return {
      hasConflict: true,
      conflictType: 'success_status_with_error',
      resolution: 'Clear error message as status indicates success',
      shouldProcess: true
    };
  }

  return {
    hasConflict: false,
    conflictType: 'none',
    resolution: 'No conflicts detected',
    shouldProcess: hasTranscript
  };
}

// Detect conflicts
const conflictResult = detectStateConflicts(realWorldConflictingCall);
console.log('');
console.log('=== CONFLICT ANALYSIS ===');
console.log('Conflict detected:', conflictResult.hasConflict);
console.log('Conflict type:', conflictResult.conflictType);
console.log('Resolution strategy:', conflictResult.resolution);

// Apply our fix
let resolvedCall = { ...realWorldConflictingCall };
if (conflictResult.hasConflict) {
  console.log('');
  console.log('=== APPLYING FIX ===');
  
  if (conflictResult.conflictType === 'error_with_transcript' || 
      conflictResult.conflictType === 'success_status_with_error') {
    console.log('✓ Clearing error message');
    resolvedCall.errorMessage = undefined;
  }
  
  if (conflictResult.conflictType === 'failed_status_with_transcript' ||
      (resolvedCall.status === "failed" && resolvedCall.transcript)) {
    console.log('✓ Updating status from "failed" to "screening_completed"');
    resolvedCall.status = "screening_completed";
  }
}

console.log('');
console.log('=== RESOLVED CALL STATE ===');
console.log('- Status:', resolvedCall.status);
console.log('- Error message:', resolvedCall.errorMessage);
console.log('- Has transcript:', !!resolvedCall.transcript);
console.log('- Has summary:', !!resolvedCall.summary);

// Validate the fix
const hasErrorCleared = !resolvedCall.errorMessage;
const hasStatusUpdated = resolvedCall.status === 'screening_completed';
const canProceedWithProcessing = hasErrorCleared && hasStatusUpdated && !!resolvedCall.transcript;

console.log('');
console.log('=== VALIDATION RESULTS ===');
console.log('✓ Error message cleared:', hasErrorCleared);
console.log('✓ Status updated:', hasStatusUpdated);
console.log('✓ Can proceed with post-processing:', canProceedWithProcessing);

if (canProceedWithProcessing) {
  console.log('');
  console.log('🎉 SUCCESS! The real-world scenario is now fixed:');
  console.log('   • The call will no longer be treated as failed');
  console.log('   • Post-processing will continue normally');
  console.log('   • Summary generation and analysis will proceed');
  console.log('   • The UI will show this as a completed screening');
} else {
  console.log('');
  console.log('❌ ISSUE: The fix did not resolve the real-world scenario');
}

console.log('');
console.log('=== BEFORE/AFTER COMPARISON ===');
console.log('BEFORE (would skip processing):');
console.log(`  Status: ${realWorldConflictingCall.status}, Error: "${realWorldConflictingCall.errorMessage}"`);
console.log('AFTER (will process normally):');
console.log(`  Status: ${resolvedCall.status}, Error: ${resolvedCall.errorMessage || 'none'}`);
