# Task List: Restaurant Recruitment Platform

Based on PRD: `prd-restaurant-recruitment-platform.md`

## Relevant Files

- `app/candidate/page.tsx` - Enhanced main candidate portal page with improved layout and job statistics
- `app/candidate/apply/[jobId]/page.tsx` - Job application page with resume upload and screening
- `app/recruiter/page.tsx` - Recruiter dashboard showing applicant lists
- `app/recruiter/applications/page.tsx` - Applications overview page for recruiters
- `app/recruiter/candidate/[candidateId]/page.tsx` - Detailed candidate view page
- `app/admin/page.tsx` - Admin panel for system configuration
- `app/admin/config/page.tsx` - Configuration management page for system settings
- `app/admin/jobs/page.tsx` - Job description management interface
- `app/admin/screening/page.tsx` - Screening questions and criteria configuration
- `components/screening/VoiceScreeningCall.tsx` - Voice screening component using Vapi.ai
- `components/candidate/JobCard.tsx` - Enhanced individual job listing card component with detailed display and requirements
- `components/candidate/ResumeUpload.tsx` - Resume file upload component
- `components/recruiter/ApplicantList.tsx` - Applicant list with filtering and search
- `components/recruiter/CandidateDetails.tsx` - Detailed candidate information view
- `components/recruiter/JobApplicantsOverview.tsx` - Dashboard component showing applicants by job
- `components/recruiter/ScreeningSummary.tsx` - Component displaying AI screening results
- `components/recruiter/RecruiterNotes.tsx` - Component for editable recruiter notes on candidates
- `components/recruiter/ExportData.tsx` - Candidate data export functionality
- `components/recruiter/CandidateStatusTracker.tsx` - Component for tracking candidate status in workflow
- `components/admin/AdminConfigPanel.tsx` - Configuration panel with multiple settings tabs
- `components/admin/JobForm.tsx` - Job creation/editing form
- `components/admin/ScreeningConfig.tsx` - Screening configuration interface
- `lib/data/jobs.ts` - Job data management functions
- `lib/data/candidates.ts` - Candidate data management functions
- `lib/data/applications.ts` - Application workflow management
- `lib/screening/vapiConfig.ts` - Vapi.ai configuration for screening calls
- `lib/types/index.ts` - Shared TypeScript type definitions for Job, Application, Candidate, and Screening entities
- `lib/utils/fileUpload.ts` - Resume file upload utilities
- `lib/utils/exportUtils.ts` - Utilities for exporting candidate data
- `lib/utils/templateUtils.ts` - Utilities for email template management
- `lib/workflow/workflowUtils.ts` - Utilities for managing application workflow
- `app/api/upload/route.ts` - API route for resume file uploads
- `app/api/screening/route.ts` - API route for screening call management
- `app/api/applications/[applicationId]/status/route.ts` - API route for updating application status
- `app/api/candidates/[candidateId]/route.ts` - API route for candidate data management
- `app/api/admin/config/route.ts` - API route for system configuration management
- `data/jobs.json` - JSON storage for job descriptions
- `data/candidates.json` - JSON storage for candidate information
- `data/applications.json` - JSON storage for application data
- `data/config.json` - JSON storage for admin configurations
- `data/screenings.json` - JSON storage for screening results
- `public/uploads/resumes/` - Directory for storing uploaded resume files

### Notes

- Leverage existing Vapi integration components from the demo project located in `src/components/`
- Reuse UI components from `components/ui/` directory (Button, Card, Dialog, Form, etc.)
- Build upon existing call management infrastructure from `app/page.jsx`
- Use existing utility functions from `lib/utils.ts`
- Follow existing project structure and naming conventions

## Non-tasks (Areas to Avoid/Deprioritize)

### Authentication & User Management
- User registration and login systems
- Password reset functionality
- Role-based authentication middleware
- Session management beyond basic local storage

### Third-Party Integrations
- External HR system integrations (ATS, HRIS)
- Email notification systems
- Calendar/scheduling integrations
- Payment processing systems

### Advanced Features
- Multi-location restaurant management
- Background check integrations
- Advanced compliance features (GDPR, EEO reporting)
- Multi-language support
- Mobile app development

### Testing & Documentation
- Comprehensive unit test suites
- End-to-end testing setup
- Detailed API documentation
- User manuals and help systems

### Performance & Scalability
- Database optimization
- Caching mechanisms
- Load balancing considerations
- CDN setup for file storage

### Advanced UI/UX
- Advanced accessibility features beyond basic compliance
- Custom animation systems
- Progressive Web App features
- Offline functionality

## Tasks

- [x] 1.0 Set up project foundation and data management system
  - [x] 1.1 Create data directory structure and JSON storage files (jobs.json, candidates.json, applications.json, config.json)
  - [x] 1.2 Set up resume upload directory structure in public/uploads/resumes/
  - [x] 1.3 Create data management utility functions for CRUD operations on JSON files
  - [x] 1.4 Implement file upload API route for resume handling with validation
  - [x] 1.5 Create application status workflow management system
  - [x] 1.6 Set up basic routing structure for candidate, recruiter, and admin sections

- [x] 2.0 Build candidate portal with job listings and application flow
  - [x] 2.1 Create job listing page displaying available positions with role details
  - [x] 2.2 Build JobCard component for individual job display with requirements
  - [x] 2.3 Implement job application page with job details and application form
  - [x] 2.4 Create ResumeUpload component with PDF file validation and upload
  - [x] 2.5 Add application confirmation and next steps messaging
  - [x] 2.6 Implement responsive design for candidate portal pages

- [x] 3.0 Implement AI-powered voice screening integration using Vapi.ai
  - [x] 3.1 Create VoiceScreeningCall component extending existing Vapi integration
  - [x] 3.2 Configure Vapi.ai assistant options for restaurant screening scenarios
  - [x] 3.3 Implement mandatory screening questions (shift availability, weekend work, transportation)
  - [x] 3.4 Add role-specific question integration based on job type
  - [x] 3.5 Create screening summary generation and storage system
  - [x] 3.6 Implement call status tracking and candidate feedback system
  - [x] 3.7 Add error handling for call failures and retry mechanisms

- [x] 4.0 Create recruiter dashboard for application management
  - [x] 4.1 Build main recruiter dashboard with applicant overview by job
  - [x] 4.2 Create ApplicantList component with status filtering and search
  - [x] 4.3 Implement detailed candidate view page with resume access
  - [x] 4.4 Add screening summary display with editable recruiter notes
  - [x] 4.5 Create hiring decision workflow (Hire, Reject, Further Review)
  - [x] 4.6 Implement candidate status updates and tracking
  - [x] 4.7 Add data export functionality for candidate information

- [x] 5.0 Develop admin panel for configuration management
  - [x] 5.1 Create admin dashboard with configuration overview and notification template management
  - [x] 5.2 Build job description management interface (create, edit, delete jobs)
  - [x] 5.3 Implement screening questions configuration per role type
  - [x] 5.4 Create AI prompt customization interface for conversation tone
  - [x] 5.5 Add evaluation criteria configuration with role-specific weights
  - [x] 5.6 Implement restaurant role type management system
  - [x] 5.7 Create configuration backup and restore functionality
