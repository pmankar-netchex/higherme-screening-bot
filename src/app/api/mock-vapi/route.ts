import { NextRequest, NextResponse } from 'next/server';

// Mock data to simulate Vapi API responses
const mockCallData = {
  'mock-call-123': {
    id: 'mock-call-123',
    transcript: "Hello, I'm Alex Johnson. I have about 5 years of experience working as a Senior React Developer. I've led multiple projects using TypeScript, React, and Node.js. I'm proficient in frontend architecture and performance optimization. I've implemented design systems and worked closely with UI/UX teams. I'm looking for a role where I can apply my experience in a challenging environment. I'm available to start immediately and can work full-time in your office location.",
    summary: "The candidate has 5 years of experience as a Senior React Developer with expertise in TypeScript, React, and Node.js. They've led multiple projects and worked on frontend architecture and performance optimization. They're immediately available for full-time work.",
    artifact: {
      transcript: "Hello, I'm Alex Johnson. I have about 5 years of experience working as a Senior React Developer...",
      stereoRecordingUrl: "https://example.com/recordings/mock-stereo-123.mp3",
      recordingUrl: "https://example.com/recordings/mock-mono-123.mp3"
    },
    analysis: {
      summary: "Strong technical background with 5 years of React experience. Good communication skills and immediately available.",
      structuredData: {
        experience: "5 years as Senior React Developer",
        skills: ["React", "TypeScript", "Node.js"],
        availability: "Immediate",
        communication: "Strong and articulate"
      }
    }
  },
  'mock-call-456': {
    id: 'mock-call-456',
    transcript: "Hi, my name is Sarah Thompson. I've been working with JavaScript and React for about 3 years now. I'm currently a mid-level developer at TechCorp. I've worked on several e-commerce projects and have experience with state management libraries like Redux. I'm interested in this role because I want to grow my skills in a more challenging environment. I would need about 2 weeks notice before I could start.",
    summary: "Sarah Thompson has 3 years of experience with JavaScript and React as a mid-level developer at TechCorp. She has worked on e-commerce projects and has experience with Redux. She requires 2 weeks notice before starting.",
    artifact: {
      transcript: "Hi, my name is Sarah Thompson. I've been working with JavaScript and React for about 3 years now...",
      stereoRecordingUrl: "https://example.com/recordings/mock-stereo-456.mp3",
      recordingUrl: "https://example.com/recordings/mock-mono-456.mp3"
    },
    analysis: {
      summary: "Solid mid-level developer with 3 years of React experience. Good fit for the team with specific e-commerce background.",
      structuredData: {
        experience: "3 years as Mid-level Developer",
        skills: ["React", "JavaScript", "Redux"],
        availability: "2 weeks notice",
        communication: "Clear and concise"
      }
    }
  },
  'mock-call-789': {
    id: 'mock-call-789',
    transcript: "Hello, I'm Michael Chen. I recently graduated with a Computer Science degree and have about 1 year of internship experience with web development. I've worked with React and Angular in school projects and during my internship. I'm eager to learn and grow as a developer. I'm familiar with basic JavaScript, HTML, and CSS. I can start immediately and am flexible with working hours.",
    summary: "Michael Chen is a recent Computer Science graduate with 1 year of internship experience in web development. He has worked with React and Angular in school projects and internships. He's eager to learn and can start immediately.",
    artifact: {
      transcript: "Hello, I'm Michael Chen. I recently graduated with a Computer Science degree and have about 1 year of internship experience...",
      stereoRecordingUrl: "https://example.com/recordings/mock-stereo-789.mp3",
      recordingUrl: "https://example.com/recordings/mock-mono-789.mp3"
    },
    analysis: {
      summary: "Recent graduate with limited professional experience but good foundational knowledge. Shows enthusiasm and willingness to learn.",
      structuredData: {
        experience: "1 year internship",
        skills: ["React", "Angular", "JavaScript"],
        availability: "Immediate",
        communication: "Enthusiastic but needs development"
      }
    }
  }
};

// Mock API endpoint handler
export async function GET(
  request: NextRequest
) {
  // Parse URL to extract parameters
  const url = new URL(request.url);
  const callId = url.searchParams.get('callId');
  const mockDelay = parseInt(url.searchParams.get('delay') || '500');

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, mockDelay));

  // No call ID provided
  if (!callId) {
    return NextResponse.json(
      { error: 'Missing call ID parameter' },
      { status: 400 }
    );
  }

  // Check if we have mock data for this call ID
  if (mockCallData[callId as keyof typeof mockCallData]) {
    return NextResponse.json(mockCallData[callId as keyof typeof mockCallData]);
  }

  // For any other ID, determine if we should return a 404 or a processing state
  if (callId.includes('not-found')) {
    return NextResponse.json(
      { error: 'Call not found' },
      { status: 404 }
    );
  }

  if (callId.includes('processing')) {
    return NextResponse.json({
      id: callId,
      status: 'processing',
      message: 'Call is still being processed'
    });
  }

  // Random failure for testing error handling
  if (callId.includes('error')) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  // Default response - return as if call is still processing
  return NextResponse.json({
    id: callId,
    status: 'processing',
    message: 'Call data is not yet available'
  });
}
