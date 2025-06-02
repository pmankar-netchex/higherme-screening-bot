# Restaurant Recruitment Platform

A comprehensive Next.js 14 application for restaurant recruitment featuring AI-powered voice screening capabilities using Vapi.ai. This platform revolutionizes the hiring process by automating initial candidate screenings, managing applications end-to-end, and providing intelligent recruitment workflows specifically designed for the restaurant industry.

## 🚀 Key Features

### For Administrators
- **Complete Job Management**: Create, edit, and manage job postings for all restaurant positions (servers, cooks, hosts, managers, etc.)
- **Advanced System Configuration**: Configure application workflows, screening parameters, and recruitment processes
- **AI Screening Configuration**: Set up role-specific screening questions, evaluation criteria, and conversation flows
- **Role Type Management**: Manage restaurant departments, position hierarchies, and custom role requirements
- **Configuration Backup/Restore**: Export and import complete system configurations for disaster recovery
- **Real-time Analytics Dashboard**: Monitor system performance, application metrics, and recruitment statistics
- **Voice Settings Management**: Configure Vapi.ai voice assistants, conversation tone, and AI prompts

### For Recruiters
- **Comprehensive Application Review**: Advanced dashboard with filtering, sorting, and bulk operations
- **Intelligent Candidate Management**: Track candidates through the complete recruitment lifecycle with visual workflows
- **AI-Generated Screening Insights**: Access detailed screening summaries, strengths/concerns analysis, and hiring recommendations
- **Advanced Export Capabilities**: Export candidate data, screening results, and comprehensive reports in multiple formats
- **Real-time Status Tracking**: Monitor application progress with live updates and automated notifications
- **Candidate Communication Tools**: Manage follow-ups, interview scheduling, and decision communications
- **Performance Analytics**: View recruitment metrics, time-to-hire statistics, and screening effectiveness

### For Candidates
- **Intuitive Job Discovery**: Browse available restaurant positions with detailed role descriptions and requirements
- **Streamlined Application Process**: Simple, mobile-friendly application with resume upload and validation
- **AI Voice Screening Experience**: Complete intelligent voice interviews with role-specific questions and real-time feedback
- **Application Progress Tracking**: Monitor application status, next steps, and estimated timelines
- **Interview Preparation**: Access screening guidelines and preparation resources
- **Mobile-Optimized Interface**: Complete application process from any device

## 🏗️ Architecture & Technology Stack

### Frontend Technologies
- **Next.js 14**: App Router architecture with server-side rendering, client components, and API routes
- **React 18**: Modern React with hooks, concurrent features, and server components
- **TypeScript**: Full type safety with strict mode and comprehensive type definitions
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible, unstyled UI primitives for forms, dialogs, and interactive components
- **Lucide React**: Beautiful, customizable SVG icons with consistent design language
- **React Hook Form**: Advanced form handling with validation and error management
- **Zod**: Runtime type validation and schema definition

### Backend & Infrastructure
- **Next.js API Routes**: RESTful API endpoints with middleware and authentication
- **File-based Data Storage**: JSON files for rapid development (easily upgradeable to databases)
- **Server Actions**: Server-side operations with proper validation and error handling
- **File Upload System**: Secure resume storage with validation, sanitization, and size limits
- **Workflow Engine**: Custom application status management and process automation
- **Error Monitoring**: Comprehensive error tracking and performance monitoring

