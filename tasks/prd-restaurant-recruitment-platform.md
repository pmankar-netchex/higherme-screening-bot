# Product Requirements Document: Restaurant Recruitment Platform

## Introduction/Overview

The Restaurant Recruitment Platform is a comprehensive web-based solution designed to streamline the hiring process for restaurant staff positions. The platform addresses key challenges in restaurant recruitment including high turnover rates, time-consuming manual screening processes, and the need for efficient candidate evaluation. 

The system integrates AI-powered voice screening using Vapi.ai to automate initial candidate assessments, allowing recruiters to focus on qualified candidates while providing candidates with an immediate and engaging application experience.

**Goal**: Improve candidate quality, reduce hiring time and effort, and create a more efficient recruitment workflow specifically tailored for restaurant industry roles.

## Goals

1. **Reduce Time to Hire**: Decrease the overall hiring timeline by 50% through automated screening
2. **Improve Candidate Quality**: Filter candidates effectively using role-specific AI screening questions
3. **Enhance User Experience**: Provide an intuitive interface for both candidates and recruiters
4. **Automate Initial Screening**: Replace manual phone screenings with AI-powered voice calls
5. **Increase Recruiter Efficiency**: Allow recruiters to focus on decision-making rather than initial screening
6. **Ensure Configurability**: Enable admins to customize screening criteria per role type

## User Stories

### Candidate Stories
- **As a restaurant job candidate**, I want to view available positions and their requirements so that I can choose roles that match my skills and availability
- **As a candidate**, I want to upload my resume for a specific job so that I can apply quickly and efficiently
- **As a candidate**, I want to complete an AI voice screening immediately after applying so that I can get faster feedback on my application
- **As a candidate**, I want the screening process to be conversational and natural so that I feel comfortable during the assessment

### Recruiter Stories
- **As a recruiter**, I want to see a list of all applicants for each job description so that I can manage applications efficiently
- **As a recruiter**, I want to view detailed candidate information including resumes and screening summaries so that I can make informed hiring decisions
- **As a recruiter**, I want to see clear status indicators for screening completion so that I know which candidates are ready for review
- **As a recruiter**, I want to read AI-generated screening summaries covering availability, experience, and soft skills so that I can quickly assess candidate fit
- **As a recruiter**, I want to update AI-generated feedback before making final decisions so that I can add my professional judgment

### Admin Stories
- **As an admin**, I want to configure custom screening questions for different restaurant roles so that assessments are role-specific
- **As an admin**, I want to set evaluation criteria per role type so that screening focuses on relevant skills and requirements
- **As an admin**, I want to customize AI prompts and conversation tone so that the screening experience aligns with our brand

## Functional Requirements

### Core Platform Requirements
1. **The system must provide three distinct user interfaces**: Candidate Portal, Recruiter Dashboard, and Admin Panel
2. **The system must be built using Next.js** framework leveraging the existing Vapi demo project structure
3. **The system must integrate with Vapi.ai Web SDK** for voice-based screening calls
4. **The system must support file upload functionality** for resume submission in PDF format
5. **The system must provide responsive web design** optimized for desktop and tablet usage

### Candidate Portal Requirements
6. **The system must display a list of available job descriptions** with role details and requirements
7. **The system must allow candidates to upload resumes** for specific job applications (PDF format)
8. **The system must enable candidates to initiate instant AI screening calls** immediately after resume submission
9. **The system must provide clear instructions** for the voice screening process
10. **The system must handle screening call status** and provide feedback to candidates about next steps

### AI Screening Requirements
11. **The system must conduct 2-3 minute voice screening calls** using Vapi.ai integration
12. **The system must ask mandatory questions about shift availability** (morning/evening shifts)
13. **The system must ask about weekend availability** for all restaurant positions
14. **The system must inquire about transportation arrangements** for commuting to work
15. **The system must ask role-specific questions** as configured by administrators
16. **The system must generate structured evaluation summaries** covering experience, availability, and soft skills
17. **The system must not provide overall ratings** but focus on detailed aspect-based summaries

### Recruiter Dashboard Requirements
18. **The system must display applicant lists grouped by job description** with filtering capabilities
19. **The system must show clear status indicators** for screening completion (Pending, Completed, Under Review)
20. **The system must provide detailed candidate views** including resume access and screening summaries
21. **The system must allow recruiters to update AI-generated evaluations** with additional notes
22. **The system must enable recruiters to mark hiring decisions** (Hire, Reject, Further Review)
23. **The system must provide candidate search and filtering** by status, role, and screening results

### Admin Configuration Requirements
24. **The system must allow admins to create and edit job descriptions** with role-specific requirements
25. **The system must enable configuration of screening questions per role type** (Server, Cook, Host, etc.)
26. **The system must provide AI prompt customization** for conversation tone and specific instructions
27. **The system must allow setting of evaluation criteria weights** per role type
28. **The system must support management of multiple restaurant role types** with distinct requirements

