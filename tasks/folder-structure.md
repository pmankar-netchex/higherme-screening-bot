# Ideal Folder Structure for Restaurant Recruitment Platform

## Current Issues Analysis

### Problems Identified:
1. **Duplicate Type Definitions**: Both `lib/types/` and `lib/shared/types/` exist with overlapping content
2. **Duplicate Data Management**: Both `lib/data/` and `lib/server/services/` contain similar CRUD operations
3. **Mixed Server/Client Code**: Files ending with `-server.ts` mixed with client-side files
4. **Inconsistent API Structure**: API routes scattered across different patterns
5. **Component Organization**: Components mixed between domain-specific and role-specific folders

## Proposed Ideal Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Route groups for different user types
│   │   ├── admin/
│   │   │   ├── config/
│   │   │   ├── jobs/
│   │   │   └── screening/
│   │   ├── candidate/
│   │   │   ├── apply/
│   │   │   └── screening/
│   │   └── recruiter/
│   │       ├── applications/
│   │       ├── candidates/
│   │       └── screening/
│   ├── api/                      # API Routes
│   │   ├── admin/
│   │   │   ├── config/
│   │   │   └── screening/
│   │   ├── applications/
│   │   │   └── [id]/
│   │   ├── candidates/
│   │   │   └── [id]/
│   │   ├── jobs/
│   │   │   └── [id]/
│   │   ├── screening/
│   │   │   ├── status/
│   │   │   └── summary/
│   │   └── upload/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable UI Components
│   ├── ui/                       # Base UI components (buttons, forms, etc.)
│   ├── forms/                    # Form components
│   │   ├── JobForm.tsx
│   │   ├── ResumeUpload.tsx
│   │   └── ScreeningConfig.tsx
│   ├── cards/                    # Card components
│   │   ├── JobCard.tsx
│   │   ├── CandidateCard.tsx
│   │   └── ApplicationCard.tsx
│   ├── lists/                    # List components
│   │   ├── ApplicantList.tsx
│   │   └── JobsList.tsx
│   ├── dialogs/                  # Modal/Dialog components
│   │   ├── ConfigBackupRestore.tsx
│   │   └── ConfirmDialog.tsx
│   └── features/                 # Feature-specific complex components
│       ├── screening/
│       │   ├── VoiceScreeningCall.tsx
│       │   ├── ScreeningSummary.tsx
│       │   └── VoiceSettings.tsx
│       ├── admin/
│       │   ├── AdminConfigPanel.tsx
│       │   ├── EvaluationCriteriaConfig.tsx
│       │   └── RoleTypeManagement.tsx
│       └── recruitment/
│           ├── CandidateDetails.tsx
│           ├── CandidateStatusTracker.tsx
│           └── RecruiterNotes.tsx
├── lib/                          # Business Logic & Utilities
│   ├── types/                    # All TypeScript type definitions
│   │   ├── index.ts              # Re-export all types
│   │   ├── application.ts
│   │   ├── candidate.ts
│   │   ├── job.ts
│   │   ├── screening.ts
│   │   ├── common.ts
│   │   └── vapi.ts
│   ├── services/                 # Business logic services
│   │   ├── application-service.ts
│   │   ├── candidate-service.ts
│   │   ├── job-service.ts
│   │   ├── screening-service.ts
│   │   └── file-service.ts
│   ├── data/                     # Data access layer
│   │   ├── repositories/         # Data repositories (file-based)
│   │   │   ├── application-repository.ts
│   │   │   ├── candidate-repository.ts
│   │   │   ├── job-repository.ts
│   │   │   ├── screening-repository.ts
│   │   │   └── config-repository.ts
│   │   └── validators/           # Data validation schemas
│   │       ├── application-validator.ts
│   │       ├── candidate-validator.ts
│   │       └── job-validator.ts
│   ├── integrations/             # External integrations
│   │   ├── vapi/
│   │   │   ├── vapi-client.ts
│   │   │   ├── vapi-config.ts
│   │   │   └── call-handler.ts
│   │   └── file-upload/
│   │       ├── upload-handler.ts
│   │       └── file-validator.ts
│   ├── utils/                    # Utility functions
│   │   ├── export-utils.ts
│   │   ├── template-utils.ts
│   │   ├── workflow-utils.ts
│   │   ├── date-utils.ts
│   │   └── format-utils.ts
│   └── config/                   # Configuration files
│       ├── constants.ts
│       ├── file-paths.ts
│       └── default-config.ts
├── hooks/                        # Custom React hooks
│   ├── use-applications.ts
│   ├── use-candidates.ts
│   ├── use-jobs.ts
│   ├── use-screening.ts
│   └── use-file-upload.ts
├── data/                         # JSON data storage
│   ├── applications.json
│   ├── candidates.json
│   ├── jobs.json
│   ├── screenings.json
│   └── config.json
├── public/
│   └── uploads/
│       └── resumes/
│           └── README.md
├── styles/                       # Global styles (if needed beyond globals.css)
└── docs/                         # Documentation (if needed)
    └── api.md
```

## Key Principles Applied

### 1. Single Responsibility
- Each file/folder has a clear, single purpose
- No mixing of client and server-side code in same files
- Clear separation between data access, business logic, and presentation

### 2. Domain-Driven Organization
- Components organized by UI patterns (`cards/`, `forms/`, `lists/`) and features
- Services organized by business domain
- Types consolidated in one location

### 3. Dependency Direction
- Data layer (`repositories/`) → Service layer (`services/`) → UI layer (`components/`, `app/`)
- No circular dependencies
- Clear import hierarchy

### 4. Scalability
- Easy to add new features
- Easy to find and modify existing code
- Consistent naming patterns

### 5. Framework Best Practices
- Follows Next.js 14 App Router conventions
- Proper API route organization
- Component structure follows React patterns

## Migration Benefits

1. **Eliminated Duplicates**: No more duplicate type definitions or data management code
2. **Clear Separation**: Client vs server code clearly separated
3. **Better Discoverability**: Logical organization makes code easy to find
4. **Improved Maintainability**: Consistent patterns throughout
5. **Enhanced Testing**: Clear boundaries make unit testing easier
6. **Better Performance**: Proper separation allows for better code splitting

## Files to Remove/Consolidate

### Remove:
- `lib/data/applications.ts` (client-side, merge into service)
- `lib/data/candidates.ts` (client-side, merge into service)
- `lib/data/jobs.ts` (client-side, merge into service)
- `lib/types/applications.ts` (duplicate)
- `lib/types/candidates.ts` (duplicate)
- `lib/types/jobs.ts` (duplicate)
- `lib/types/vapi.ts` (move to integrations)
- All `*-server.ts` files (consolidate into services/repositories)

### Consolidate:
- All types into `lib/types/`
- All data operations into `lib/data/repositories/`
- All business logic into `lib/services/`
- All UI components into logical `components/` subfolders

This structure provides a clean, maintainable, and scalable foundation for the restaurant recruitment platform.