### AI & Voice Integration
- **Vapi.ai Web SDK**: Advanced voice AI for natural candidate screening conversations
- **Structured AI Analysis**: Intelligent evaluation with role-specific criteria and scoring
- **Real-time Voice Processing**: Live conversation handling with instant transcription
- **Custom AI Prompts**: Configurable conversation flows for different restaurant roles
- **Screening Summary Generation**: Automated candidate assessment with strengths/concerns analysis

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── admin/                    # Administrator portal
│   │   ├── config/               # System configuration management
│   │   ├── jobs/                 # Job posting management
│   │   ├── screening/            # AI screening configuration
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # RESTful API Routes
│   │   ├── admin/                # Admin APIs (config, screening settings)
│   │   ├── applications/         # Application CRUD operations
│   │   ├── candidates/           # Candidate management endpoints
│   │   ├── jobs/                 # Job posting operations
│   │   ├── screening/            # Screening process APIs
│   │   ├── screenings/           # Screening data management
│   │   ├── upload/               # File upload handling
│   │   └── vapi/                 # Vapi.ai integration endpoints
│   ├── candidate/                # Candidate portal
│   │   ├── apply/[jobId]/        # Job application flow
│   │   ├── screening/            # Voice screening interface
│   │   └── page.tsx              # Candidate dashboard
│   ├── recruiter/                # Recruiter portal
│   │   ├── applications/         # Application review dashboard
│   │   ├── candidate/[id]/       # Individual candidate details
│   │   ├── screening/            # Screening results management
│   │   └── page.tsx              # Recruiter dashboard
│   ├── screening/                # Shared screening components
│   ├── globals.css               # Global styles and Tailwind imports
│   ├── layout.tsx                # Root application layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable UI Components
│   ├── ui/                       # Base UI components (buttons, forms, dialogs)
│   ├── forms/                    # Specialized form components
│   ├── features/                 # Feature-specific complex components
│   │   ├── recruitment/          # Recruitment-specific components
│   │   ├── screening/            # AI screening components
│   │   └── admin/                # Admin panel components
│   ├── dialogs/                  # Modal and dialog components
│   └── lists/                    # List and table components
├── lib/                          # Business Logic & Utilities
│   ├── types/                    # TypeScript type definitions
│   │   ├── application.ts        # Application workflow types
│   │   ├── candidate.ts          # Candidate profile types
│   │   ├── job.ts                # Job posting types
│   │   ├── screening.ts          # AI screening types
│   │   └── common.ts             # Shared utility types
│   ├── services/                 # Business logic services
│   │   ├── applicationService.ts # Application management
│   │   ├── candidateService.ts   # Candidate operations
│   │   ├── screeningService.ts   # Screening process logic
│   │   └── jobService.ts         # Job posting management
│   ├── data/repositories/        # Data access layer
│   │   ├── applicationRepo.ts    # Application data operations
│   │   ├── candidateRepo.ts      # Candidate data operations
│   │   └── screeningRepo.ts      # Screening data operations
│   ├── servers/                  # Server-side data operations
│   │   ├── applications-server.ts
│   │   ├── candidates-server.ts
│   │   └── jobs-server.ts
│   ├── integrations/             # External service integrations
│   │   └── vapi/                 # Vapi.ai integration
│   ├── screening/                # AI screening logic
│   │   ├── screeningConfig.ts    # Configuration management
│   │   └── questionBuilder.ts    # Dynamic question generation
│   ├── monitoring/               # Error tracking and analytics
│   ├── workflow/                 # Application workflow management
│   ├── utils/                    # Utility functions
│   └── config/                   # Configuration files
├── hooks/                        # Custom React hooks
│   ├── use-search-params.tsx     # URL search parameter management
│   └── use-vapi-error-tracking.tsx # Vapi.ai error handling
└── data/                         # JSON data storage
    ├── applications.json         # Application records
    ├── candidates.json           # Candidate profiles
    ├── jobs.json                 # Job postings
    ├── screenings.json           # Screening results
    └── config.json               # System configuration
```
src/
├── app/                          # Next.js 14 App Router
│   ├── admin/                    # Administrator pages
│   │   ├── config/               # System configuration
│   │   ├── jobs/                 # Job management
│   │   ├── screening/            # Screening configuration
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin APIs (config, screening)
│   │   ├── applications/         # Application management
│   │   ├── candidates/           # Candidate operations
│   │   ├── jobs/                 # Job CRUD operations
│   │   ├── screening/            # Screening APIs
│   │   ├── upload/               # File upload handling
│   │   └── vapi/                 # Vapi.ai integration
│   ├── candidate/                # Candidate portal
│   │   ├── apply/                # Job application flow
│   │   ├── screening/            # Voice screening interface
│   │   └── page.tsx              # Candidate dashboard
│   ├── recruiter/                # Recruiter portal
│   │   ├── applications/         # Application review
│   │   ├── candidate/            # Candidate details
│   │   ├── screening/            # Screening results
│   │   └── page.tsx              # Recruiter dashboard
│   ├── screening/                # Shared screening components
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable UI Components
│   ├── ui/                       # Base components (buttons, forms, etc.)
│   ├── forms/                    # Form components
│   ├── cards/                    # Card components
│   ├── lists/                    # List and table components
│   ├── dialogs/                  # Modal and dialog components
│   └── features/                 # Feature-specific components
│       ├── admin/                # Admin-specific components
│       ├── recruitment/          # Recruitment workflow components
│       └── screening/            # Voice screening components
├── lib/                          # Business Logic & Utilities
│   ├── types/                    # TypeScript type definitions
│   ├── services/                 # Business logic services
│   ├── data/                     # Data access layer
│   │   ├── repositories/         # Data repositories
│   │   └── validators/           # Data validation
│   ├── servers/                  # Server-side utilities
│   ├── integrations/             # External API integrations
│   ├── screening/                # Screening logic and configuration
│   ├── monitoring/               # Error tracking and analytics
│   ├── workflow/                 # Application workflow management
│   ├── utils/                    # Utility functions
│   └── config/                   # Configuration constants
├── hooks/                        # Custom React hooks
└── styles/                       # Additional styles
```

