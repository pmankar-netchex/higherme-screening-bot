import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check if the application is healthy by verifying:
    // 1. Data directory exists and is accessible
    // 2. Required data files exist
    // 3. Upload directory is accessible

    const dataDir = path.join(process.cwd(), 'data');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');

    // Check data directory
    if (!fs.existsSync(dataDir)) {
      throw new Error('Data directory not found');
    }

    // Check required data files
    const requiredFiles = [
      'applications.json',
      'candidates.json',
      'jobs.json',
      'screenings.json',
      'config.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required data file missing: ${file}`);
      }
    }

    // Check uploads directory
    if (!fs.existsSync(uploadsDir)) {
      throw new Error('Uploads directory not found');
    }

    // Check if directories are writable
    fs.accessSync(dataDir, fs.constants.W_OK);
    fs.accessSync(uploadsDir, fs.constants.W_OK);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        dataDirectory: 'ok',
        dataFiles: 'ok',
        uploadsDirectory: 'ok',
        permissions: 'ok'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 });
  }
}
