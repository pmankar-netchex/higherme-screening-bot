/**
 * Unified Vapi.ai configuration for restaurant recruitment platform screening calls
 * Supports both client-side and server-side usage with dynamic config loading
 */

import { ScreeningRole } from '../../types';

// Server-side imports (only available in Node.js environment)
let fs: any, path: any;
try {
  if (typeof window === 'undefined') {
    fs = require('fs');
    path = require('path');
  }
} catch (error) {
  // Silently fail in browser environment
}

// Configuration for the Vapi.ai assistant
export interface VapiConfig {
  voice: {
    provider: string;
    voiceId: string;
  };
  model: {
    provider: string;
    model: string;
  };
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
  conversationTone: string;
  maxCallDuration: number;
  customSystemPrompt?: string;
  customAnalysisPrompt?: string;
}

// Default Vapi configuration
export const DEFAULT_VAPI_CONFIG: VapiConfig = {
  voice: {
    provider: 'playht',
    voiceId: 'jennifer'
  },
  model: {
    provider: 'openai',
    model: 'gpt-4'
  },
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en-US'
  },
  conversationTone: 'friendly and professional',
  maxCallDuration: 180 // 3 minutes
};

// Default mandatory questions (fallback values for client-side usage)
export const MANDATORY_QUESTIONS = [
  'Are you available to work morning shifts (6 AM - 2 PM)?',
  'Are you available to work evening shifts (2 PM - 10 PM)?',
  'Can you work weekends?',
  'Do you have reliable transportation to get to work?'
];

// Server-side function to get mandatory questions from config (when available)
export function getMandatoryQuestions(): string[] {
  // Return static questions if in browser or if fs/path not available
  if (typeof window !== 'undefined' || !fs || !path) {
    return MANDATORY_QUESTIONS;
  }

  try {
    // Read from config.json (server-side only)
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Check if mandatory questions exist in config
      if (config.mandatoryQuestions && Array.isArray(config.mandatoryQuestions)) {
        return config.mandatoryQuestions;
      }
    }
  } catch (error) {
    console.error('Error reading mandatory questions from config:', error);
  }
  
  // Fallback to default questions
  return MANDATORY_QUESTIONS;
}

// Server-side function to get conversation tone from config (when available)
export function getConversationTone(): string {
  // Return default tone if in browser or if fs/path not available
  if (typeof window !== 'undefined' || !fs || !path) {
    return DEFAULT_VAPI_CONFIG.conversationTone;
  }

  try {
    // Read from config.json (server-side only)
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Check if vapiSettings and conversationTone exist in config
      if (config.vapiSettings && config.vapiSettings.conversationTone) {
        return config.vapiSettings.conversationTone;
      }
    }
  } catch (error) {
    console.error('Error reading conversation tone from config:', error);
  }
  
  // Fallback to default tone
  return DEFAULT_VAPI_CONFIG.conversationTone;
}

// Server-side function to get custom system prompt from config (when available)
export function getCustomSystemPrompt(): string | undefined {
  // Return undefined if in browser or if fs/path not available
  if (typeof window !== 'undefined' || !fs || !path) {
    return undefined;
  }

  try {
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.vapiSettings && config.vapiSettings.customSystemPrompt) {
        return config.vapiSettings.customSystemPrompt;
      }
    }
  } catch (error) {
    console.error('Error reading custom system prompt from config:', error);
  }
  return undefined;
}

// Server-side function to get custom analysis prompt from config (when available)
export function getCustomAnalysisPrompt(): string | undefined {
  // Return undefined if in browser or if fs/path not available
  if (typeof window !== 'undefined' || !fs || !path) {
    return undefined;
  }

  try {
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.vapiSettings && config.vapiSettings.customAnalysisPrompt) {
        return config.vapiSettings.customAnalysisPrompt;
      }
    }
  } catch (error) {
    console.error('Error reading custom analysis prompt from config:', error);
  }
  return undefined;
}