## 💾 Data Storage & Management

The application employs a sophisticated hybrid approach for data storage, optimized for development speed and easy deployment:

### JSON File Storage
Located in the `/data` directory for transparent development and simple deployment:
- **`applications.json`** - Complete application records with workflow tracking, status history, and timeline
- **`candidates.json`** - Candidate profiles including personal information, screening results, and application history
- **`jobs.json`** - Job postings with requirements, status, and application statistics
- **`screenings.json`** - AI voice screening results, transcripts, summaries, and evaluation scores
- **`config.json`** - System-wide configuration including screening settings, role definitions, and notification templates

### File Storage System
- **Resume Storage**: `/public/uploads/resumes/` - Secure file upload with comprehensive validation
- **Configuration Backups**: Automated system configuration backups with versioning and restore functionality
- **File Validation**: Multi-layer validation including file type, size limits, virus scanning, and content verification
- **Storage Optimization**: Automatic file cleanup, compression, and organized directory structure

### Data Architecture & Patterns
The application follows a robust repository pattern with clear separation of concerns:

1. **Repository Layer**: Direct file system operations with error handling (`src/lib/data/repositories/`)
2. **Service Layer**: Business logic, validation, and data transformation (`src/lib/services/`)
3. **Server Layer**: Server-side operations with caching and optimization (`src/lib/servers/`)
4. **API Layer**: RESTful endpoints with proper status codes and error handling (`src/app/api/`)

