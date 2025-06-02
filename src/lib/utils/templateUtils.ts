
/**
 * Populate a template with data by replacing placeholders with actual values
 * 
 * @param template The template string with placeholders like {{placeholderName}}
 * @param data Object containing key-value pairs to replace placeholders
 * @returns The populated template with placeholders replaced by actual values
 */
export function populateTemplate(template: string, data: Record<string, string>): string {
  // Replace all placeholders with their corresponding values
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

/**
 * Get sample data for email template previews
 * 
 * @param templateKey The key of the template being previewed
 * @returns Sample data object for populating the template
 */
export function getSampleDataForTemplate(templateKey: string): Record<string, string> {
  // Common data across all templates - using generic test data
  const commonData = {
    candidateName: 'John Smith', // Sample name for preview
    position: 'Head Chef' // Sample position for preview
  };

  // Template-specific data for preview purposes
  switch (templateKey) {
    case 'screeningInvitation':
      return {
        ...commonData,
        screeningLink: 'https://restaurant.example/screening/abc123' // Sample link
      };
    case 'interviewInvitation':
      return {
        ...commonData,
        interviewLink: 'https://restaurant.example/interview/abc123' // Sample link
      };
    case 'offerLetter':
      return {
        ...commonData,
        offerDetails: `Position: Head Chef
Salary: $65,000 per year
Start Date: January 15, 2023
Location: Downtown Branch
Schedule: Tuesday to Saturday, 2pm - 10pm` // Sample offer details
      };
    default:
      return commonData;
  }
}

/**
 * Create a preview of an email template with sample data
 * 
 * @param templateKey The key of the template to preview
 * @param templateContent The content of the template
 * @returns The populated template with sample data
 */
export function previewTemplate(templateKey: string, templateContent: string): string {
  const sampleData = getSampleDataForTemplate(templateKey);
  return populateTemplate(templateContent, sampleData);
}
