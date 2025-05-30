import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the config file
const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json');

// Validate config structure to ensure it has the expected format
function validateConfig(config: any): boolean {
  if (typeof config !== 'object' || config === null) {
    return false;
  }
  
  // Check for required top-level keys (these should match your config structure)
  const requiredKeys = ['roles'];
  for (const key of requiredKeys) {
    if (!config[key]) {
      return false;
    }
  }
  
  // If we're validating a system config, check for other required sections
  if ('applicationSettings' in config) {
    // These should match the structure in api/admin/config/route.ts
    if (!config.screeningSettings || !config.recruitmentSettings || !config.notificationTemplates) {
      return false;
    }
  }
  
  return true;
}

// Save the config to file
function saveConfig(config: any): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing config file:', error);
    throw new Error('Failed to save configuration');
  }
}

// Create a backup before restoring
function createBackup(): void {
  try {
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const backupPath = path.join(process.cwd(), 'data', `config.backup.${timestamp}.json`);
    
    if (fs.existsSync(CONFIG_FILE)) {
      fs.copyFileSync(CONFIG_FILE, backupPath);
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    // Continue anyway, just log the error
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // Validate the uploaded config
    if (!validateConfig(config)) {
      return NextResponse.json(
        { error: 'Invalid configuration format' },
        { status: 400 }
      );
    }
    
    // Create a backup of the current config
    createBackup();
    
    // Save the new config
    saveConfig(config);
    
    return NextResponse.json({ success: true, message: 'Configuration restored successfully' });
  } catch (error: any) {
    console.error('Error restoring config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to restore configuration' },
      { status: 500 }
    );
  }
}
