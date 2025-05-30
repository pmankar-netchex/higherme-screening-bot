/**
 * Server-side Vapi.ai configuration for restaurant recruitment platform screening calls
 */

import fs from 'fs';
import path from 'path';
import { ScreeningRole } from '../../types';

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
}

// Default Vapi configuration based on settings in config.json
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

// Get mandatory questions from config, with fallbacks
export function getMandatoryQuestions(): string[] {
  try {
    // Read from config.json
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
  return [
    'Are you available to work morning shifts (6 AM - 2 PM)?',
    'Are you available to work evening shifts (2 PM - 10 PM)?',
    'Can you work weekends?',
    'Do you have reliable transportation to get to work?'
  ];
}

// Set of mandatory questions to ask in all screening calls
export const MANDATORY_QUESTIONS = getMandatoryQuestions();

// Get conversation tone from config, with fallback
export function getConversationTone(): string {
  try {
    // Read from config.json
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

// Generate the system prompt for the AI assistant based on job role and configuration
export function generateScreeningSystemPrompt(
  jobTitle: string, 
  roleType: ScreeningRole,
  roleSpecificQuestions: string[],
  conversationTone: string = getConversationTone()
): string {
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

// Generate role-specific questions based on the job role and configuration
export function getRoleSpecificQuestions(roleType: ScreeningRole): string[] {
  try {
    // Read from config.json
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Check if role exists in config and has screening questions
      if (config.roles && config.roles[roleType] && Array.isArray(config.roles[roleType].screeningQuestions)) {
        return config.roles[roleType].screeningQuestions;
      }
    }
  } catch (error) {
    console.error('Error reading role-specific questions from config:', error);
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

// Get Vapi settings from config
export function getVapiSettings(): VapiConfig {
  try {
    // Read from config.json
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
          maxCallDuration: config.vapiSettings.maxCallDuration || DEFAULT_VAPI_CONFIG.maxCallDuration
        };
      }
    }
  } catch (error) {
    console.error('Error reading Vapi settings from config:', error);
  }
  
  // Fallback to default config
  return DEFAULT_VAPI_CONFIG;
}

// Function to create the Vapi assistant configuration options for a specific job and candidate
export function createScreeningAssistantOptions(
  jobTitle: string,
  candidateName: string,
  roleType: ScreeningRole,
  config: VapiConfig = getVapiSettings()
) {
  const roleSpecificQuestions = getRoleSpecificQuestions(roleType);
  const systemPrompt = generateScreeningSystemPrompt(
    jobTitle,
    roleType,
    roleSpecificQuestions,
    config.conversationTone
  );

  // Use simplified configuration pattern similar to working vapi-react-demo
  // This prevents undefined URL requests that cause /_next/undefined 404 errors
  return {
    name: `${jobTitle} Screening Assistant`,
    firstMessage: `Hi ${candidateName}, I'm the AI screening assistant for the ${jobTitle} position. This call will take about 2-3 minutes. I'll be asking you some questions about your experience and availability. Let's get started. Could you tell me about your relevant experience for this ${jobTitle} role?`,
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
    // Call ending configuration
    silenceTimeoutSeconds: 15, // End call after 15 seconds of silence
    maxDurationSeconds: config.maxCallDuration, // Use configured max duration (default 180 seconds)
    endCallMessage: "Thank you for your time. We'll review your responses and get back to you soon. Have a great day!",
    endCallPhrases: [
      "goodbye",
      "thank you for your time",
      "we'll be in touch",
      "have a great day",
      "that concludes our screening",
      "this completes the interview"
    ],
    // No server configuration to prevent undefined URL issues
  };
}