// Server-side function to get Vapi settings from config (when available)
export function getVapiSettings(): VapiConfig {
  // Return default config if in browser or if fs/path not available
  if (typeof window !== 'undefined' || !fs || !path) {
    return DEFAULT_VAPI_CONFIG;
  }

  try {
    // Read from config.json (server-side only)
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Check if vapiSettings exist in config
      if (config.vapiSettings) {
        return {
          voice: config.vapiSettings.voice || DEFAULT_VAPI_CONFIG.voice,
          model: config.vapiSettings.model || DEFAULT_VAPI_CONFIG.model,
          transcriber: config.vapiSettings.transcriber || DEFAULT_VAPI_CONFIG.transcriber,
          conversationTone: config.vapiSettings.conversationTone || DEFAULT_VAPI_CONFIG.conversationTone,
          maxCallDuration: config.vapiSettings.maxCallDuration || DEFAULT_VAPI_CONFIG.maxCallDuration,
          customSystemPrompt: config.vapiSettings.customSystemPrompt,
          customAnalysisPrompt: config.vapiSettings.customAnalysisPrompt
        };
      }
    }
  } catch (error) {
    console.error('Error reading Vapi settings from config:', error);
  }
  
  // Fallback to default config
  return DEFAULT_VAPI_CONFIG;
}

// Generate role-specific questions based on the job role with server-side config support
export function getRoleSpecificQuestions(roleType: ScreeningRole): string[] {
  // Try to read from config first (server-side only)
  if (typeof window === 'undefined' && fs && path) {
    try {
      const configPath = path.join(process.cwd(), 'data', 'config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Check if role-specific questions exist in config
        if (config.roleSpecificQuestions && config.roleSpecificQuestions[roleType]) {
          return config.roleSpecificQuestions[roleType];
        }
      }
    } catch (error) {
      console.error('Error reading role-specific questions from config:', error);
    }
  }

  // Fallback to default questions if config is not available or an error occurs
  switch (roleType) {
    case 'server':
      return [
        'How would you handle a difficult customer situation?',
        'Do you have experience with point-of-sale systems?',
        'How do you prioritize tasks during busy service periods?'
      ];
    case 'cook':
      return [
        'What types of cuisine do you have experience preparing?',
        'How do you ensure food safety and proper handling?',
        'How do you handle high-pressure cooking environments?'
      ];
    case 'host':
      return [
        'What customer service experience do you have?',
        'How do you handle stressful situations with customers?',
        'Are you comfortable using computer systems for reservations?'
      ];
    case 'manager':
      return [
        'Tell me about your experience managing restaurant staff',
        'How do you handle scheduling and staff conflicts?',
        'What strategies do you use to improve customer satisfaction?'
      ];
    default:
      return [
        'What experience do you have that is relevant to this position?',
        'What are your strengths in a fast-paced work environment?',
        'How would you contribute to a positive team atmosphere?'
      ];
  }
}

// Generate the system prompt for the AI assistant
export function generateScreeningSystemPrompt(
  jobTitle: string, 
  roleType: ScreeningRole,
  roleSpecificQuestions: string[],
  conversationTone: string = DEFAULT_VAPI_CONFIG.conversationTone,
  customSystemPrompt?: string
): string {
  // If custom system prompt is provided, use it with variable substitution
  if (customSystemPrompt) {
    return customSystemPrompt
      .replace(/\{jobTitle\}/g, jobTitle)
      .replace(/\{roleType\}/g, roleType)
      .replace(/\{conversationTone\}/g, conversationTone)
      .replace(/\{roleSpecificQuestions\}/g, roleSpecificQuestions.join('\n- '));
  }

  // Default system prompt
  return `You are an AI assistant conducting a screening interview for a ${jobTitle} position at a restaurant. 
Your goal is to assess the candidate's experience, availability, and fit for the role in a ${conversationTone} manner.

IMPORTANT GUIDELINES:
- Keep the conversation brief (2-3 minutes) and focused on gathering key information.
- Use a ${conversationTone} tone throughout the conversation.
- Ask questions directly and one at a time, waiting for responses.
- Do not provide evaluative feedback to the candidate during the call.
- Do not make hiring decisions or tell the candidate if they are qualified.
- Collect information about their experience, availability, and specific requirements for the role.
- End the call professionally by thanking them and explaining next steps.

REQUIRED INFORMATION TO COLLECT:
1. Relevant experience for the ${jobTitle} position
2. Availability for different shifts (morning/evening)
3. Weekend availability
4. Transportation arrangements
5. Specific skills related to the ${jobTitle} position

PROCESS:
1. Start with a brief introduction as the restaurant's AI screening assistant
2. Ask about their relevant experience for the ${jobTitle} position
3. Ask the mandatory questions about availability and transportation
4. Ask role-specific questions for the ${jobTitle} position
5. Thank them for their time and explain that a recruiter will review the screening results
6. IMPORTANT: End the call appropriately by CLEARLY stating: "Thank you for your time. We'll review your responses and get back to you soon. Have a great day!" or similar ending phrase that signals the conversation is complete

After the call, you will provide a structured summary of the candidate's responses focusing on their experience, availability, and skills relevant to the ${jobTitle} position. Do not provide an overall rating.

IMPORTANT: At the end of the screening, you MUST clearly signal that the call is ending by using one of the following phrases: "Thank you for your time", "goodbye", "this concludes our screening", or "we'll be in touch". This ensures proper call termination.`;
}

