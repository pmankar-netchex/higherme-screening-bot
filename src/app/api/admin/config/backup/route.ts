import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the config file
const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json');

// Get the full current configuration (from file system)
function getFullConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log('Config file does not exist, creating default config');
      // Return a default configuration if file doesn't exist
      return {
        roles: {},
        mandatoryQuestions: [],
        vapiSettings: {},
        applicationSettings: {}
      };
    }
    
    const configStr = fs.readFileSync(CONFIG_FILE, 'utf8');
    
    if (!configStr.trim()) {
      console.log('Config file is empty, returning default config');
      return {
        roles: {},
        mandatoryQuestions: [],
        vapiSettings: {},
        applicationSettings: {}
      };
    }
    
    return JSON.parse(configStr);
  } catch (error) {
    console.error('Error reading config file:', error);
    // Return default config instead of throwing
    return {
      roles: {},
      mandatoryQuestions: [],
      vapiSettings: {},
      applicationSettings: {}
    };
  }
}

export async function GET() {
  try {
    // Read the current configuration from file
    const config = getFullConfig();
    
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}
