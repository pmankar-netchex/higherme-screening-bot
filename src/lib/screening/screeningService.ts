import { ScreeningSummary, ScreeningRole, ApplicationStatus } from '../types';

/**
 * Service for managing and processing screening calls
 */

// Function to determine the appropriate screening role from job data
export function determineScreeningRole(jobTitle: string, department?: string): ScreeningRole {
  const title = jobTitle.toLowerCase();
  
  if (department?.toLowerCase().includes('kitchen') || 
      title.includes('cook') || 
      title.includes('chef') ||
      title.includes('kitchen')) {
    return 'cook';
  } else if (title.includes('server') || title.includes('waiter') || title.includes('waitress')) {
    return 'server';
  } else if (title.includes('host') || title.includes('hostess') || title.includes('greeting')) {
    return 'host';
  } else if (title.includes('manager') || title.includes('supervisor') || title.includes('lead')) {
    return 'manager';
  }
  
  return 'general';
}

// Function to parse the AI-generated call summary into a structured format
export function parseScreeningSummary(aiSummary: string): ScreeningSummary {
  // Initialize default structure
  const defaultSummary: ScreeningSummary = {
    experience: {
      evaluation: '',
      highlights: []
    },
    availability: {
      morning: false,
      evening: false,
      weekends: false,
      notes: ''
    },
    transportation: {
      hasReliableTransportation: false,
      notes: ''
    },
    softSkills: {
      evaluation: '',
      highlights: []
    },
    roleSpecific: {
      evaluation: '',
      strengths: [],
      areas_of_improvement: []
    }
  };
  
  try {
    // Check if the AI returned a JSON format directly
    if (aiSummary.trim().startsWith('{') && aiSummary.trim().endsWith('}')) {
      try {
        const parsedJson = JSON.parse(aiSummary);
        return {
          ...defaultSummary,
          ...parsedJson
        };
      } catch (e) {
        // If JSON parsing fails, continue with text analysis
      }
    }
    
    // Text-based parsing as fallback
    const summary = { ...defaultSummary };
    
    // Extract experience information
    const experienceMatch = aiSummary.match(/Experience:([\s\S]+?)(?=Availability:|$)/);
    if (experienceMatch && experienceMatch[1]) {
      summary.experience.evaluation = experienceMatch[1].trim();
      
      // Extract highlights if in bullet points
      const highlightsMatch = experienceMatch[1].match(/[-•*]\s*(.+?)(?=[-•*]|$)/g);
      if (highlightsMatch) {
        summary.experience.highlights = highlightsMatch.map(h => 
          h.replace(/^[-•*]\s*/, '').trim()
        );
      }
    }
    
    // Extract availability information
    const availabilityMatch = aiSummary.match(/Availability:([\s\S]+?)(?=Transportation:|$)/);
    if (availabilityMatch && availabilityMatch[1]) {
      const availText = availabilityMatch[1].toLowerCase();
      summary.availability.morning = availText.includes('morning') && 
        !availText.includes('not available morning') &&
        !availText.includes('unavailable morning');
      
      summary.availability.evening = availText.includes('evening') && 
        !availText.includes('not available evening') && 
        !availText.includes('unavailable evening');
      
      summary.availability.weekends = availText.includes('weekend') && 
        !availText.includes('not available weekend') && 
        !availText.includes('unavailable weekend');
      
      summary.availability.notes = availabilityMatch[1].trim();
    }
    
    // Extract transportation information
    const transportationMatch = aiSummary.match(/Transportation:([\s\S]+?)(?=Soft Skills:|$)/);
    if (transportationMatch && transportationMatch[1]) {
      const transText = transportationMatch[1].toLowerCase();
      summary.transportation.hasReliableTransportation = 
        transText.includes('reliable') || 
        transText.includes('yes') || 
        transText.includes('own car') ||
        transText.includes('has transportation');
      
      summary.transportation.notes = transportationMatch[1].trim();
    }
    
    // Extract soft skills evaluation
    const softSkillsMatch = aiSummary.match(/Soft Skills:([\s\S]+?)(?=Role-Specific:|$)/);
    if (softSkillsMatch && softSkillsMatch[1]) {
      summary.softSkills.evaluation = softSkillsMatch[1].trim();
      
      // Extract highlights if in bullet points
      const highlightsMatch = softSkillsMatch[1].match(/[-•*]\s*(.+?)(?=[-•*]|$)/g);
      if (highlightsMatch) {
        summary.softSkills.highlights = highlightsMatch.map(h => 
          h.replace(/^[-•*]\s*/, '').trim()
        );
      }
    }
    
    // Extract role-specific evaluation
    const roleSpecificMatch = aiSummary.match(/Role-Specific:([\s\S]+?)(?=$)/);
    if (roleSpecificMatch && roleSpecificMatch[1]) {
      summary.roleSpecific.evaluation = roleSpecificMatch[1].trim();
      
      // Extract strengths
      const strengthsMatch = roleSpecificMatch[1].match(/Strengths:([\s\S]+?)(?=Areas for Improvement:|$)/);
      if (strengthsMatch && strengthsMatch[1]) {
        const strengthsList = strengthsMatch[1].match(/[-•*]\s*(.+?)(?=[-•*]|$)/g);
        if (strengthsList) {
          summary.roleSpecific.strengths = strengthsList.map(s => 
            s.replace(/^[-•*]\s*/, '').trim()
          );
        }
      }
      
      // Extract areas for improvement
      const improvementMatch = roleSpecificMatch[1].match(/Areas for Improvement:([\s\S]+?)(?=$)/);
      if (improvementMatch && improvementMatch[1]) {
        const improvementList = improvementMatch[1].match(/[-•*]\s*(.+?)(?=[-•*]|$)/g);
        if (improvementList) {
          summary.roleSpecific.areas_of_improvement = improvementList.map(i => 
            i.replace(/^[-•*]\s*/, '').trim()
          );
        }
      }
    }
    
    return summary;
  } catch (error) {
    console.error('Error parsing screening summary:', error);
    return defaultSummary;
  }
}

// Send the screening summary to the backend for storage
export async function saveScreeningSummary(
  screeningId: string, 
  summary: ScreeningSummary
): Promise<boolean> {
  try {
    const response = await fetch('/api/screening/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ screeningId, summary }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save screening summary:', error);
    return false;
  }
}

// Update the screening call status
export async function updateScreeningStatus(
  screeningId: string,
  status: ApplicationStatus,
  additionalData: Record<string, any> = {}
): Promise<boolean> {
  try {
    const response = await fetch('/api/screening/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screeningId,
        status,
        ...additionalData
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update screening status:', error);
    return false;
  }
}

// Create a new screening record
export async function createScreeningRecord(
  applicationId: string,
  candidateId: string,
  jobId: string
): Promise<string | null> {
  try {
    const response = await fetch('/api/screening', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId,
        candidateId,
        jobId,
        status: 'scheduled',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Failed to create screening record:', error);
    return null;
  }
}