// Function to create the Vapi assistant configuration options for a specific job and candidate
export function createScreeningAssistantOptions(
  jobTitle: string,
  candidateName: string,
  roleType: ScreeningRole,
  config?: VapiConfig
) {
  // Use server-side config if available and no config is explicitly provided
  const effectiveConfig = config || (typeof window === 'undefined' ? getVapiSettings() : DEFAULT_VAPI_CONFIG);
  
  const roleSpecificQuestions = getRoleSpecificQuestions(roleType);
  const systemPrompt = generateScreeningSystemPrompt(
    jobTitle,
    roleType,
    roleSpecificQuestions,
    effectiveConfig.conversationTone,
    effectiveConfig.customSystemPrompt
  );

  // Get analysis prompt - use custom if available, otherwise default
  const analysisPrompt = effectiveConfig.customAnalysisPrompt || getCustomAnalysisPrompt() ||
    `Analyze this ${jobTitle} screening call and provide a structured summary including:
    1. Candidate's relevant experience
    2. Availability (shifts, weekends, transportation) - Only mention in summary what candidate is said yes to, e.g. if candidate not availble for evening shift don't mention it. If candidate is available for both shifts mention both shift names. Same logic for all fields.
    3. Key responses to role-specific questions
    4. Overall assessment of communication skills
    5. Any concerns or red flags
    
    Format the response as a clear, professional summary for hiring managers.`;

  // Simple assistant configuration based on working vapi-react-demo sample
  return {
    name: `${jobTitle} Screening`,
    firstMessage: `Hi ${candidateName}, I'm the AI screening assistant for the ${jobTitle} position. This call will take about 2-3 minutes, and will be recorded for quality and training purposes. I'll be asking you some questions about your experience and availability. Let's get started. Could you tell me about your relevant experience for this ${jobTitle} role?`,
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    voice: {
      provider: "playht",
      voiceId: "jennifer",
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        }
      ],
    },
    // Configure client messages to receive transcript and call data
    clientMessages: [
      "transcript",
      "hang",
      "function-call",
      "function-call-result",
      "speech-update",
      "metadata",
      "conversation-update",
      "model-output",
      "status-update",
      "tool-calls",
      "tool-calls-result",
      "tool.completed"
    ],
    recordingEnabled: true, // Enable recording to get audio URL
    // Configure analysis plan to generate call summary
    analysisPlan: {
      summaryPrompt: analysisPrompt,
    },
    // Call ending configuration
    silenceTimeoutSeconds: 15, // End call after 15 seconds of silence
    maxDurationSeconds: effectiveConfig.maxCallDuration, // Use configured max duration (default 180 seconds)
    endCallMessage: "Thank you for your time. We'll review your responses and get back to you soon. Have a great day!",
    endCallPhrases: [
      "goodbye",
      "thank you for your time",
      "we'll be in touch",
      "have a great day",
      "that concludes our screening",
      "this completes the interview"
    ],
  };
}
