import { ScreeningRole } from '../shared/types';

// Helper function to get the correct API URL
const getApiUrl = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return '/api/admin/screening';
  }
  
  // Server-side: construct full URL
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  return `${baseUrl}/api/admin/screening`;
};

// Types for the role configuration
export interface EvaluationCriterion {
  weight: number;
  description: string;
}

export interface EvaluationCriteriaSet {
  [criterionKey: string]: EvaluationCriterion;
}

export interface RoleConfig {
  name: string;
  department: string;
  screeningQuestions: string[];
  evaluationCriteria: EvaluationCriteriaSet;
}

export interface ScreeningConfig {
  roles: {
    [key in ScreeningRole | string]: RoleConfig;
  };
  mandatoryQuestions: string[];
  vapiSettings: {
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
  };
  applicationSettings: {
    maxResumeSize: string;
    allowedFileTypes: string[];
    autoAdvanceToScreening: boolean;
  };
}

// Load the screening configuration from API
export const getScreeningConfig = async (): Promise<ScreeningConfig> => {
  try {
    const response = await fetch(getApiUrl());
    if (!response.ok) {
      throw new Error(`Failed to fetch configuration: ${response.statusText}`);
    }
    return await response.json() as ScreeningConfig;
  } catch (error) {
    console.error('Error reading screening configuration:', error);
    throw new Error('Failed to load screening configuration');
  }
};

// Save the updated screening configuration via API
export const updateScreeningConfig = async (config: ScreeningConfig): Promise<void> => {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update configuration: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error writing screening configuration:', error);
    throw new Error('Failed to save screening configuration');
  }
};

// Update configuration for a specific role
export const updateRoleConfig = async (roleType: ScreeningRole, roleConfig: RoleConfig): Promise<void> => {
  try {
    const config = await getScreeningConfig();
    config.roles[roleType] = roleConfig;
    await updateScreeningConfig(config);
  } catch (error) {
    console.error(`Error updating configuration for ${roleType} role:`, error);
    throw new Error(`Failed to update ${roleType} configuration`);
  }
};

// Update mandatory questions
export const updateMandatoryQuestions = async (questions: string[]): Promise<void> => {
  try {
    const config = await getScreeningConfig();
    config.mandatoryQuestions = questions;
    await updateScreeningConfig(config);
  } catch (error) {
    console.error('Error updating mandatory questions:', error);
    throw new Error('Failed to update mandatory questions');
  }
};

// Add a new role configuration
export const addRoleConfig = async (roleType: string, roleConfig: RoleConfig): Promise<void> => {
  try {
    const config = await getScreeningConfig();
    config.roles[roleType] = roleConfig;
    await updateScreeningConfig(config);
  } catch (error) {
    console.error(`Error adding configuration for ${roleType} role:`, error);
    throw new Error(`Failed to add ${roleType} configuration`);
  }
};

// Delete a role configuration
export const deleteRoleConfig = async (roleType: string): Promise<void> => {
  try {
    const config = await getScreeningConfig();
    if (config.roles[roleType]) {
      delete config.roles[roleType];
      await updateScreeningConfig(config);
    }
  } catch (error) {
    console.error(`Error deleting configuration for ${roleType} role:`, error);
    throw new Error(`Failed to delete ${roleType} configuration`);
  }
};
