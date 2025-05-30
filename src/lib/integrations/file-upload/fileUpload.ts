export interface FileUploadResult {
  success: boolean;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  uploadPath?: string;
  uploadedAt?: string;
  error?: string;
}

export interface FileValidationError {
  field: string;
  message: string;
}

/**
 * Validates a file for resume upload
 * @param file - The file to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateResumeFile(file: File): FileValidationError[] {
  const errors: FileValidationError[] = [];
  
  // Maximum file size: 5MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  
  // Allowed file types
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      field: 'size',
      message: 'File size must be less than 5MB'
    });
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push({
      field: 'type',
      message: 'Only PDF, DOC, and DOCX files are allowed'
    });
  }

  // Check file extension
  const fileExtension = file.name.toLowerCase().split('.').pop();
  if (!fileExtension || !ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
    errors.push({
      field: 'extension',
      message: 'Invalid file extension. Only .pdf, .doc, and .docx are allowed'
    });
  }

  // Check filename length
  if (file.name.length > 255) {
    errors.push({
      field: 'filename',
      message: 'Filename is too long (maximum 255 characters)'
    });
  }

  return errors;
}

/**
 * Uploads a resume file to the server
 * @param file - The file to upload
 * @param candidateId - The ID of the candidate uploading the resume
 * @returns Promise resolving to upload result
 */
export async function uploadResumeFile(
  file: File, 
  candidateId: string
): Promise<FileUploadResult> {
  try {
    // Validate file before upload
    const validationErrors = validateResumeFile(file);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.map(e => e.message).join(', ')
      };
    }

    // Create form data
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('candidateId', candidateId);

    // Upload file
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed'
      };
    }

    return result;
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Network error during upload'
    };
  }
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets file extension icon class or emoji
 * @param filename - The filename to get icon for
 * @returns Icon representation
 */
export function getFileIcon(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    default:
      return '📎';
  }
}

/**
 * Checks if a file type is allowed for resume upload
 * @param fileType - MIME type of the file
 * @returns True if file type is allowed
 */
export function isAllowedFileType(fileType: string): boolean {
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  return ALLOWED_TYPES.includes(fileType);
}
