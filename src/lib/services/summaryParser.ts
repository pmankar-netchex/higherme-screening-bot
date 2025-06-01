import { CandidateScreeningSummary } from '../types/candidate';
import { ScreeningSummary } from '../types/screening';

/**
 * Parse a markdown-formatted screening summary to extract structured availability data
 */
export function parseMarkdownSummary(markdownSummary: string): Partial<CandidateScreeningSummary> {
  if (!markdownSummary) {
    return {};
  }

  const summary = markdownSummary.toLowerCase();

  // Extract availability information
  const availability = {
    morningShift: false,
    eveningShift: false,
    weekendAvailable: false,
    transportation: false,
    notes: ''
  };

  // Check for morning shift availability
  if (
    summary.includes('available only for morning') ||
    summary.includes('morning shift') && !summary.includes('not available') && !summary.includes('unavailable')
  ) {
    availability.morningShift = true;
  }

  // Check for evening shift availability
  if (
    summary.includes('available for evening') ||
    (summary.includes('evening shift') && !summary.includes('not available') && !summary.includes('unavailable'))
  ) {
    availability.eveningShift = true;
  }

  // Check for weekend availability
  if (
    summary.includes('willing to work weekends') ||
    summary.includes('available weekends') ||
    (summary.includes('weekends') && !summary.includes('not available') && !summary.includes('unavailable'))
  ) {
    availability.weekendAvailable = true;
  }

  // Check for transportation
  if (
    summary.includes('has personal vehicle') ||
    summary.includes('own car') ||
    summary.includes('reliable transportation') ||
    summary.includes('has transportation')
  ) {
    availability.transportation = true;
  }

  // Extract availability notes from the availability section
  const availabilityMatch = markdownSummary.match(/## 2\. Availability\s*([\s\S]*?)(?=##|$)/i);
  if (availabilityMatch) {
    availability.notes = availabilityMatch[1].trim().replace(/^-\s*/gm, '').trim();
  }

  // Extract experience information
  let experienceScore = 'Average';
  let experienceNotes = '';
  
  const experienceMatch = markdownSummary.match(/## 1\. Candidate's Relevant Experience\s*([\s\S]*?)(?=##|$)/i);
  if (experienceMatch) {
    experienceNotes = experienceMatch[1].trim().replace(/^-\s*/gm, '').trim();
    
    // Determine score based on content
    if (experienceNotes.toLowerCase().includes('no prior') || experienceNotes.toLowerCase().includes('no experience')) {
      experienceScore = 'Poor';
    } else if (experienceNotes.toLowerCase().includes('extensive') || experienceNotes.toLowerCase().includes('experienced')) {
      experienceScore = 'Excellent';
    } else if (experienceNotes.toLowerCase().includes('some') || experienceNotes.toLowerCase().includes('limited')) {
      experienceScore = 'Good';
    }
  }

  // Extract soft skills information
  let softSkillsScore = 'Average';
  let softSkillsNotes = '';
  
  const communicationMatch = markdownSummary.match(/## 4\. Overall Assessment of Communication Skills\s*([\s\S]*?)(?=##|$)/i);
  if (communicationMatch) {
    softSkillsNotes = communicationMatch[1].trim().replace(/^-\s*/gm, '').trim();
    
    // Determine score based on content
    if (softSkillsNotes.toLowerCase().includes('excellent') || softSkillsNotes.toLowerCase().includes('strong')) {
      softSkillsScore = 'Excellent';
    } else if (softSkillsNotes.toLowerCase().includes('good') || softSkillsNotes.toLowerCase().includes('clear')) {
      softSkillsScore = 'Good';
    } else if (softSkillsNotes.toLowerCase().includes('poor') || softSkillsNotes.toLowerCase().includes('unclear')) {
      softSkillsScore = 'Poor';
    }
  }

  // Extract overall summary
  let overallSummary = '';
  const assessmentMatch = markdownSummary.match(/## 5\. Concerns\/Red Flags\s*([\s\S]*?)(?=This candidate|$)/i);
  if (assessmentMatch) {
    overallSummary = assessmentMatch[1].trim().replace(/^-\s*/gm, '').trim();
  }
  
  // If no concerns section, use the last paragraph
  if (!overallSummary) {
    const paragraphs = markdownSummary.split('\n\n');
    overallSummary = paragraphs[paragraphs.length - 1].trim();
  }

  // Extract role-specific answers
  const roleSpecificAnswers: Record<string, string> = {};
  const roleSpecificMatch = markdownSummary.match(/## 3\. Key Responses to Role-Specific Questions\s*([\s\S]*?)(?=##|$)/i);
  if (roleSpecificMatch) {
    roleSpecificAnswers['Role-specific evaluation'] = roleSpecificMatch[1].trim().replace(/^-\s*/gm, '').trim();
  }

  // Extract strengths and concerns
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Parse concerns from the concerns section
  const concernsMatch = markdownSummary.match(/## 5\. Concerns\/Red Flags\s*([\s\S]*?)(?=This candidate|$)/i);
  if (concernsMatch) {
    const concernsList = concernsMatch[1].match(/^-\s*(.+)$/gm);
    if (concernsList) {
      concerns.push(...concernsList.map(c => c.replace(/^-\s*/, '').trim()));
    }
  }

  // Extract strengths from positive mentions
  if (availability.morningShift) strengths.push('Available for morning shifts');
  if (availability.weekendAvailable) strengths.push('Willing to work weekends');
  if (availability.transportation) strengths.push('Has reliable transportation');
  if (experienceScore === 'Good' || experienceScore === 'Excellent') strengths.push('Relevant experience');

  return {
    evaluations: {
      experience: {
        score: experienceScore,
        notes: experienceNotes
      },
      availability,
      softSkills: {
        score: softSkillsScore,
        notes: softSkillsNotes
      }
    },
    roleSpecificAnswers,
    overallSummary,
    strengths,
    concerns
  };
}

/**
 * Update candidate screening summary with parsed data from markdown
 */
export function updateCandidateScreeningFromMarkdown(
  existingSummary: CandidateScreeningSummary,
  markdownSummary: string
): CandidateScreeningSummary {
  const parsedData = parseMarkdownSummary(markdownSummary);
  
  return {
    ...existingSummary,
    ...parsedData,
    evaluations: {
      ...existingSummary.evaluations,
      ...parsedData.evaluations
    }
  };
}