### Data Management Requirements
29. **The system must store candidate information** including personal details, resume files, and application timestamps
30. **The system must maintain screening call transcripts and summaries** for auditing purposes
31. **The system must track application status workflow** from submission to hiring decision
32. **The system must provide data export capabilities** for candidate information and screening results

## Non-Goals (Out of Scope)

1. **Multi-location restaurant management** - Initial version focuses on single restaurant operation
2. **Integration with external HR systems** - No ATS or HRIS integrations in v1
3. **Advanced compliance features** - GDPR, EEO reporting, and audit trails not included
4. **Mobile applications** - Web-only solution for initial release
5. **Multiple job applications per candidate** - Candidates can only apply to one position at a time
6. **Video screening calls** - Audio-only screening using Vapi.ai
7. **Background check integration** - Manual process handled outside the platform
8. **Automated interview scheduling** - Scheduling handled separately post-screening
9. **Candidate scoring/rating system** - Focus on qualitative summaries instead of numerical scores
10. **Multi-language support** - English-only for initial version

## Design Considerations

### UI/UX Requirements
- **Clean, modern interface** using existing component library from Vapi demo project
- **Accessibility compliance** with proper color contrast and keyboard navigation
- **Responsive design** optimized for desktop and tablet usage
- **Clear visual hierarchy** with role-based navigation and dashboards
- **Consistent component usage** leveraging Radix UI and Tailwind CSS from existing project

### Voice Experience Design
- **Natural conversation flow** with AI prompts designed for restaurant industry context
- **Clear call-to-action** for initiating screening calls
- **Progress indicators** during voice calls
- **Error handling** for call connection issues
- **Voice quality indicators** similar to existing Vapi demo

### Component Reuse
- **Leverage existing Vapi integration components** from the demo project
- **Reuse UI components** (Button, Card, Dialog, Form components)
- **Extend volume level and speech indicators** for screening call interface
- **Build upon existing call management infrastructure**

## Technical Considerations

### Technology Stack
- **Frontend**: Next.js 14+ (matching existing demo project)
- **Styling**: Tailwind CSS with existing component system
- **Voice Integration**: Vapi.ai Web SDK (already configured in demo)
- **File Handling**: Next.js built-in API routes for resume uploads
- **State Management**: React hooks and context (following existing patterns)
- **Form Handling**: React Hook Form with Zod validation (already in demo dependencies)

### Database Requirements
- **Simple JSON file storage** for initial version (can be upgraded later)
- **Local storage** for user session management
- **File system storage** for resume uploads in designated folder structure

### Integration Points
- **Vapi.ai Web SDK**: Voice screening call management
- **File upload API**: Resume storage and retrieval
- **JSON data persistence**: Application and configuration storage

### Performance Considerations
- **File size limits**: 5MB maximum for resume uploads
- **Call quality**: Leverage existing Vapi configuration for optimal voice experience
- **Loading states**: Implement proper loading indicators for file uploads and call initiation

## Success Metrics

### Primary Metrics
1. **Time to Hire Reduction**: Target 50% decrease in overall hiring timeline
2. **Candidate Quality Improvement**: Measured by interview-to-hire conversion rate
3. **Recruiter Efficiency**: Reduction in time spent on initial candidate screening by 70%

### Secondary Metrics
4. **Candidate Satisfaction**: User experience feedback scores for the application process
5. **Screening Completion Rate**: Percentage of candidates who complete voice screening after starting
6. **System Adoption**: Usage frequency by recruiters and admin configuration activity

### Operational Metrics
7. **Voice Call Success Rate**: Percentage of successful screening call completions
8. **Resume Upload Success Rate**: File upload reliability metrics
9. **System Uptime**: Platform availability and performance metrics

## Open Questions

### Technical Questions
1. **Data persistence strategy**: Should we implement a simple database solution or continue with JSON files for v1?
2. **Authentication system**: Do we need user accounts or can we use session-based identification?
3. **Resume parsing**: Should we implement basic resume text extraction for better search/filtering?

### Business Logic Questions
4. **Screening retry policy**: How many times can a candidate retry a failed screening call?
5. **Application expiration**: How long should applications remain active in the system?
6. **Recruiter permissions**: Should there be different permission levels for different types of recruiters?

### Integration Questions
7. **Vapi.ai call limits**: What are the expected call volume requirements and API limits?
8. **File storage scalability**: At what point should we consider cloud storage for resumes?
9. **Backup and recovery**: What are the requirements for data backup and system recovery?

### User Experience Questions
10. **Accessibility requirements**: Are there specific accessibility standards we need to meet?
11. **Browser compatibility**: Which browsers and versions need to be supported?
12. **Error recovery**: How should the system handle partial application submissions or call failures?

---

**Document Version**: 1.0  
**Created**: May 28, 2025  
**Target Developer**: Junior Developer  
**Estimated Development Time**: 4-6 weeks  
**Priority**: High
