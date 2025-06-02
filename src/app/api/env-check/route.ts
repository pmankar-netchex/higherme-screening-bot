import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check environment variables (but don't expose sensitive values)
  const hasPublicKey = !!process.env.NEXT_PUBLIC_VAPI_API_KEY;
  const hasPrivateKey = !!process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY;
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasPublicKey,
    hasPrivateKey,
    publicKeyPrefix: process.env.NEXT_PUBLIC_VAPI_API_KEY?.slice(0, 8) + '...' || 'undefined',
    timestamp: new Date().toISOString()
  });
}