### Data Consistency & Integrity
- **Atomic Operations**: File writes with atomic operations to prevent data corruption
- **Validation Layers**: Multiple validation points from frontend to backend
- **Error Recovery**: Automatic backup restoration and data recovery mechanisms
- **Audit Trail**: Complete application timeline tracking for compliance and debugging

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm equivalent)
- **Vapi.ai Account**: For AI voice screening functionality
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with WebRTC support

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-recruitment-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VAPI_PUBLIC_KEY=your_vapi_public_key_here
   VAPI_PRIVATE_KEY=your_vapi_private_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   UPLOAD_MAX_SIZE=10485760
   UPLOAD_ALLOWED_TYPES=application/pdf
   ```

4. **Initialize data directories**
   ```bash
   mkdir -p data public/uploads/resumes
   ```

5. **Set up initial data files**
   The application will automatically create initial data files on first run, or you can create them manually:
   ```bash
   echo '[]' > data/applications.json
   echo '[]' > data/candidates.json
   echo '[]' > data/jobs.json
   echo '[]' > data/screenings.json
   echo '{}' > data/config.json
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Access the application**
   - **Landing Page**: [http://localhost:3000](http://localhost:3000)
   - **Candidate Portal**: [http://localhost:3000/candidate](http://localhost:3000/candidate)
   - **Recruiter Dashboard**: [http://localhost:3000/recruiter](http://localhost:3000/recruiter)
   - **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Initial Configuration
1. Navigate to the Admin Panel
2. Configure job roles and screening questions
3. Set up notification templates and workflow settings
4. Create your first job posting
5. Test the complete application flow from candidate application to recruiter review

## 📡 API Documentation

### Core Endpoints

#### Jobs Management
- **`GET /api/jobs`** - Retrieve all job listings with filtering and pagination
- **`POST /api/jobs`** - Create new job posting with validation
- **`GET /api/jobs/[id]`** - Get specific job details and requirements
- **`PUT /api/jobs/[id]`** - Update existing job posting
- **`DELETE /api/jobs/[id]`** - Remove job posting (soft delete with application preservation)

#### Candidate Operations
- **`GET /api/candidates`** - List all candidates with search and filtering
- **`POST /api/candidates`** - Create candidate profile with application
- **`GET /api/candidates/[id]`** - Get candidate details with application history
- **`PATCH /api/candidates/[id]`** - Update candidate information and status

#### Application Processing
- **`GET /api/applications`** - Retrieve applications with advanced filtering (candidateId, jobId, status)
- **`POST /api/applications`** - Submit new application with workflow initiation
- **`GET /api/applications/[id]`** - Get specific application details
- **`PUT /api/applications/[id]/status`** - Update application status with timeline tracking

#### Screening Management
- **`GET /api/screening`** - Get screening configurations and results
- **`POST /api/screening`** - Create new screening session
- **`GET /api/screening/details`** - Get detailed screening results with candidate and job context
- **`POST /api/screening/summary`** - Update screening results with AI-generated summary
- **`GET /api/screenings`** - List all screening sessions with filtering

#### File Upload
- **`POST /api/upload`** - Handle resume file uploads with validation and security
- **`GET /api/upload`** - List uploaded files with metadata

#### Admin Configuration
- **`GET /api/admin/config`** - Get complete system configuration
- **`POST /api/admin/config`** - Update system settings and preferences
- **`GET /api/admin/config/backup`** - Export configuration for backup
- **`POST /api/admin/config/restore`** - Restore configuration from backup
- **`GET /api/admin/screening`** - Get screening configuration
- **`POST /api/admin/screening`** - Update screening settings and role configurations

#### Vapi.ai Integration
- **`POST /api/vapi/webhook`** - Handle Vapi.ai webhooks for call events
- **`GET /api/vapi/assistants`** - List available AI assistants
- **`POST /api/vapi/call`** - Initiate screening call session

## 🎯 Workflow & Process Management

### Application Workflow
The platform implements a sophisticated multi-stage recruitment workflow:

1. **Job Posting Creation**: Admin creates detailed job postings with role-specific requirements
2. **Candidate Discovery**: Candidates browse and filter available positions
3. **Application Submission**: Streamlined application process with resume upload and validation
4. **Automatic Screening Initiation**: AI voice screening automatically triggered post-application
5. **AI Interview Execution**: Vapi.ai conducts role-specific voice interviews with intelligent questioning
6. **Screening Analysis**: AI generates comprehensive evaluation with strengths/concerns analysis
7. **Recruiter Review**: Human evaluation of AI analysis with ability to override and add notes
8. **Interview Scheduling**: Traditional interview process with calendar integration
9. **Decision Making**: Hire/reject decisions with automated candidate notifications
10. **Onboarding Initiation**: Seamless transition to HR systems for successful candidates

### Status Tracking System
- **Real-time Updates**: Live status changes propagated across all user interfaces
- **Visual Timeline**: Complete application journey visualization with timestamps
- **Automated Notifications**: Email and in-app notifications at each workflow stage
- **Customizable Processes**: Configurable workflow steps for different restaurant roles
- **Audit Trail**: Complete history of all actions and decisions for compliance

### Role-Specific Workflows
- **Servers**: Focus on customer service skills, availability, and communication
- **Kitchen Staff**: Emphasis on food safety, teamwork, and stress management
- **Management**: Leadership assessment, problem-solving, and operational knowledge
- **Host/Hostess**: Customer interaction, multitasking, and professional presentation

## 🧩 Component Architecture

### UI Component System
The application uses a modular component architecture built on Radix UI primitives:

#### Base UI Components (`src/components/ui/`)
- **Form Controls**: Input, Select, Checkbox, Radio with full accessibility
- **Feedback**: Alert, Toast, Progress with consistent styling
- **Navigation**: Button, Link, Breadcrumb with keyboard support
- **Layout**: Card, Separator, Container with responsive design
- **Overlays**: Dialog, Popover, Tooltip with focus management

#### Feature Components (`src/components/features/`)
- **Recruitment Components**: ApplicantList, CandidateDetails, JobApplicantsOverview
- **Screening Components**: VoiceScreeningCall, ScreeningSummary, ScreeningConfiguration
- **Admin Components**: AdminConfigPanel, RoleTypeManagement, ConfigBackupRestore

#### Form Components (`src/components/forms/`)
- **JobForm**: Dynamic job creation with role-specific fields
- **ResumeUpload**: Drag-drop file upload with progress tracking
- **ScreeningConfig**: AI conversation configuration interface

### State Management & Data Flow

#### Client-Side State
- **React Hook Form**: Form state management with validation
- **URL State**: Search parameters and filters persisted in URL
- **Local Storage**: User preferences and temporary data
- **Context API**: Global application state for user sessions

#### Server-Side State
- **File-based Persistence**: JSON files for data storage
- **Server Actions**: Direct server-side operations
- **API Routes**: RESTful endpoints for data manipulation
- **Caching Strategy**: Intelligent caching for performance optimization

#### Data Synchronization
- **Optimistic Updates**: Immediate UI updates with rollback capability
- **Error Boundaries**: Graceful error handling and recovery
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Real-time Updates**: Live data refresh for collaborative environments

## 🔒 Security & Validation

### Data Validation
- **Frontend Validation**: Real-time form validation with user-friendly error messages
- **Backend Validation**: Server-side validation using Zod schemas
- **File Upload Security**: Multiple layers of file validation and sanitization
- **Input Sanitization**: XSS prevention and data cleaning

### File Security
- **File Type Validation**: Strict MIME type checking for uploaded files
- **Size Limits**: Configurable file size restrictions
- **Virus Scanning**: Integration-ready virus scanning capabilities
- **Storage Security**: Secure file storage with access controls

### API Security
- **Input Validation**: All API inputs validated against strict schemas
- **Error Handling**: Secure error responses without data leakage
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🚀 Deployment & Infrastructure

### Development Deployment
```bash
npm run build
npm run start
```

### Production Considerations
- **Environment Variables**: Secure configuration management
- **File Storage**: Consider cloud storage for production (AWS S3, Google Cloud Storage)
- **Database Migration**: Easy migration path from JSON to PostgreSQL/MongoDB
- **CDN Integration**: Static asset optimization and delivery
- **Monitoring**: Application performance monitoring and error tracking

### Scaling Recommendations
- **Database**: Migrate to PostgreSQL or MongoDB for larger datasets
- **File Storage**: Implement cloud storage for resume files
- **Caching**: Add Redis for session management and data caching
- **Load Balancing**: Implement load balancing for high traffic scenarios

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **ESLint**: Configured for code quality and consistency
- **Prettier**: Automatic code formatting
- **Component Structure**: Consistent component organization and naming
- **API Design**: RESTful API design patterns

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflow testing
- **Performance Tests**: Load testing for screening calls

### Contributing Guidelines
1. **Fork the repository** and create a feature branch
2. **Follow coding standards** and existing patterns
3. **Write comprehensive tests** for new functionality
4. **Update documentation** for any API changes
5. **Submit pull request** with detailed description

## 🔍 Maintenance & Monitoring

### Performance Monitoring
- **API Response Times**: Monitor endpoint performance
- **File Upload Success Rates**: Track upload reliability
- **Screening Call Quality**: Monitor Vapi.ai integration health
- **Error Tracking**: Comprehensive error logging and alerting

### Data Maintenance
- **Regular Backups**: Automated backup scheduling
- **Data Cleanup**: Cleanup old files and expired sessions
- **Performance Optimization**: Regular data structure optimization
- **Security Updates**: Regular dependency updates and security patches

### Analytics & Insights
- **Application Metrics**: Track application submission rates and conversion
- **Screening Effectiveness**: Analyze AI screening accuracy and recruiter feedback
- **User Engagement**: Monitor user behavior and platform usage
- **Performance Benchmarks**: Track system performance and optimization opportunities

## 🗺️ Future Roadmap

### Short-term Enhancements
- **Mobile Application**: Native mobile app for candidates
- **Advanced Analytics**: Comprehensive recruitment analytics dashboard
- **Integration APIs**: Webhooks and API integrations for external systems
- **Multi-language Support**: Internationalization for diverse markets

### Long-term Vision
- **AI Enhancements**: Advanced AI for resume screening and candidate matching
- **Video Interviews**: Integration of video interviewing capabilities
- **Background Checks**: Automated background verification integration
- **Onboarding Automation**: Seamless transition from hiring to onboarding

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, questions, or contributions:
- **Issues**: GitHub Issues for bug reports and feature requests
- **Documentation**: Comprehensive API and component documentation
- **Community**: Developer community for discussions and best practices

---

*Built with ❤️ for the restaurant industry to revolutionize recruitment through AI-powered screening and intelligent workflow automation.*
