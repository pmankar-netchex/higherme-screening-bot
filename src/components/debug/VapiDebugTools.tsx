'use client';

import React from 'react';
import VapiCallMonitor from '../debug/VapiCallMonitor';

/**
 * VapiDebugTools - A component that adds debugging tools for Vapi calls
 * 
 * This component can be conditionally added to your layout to help debug Vapi calls.
 * It's recommended to only include this in development or testing environments.
 */
export default function VapiDebugTools() {
  // Can be controlled by an environment variable or query parameter
  const showDebugTools = 
    process.env.NEXT_PUBLIC_SHOW_VAPI_DEBUG === 'true' || 
    (typeof window !== 'undefined' && window.location.search.includes('vapiDebug=true'));
  
  if (!showDebugTools) {
    return null;
  }
  
  return (
    <>
      <VapiCallMonitor 
        position="bottom-right" 
        expanded={false} 
      />
    </>
  );
}
