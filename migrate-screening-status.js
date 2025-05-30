#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the mapping from old status values to ApplicationStatus values
const statusMapping = {
  'scheduled': 'screening_scheduled',
  'in_progress': 'screening_in_progress', 
  'completed': 'screening_completed',
  'failed': 'rejected'
};

// Path to the screenings data file
const screeningsFilePath = path.join(__dirname, 'data', 'screenings.json');

function migrateScreeningStatus() {
  try {
    console.log('Starting screening status migration...');
    
    // Read the current data
    const rawData = fs.readFileSync(screeningsFilePath, 'utf-8');
    const screenings = JSON.parse(rawData);
    
    console.log(`Found ${screenings.length} screening records to migrate`);
    
    let migrationCount = 0;
    
    // Update each screening record
    const updatedScreenings = screenings.map(screening => {
      const oldStatus = screening.status;
      
      if (statusMapping[oldStatus]) {
        screening.status = statusMapping[oldStatus];
        screening.updatedAt = new Date().toISOString();
        migrationCount++;
        console.log(`Migrated screening ${screening.id}: ${oldStatus} -> ${screening.status}`);
      } else if (!['screening_scheduled', 'screening_in_progress', 'screening_completed', 'submitted', 'under_review', 'interview_scheduled', 'interview_completed', 'hired', 'rejected', 'withdrawn'].includes(oldStatus)) {
        console.warn(`Unknown status "${oldStatus}" for screening ${screening.id}, setting to screening_scheduled`);
        screening.status = 'screening_scheduled';
        screening.updatedAt = new Date().toISOString();
        migrationCount++;
      }
      
      return screening;
    });
    
    // Write the updated data back to the file
    fs.writeFileSync(screeningsFilePath, JSON.stringify(updatedScreenings, null, 2));
    
    console.log(`Migration completed! Updated ${migrationCount} out of ${screenings.length} screening records.`);
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateScreeningStatus();
