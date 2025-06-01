#!/usr/bin/env node

/**
 * Screening Call Limits Demo
 * 
 * This script demonstrates how the enhanced screening call limit system works
 * in practice with real-world scenarios.
 */

const fs = require('fs');
const path = require('path');

// Demo data
const DEMO_APPLICATION_ID = 'app-restaurant-manager-001';
const DEMO_CANDIDATE_ID = 'candidate-john-doe';
const DEMO_JOB_ID = 'job-restaurant-manager-downtown';

// Import our utility functions (simplified versions)
const SCREENINGS_FILE = path.join(__dirname, 'data', 'screenings.json');

function readScreeningsFromFile() {
  try {
    if (!fs.existsSync(SCREENINGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(SCREENINGS_FILE, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeScreeningsToFile(screenings) {
  try {
    const dir = path.dirname(SCREENINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SCREENINGS_FILE, JSON.stringify(screenings, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

function hasReachedScreeningCallLimit(applicationId, maxCalls = 1) {
  const screenings = readScreeningsFromFile();
  const completedCount = screenings.filter(
    s => s.applicationId === applicationId && s.status === 'screening_completed'
  ).length;
  return completedCount >= maxCalls;
}

function isRetryAllowed(applicationId, maxRetries = 1) {
  const screenings = readScreeningsFromFile();
  const appScreenings = screenings.filter(s => s.applicationId === applicationId);
  
  if (appScreenings.length === 0) return true;
  if (appScreenings.some(s => s.status === 'screening_completed')) return false;
  
  const rejectedCount = appScreenings.filter(s => 
    s.status === 'rejected' || 
    (s.errorMessage && s.status !== 'screening_in_progress')
  ).length;
  
  return rejectedCount <= maxRetries;
}

function getScreeningHistory(applicationId) {
  const screenings = readScreeningsFromFile();
  return screenings.filter(s => s.applicationId === applicationId);
}

function createScreening(applicationId, candidateId, jobId, status, errorMessage = null) {
  const screening = {
    id: `screening-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    applicationId,
    candidateId,
    jobId,
    status,
    errorMessage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: status === 'screening_in_progress' ? new Date().toISOString() : null,
    completedAt: status === 'screening_completed' ? new Date().toISOString() : null
  };
  
  const screenings = readScreeningsFromFile();
  screenings.push(screening);
  writeScreeningsToFile(screenings);
  return screening;
}

function printStatus(scenario) {
  console.log(`\n📋 ${scenario}`);
  console.log('─'.repeat(50));
  
  const history = getScreeningHistory(DEMO_APPLICATION_ID);
  const hasReachedLimit = hasReachedScreeningCallLimit(DEMO_APPLICATION_ID);
  const retryAllowed = isRetryAllowed(DEMO_APPLICATION_ID);
  
  console.log(`📊 Screening History (${history.length} total):`);
  history.forEach((screening, index) => {
    const statusIcon = screening.status === 'screening_completed' ? '✅' : 
                      screening.status === 'rejected' ? '❌' : '⏳';
    console.log(`  ${index + 1}. ${statusIcon} ${screening.status}${screening.errorMessage ? ` (${screening.errorMessage})` : ''}`);
  });
  
  console.log(`\n🚦 Current Status:`);
  console.log(`   • Call limit reached: ${hasReachedLimit ? '❌ YES' : '✅ NO'}`);
  console.log(`   • Retry allowed: ${retryAllowed ? '✅ YES' : '❌ NO'}`);
  
  // Decision logic
  if (hasReachedLimit) {
    console.log(`\n💡 Decision: 🚫 BLOCK - Application already successfully screened`);
  } else if (!retryAllowed) {
    console.log(`\n💡 Decision: 🚫 BLOCK - Retry limit exceeded`);
  } else {
    console.log(`\n💡 Decision: ✅ ALLOW - New call or retry permitted`);
  }
}

function runDemo() {
  console.log('🎬 Screening Call Limits Demo');
  console.log('='.repeat(60));
  console.log('This demo shows how the screening call limit system works');
  console.log('with different scenarios that might occur in real usage.');
  
  // Clear any existing data
  writeScreeningsToFile([]);
  
  // Scenario 1: Fresh application
  printStatus('Scenario 1: Fresh Application (No Previous Calls)');
  
  // Scenario 2: First call fails
  createScreening(DEMO_APPLICATION_ID, DEMO_CANDIDATE_ID, DEMO_JOB_ID, 'rejected', 'Network connection lost');
  printStatus('Scenario 2: First Call Failed (Network Issue)');
  
  // Scenario 3: Second call also fails
  createScreening(DEMO_APPLICATION_ID, DEMO_CANDIDATE_ID, DEMO_JOB_ID, 'rejected', 'Call interrupted by user');
  printStatus('Scenario 3: Second Call Failed (User Interrupted)');
  
  // Scenario 4: Third call would exceed retry limit
  printStatus('Scenario 4: Attempting Third Call (Should Be Blocked)');
  
  // Reset for successful scenario
  writeScreeningsToFile([]);
  
  // Scenario 5: First call succeeds
  createScreening(DEMO_APPLICATION_ID, DEMO_CANDIDATE_ID, DEMO_JOB_ID, 'screening_completed');
  printStatus('Scenario 5: First Call Successful');
  
  // Scenario 6: Attempting second call after success
  printStatus('Scenario 6: Attempting Second Call After Success (Should Be Blocked)');
  
  // Reset for mixed scenario
  writeScreeningsToFile([]);
  
  // Scenario 7: Mixed history
  createScreening(DEMO_APPLICATION_ID, DEMO_CANDIDATE_ID, DEMO_JOB_ID, 'rejected', 'Page navigation');
  createScreening(DEMO_APPLICATION_ID, DEMO_CANDIDATE_ID, DEMO_JOB_ID, 'screening_completed');
  createScreening(DEMO_APPLICATION_ID, DEMO_CANDIDATE_ID, DEMO_JOB_ID, 'rejected', 'Another attempt after success');
  printStatus('Scenario 7: Mixed History (Failure → Success → Attempt)');
  
  console.log('\n🎯 Key Takeaways:');
  console.log('─'.repeat(50));
  console.log('✅ Only COMPLETED screenings count toward the limit');
  console.log('🔄 Failed calls allow retries (up to configured limit)');
  console.log('🚫 Once successfully screened, no more calls allowed');
  console.log('⚡ System prevents retry abuse with configurable limits');
  console.log('🧹 Clear separation between call limits and retry limits');
  
  // Clean up
  writeScreeningsToFile([]);
  console.log('\n🧹 Demo data cleaned up.');
}

if (require.main === module) {
  console.log('Demo script starting...');
  try {
    runDemo();
    console.log('Demo completed successfully');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

module.exports = { runDemo };
