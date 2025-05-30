import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types for resumes
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export async function POST(request: NextRequest) {
  try {
    console.log('Received upload request');
    
    const formData = await request.formData();
    console.log('FormData received, keys:', Array.from(formData.keys()));
    
    const file = formData.get('resume');
    const candidateId = formData.get('candidateId') as string;
    
    console.log('FormData values:', { 
      fileExists: !!file, 
      fileType: file && typeof file === 'object' ? 'File object' : typeof file,
      candidateId 
    });

    // Validate file presence
    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Make sure it's actually a File object
    if (!(file instanceof File)) {
      console.error('Invalid file object type:', typeof file);
      return NextResponse.json(
        { error: 'Invalid file object received' },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate candidate ID
    if (!candidateId) {
      console.error('No candidate ID provided');
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, DOC, and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only .pdf, .doc, and .docx are allowed' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const filename = `${candidateId}_${timestamp}_${sanitizedFilename}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return success response with file info - includes both upload path and url for flexibility
    return NextResponse.json({
      success: true,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadPath: `/uploads/resumes/${filename}`,
      filePath: `/uploads/resumes/${filename}`, // For backward compatibility
      url: `/uploads/resumes/${filename}`,      // For backward compatibility
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return NextResponse.json(
      { error: `Failed to upload file: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
