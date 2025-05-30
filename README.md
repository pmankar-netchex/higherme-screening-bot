# Restaurant Recruitment Platform

A Next.js application for restaurant recruitment with voice screening capabilities using Vapi.ai.

## Recent Updates

- **Folder Structure Reorganization**: The codebase has been reorganized into a more modular structure in the `src/` directory
- **Component Migration**: All UI components have been moved to their proper locations under `src/components/`
- **Data Layer Improvements**: Created repositories and services for better separation of concerns
- **Type Consolidation**: All types are now consolidated in a single location
- **Build Configuration**: Updated Next.js configuration for better development and production builds
- **Client-side Rendering Fixes**: Added dynamic imports and proper Suspense boundaries for components using client-side features

## Project Structure

This project follows a modern, modular file structure:

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Route groups for user types
│   ├── api/                      # API Routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # UI Components
│   ├── ui/                       # Base components
│   ├── forms/                    # Form components
│   ├── cards/                    # Card components
│   ├── lists/                    # List components
│   ├── dialogs/                  # Modal components
│   └── features/                 # Feature components
├── lib/                          # Business Logic & Utilities
│   ├── types/                    # TypeScript types
│   ├── services/                 # Business logic
│   ├── data/                     # Data access
│   ├── integrations/             # External integrations
│   ├── utils/                    # Utility functions
│   └── config/                   # Configuration
├── hooks/                        # React hooks
└── styles/                       # Additional styles
```

## Features

- Job posting and management
- Candidate application processing
- Automated voice screening with Vapi.ai
- Application workflow management
- Resume upload and management
- Recruiter review dashboard

## Data Storage

The application uses JSON files for data storage, located in the `/data` directory:

- `applications.json` - Application data
- `candidates.json` - Candidate information
- `jobs.json` - Job listings
- `screenings.json` - Voice screening results
- `config.json` - System configuration

## Running the Application

### Development Mode

```bash
npm run dev
# or
./dev-from-src.sh
```

### Production Mode

```bash
npm run build
npm run start
# or
./launch-from-src.sh
```

## API Routes

- `/api/jobs` - Job management
- `/api/candidates` - Candidate management
- `/api/applications` - Application processing
- `/api/screening` - Voice screening integration
- `/api/upload` - File upload handling
- `/api/admin` - Admin configuration

## Architecture

The application follows a layered architecture:

1. **UI Layer** (`src/components/`, `src/app/`): Presentation and routing
2. **Services Layer** (`src/lib/services/`): Business logic and workflows
3. **Data Access Layer** (`src/lib/data/repositories/`): Data persistence and retrieval
4. **Integration Layer** (`src/lib/integrations/`): External API integrations

## Development Notes

### Client-Side Rendering

Components that use `useSearchParams()` or other client-side APIs are configured with:

1. Dynamic imports with SSR disabled:
   ```typescript
   const DynamicComponent = dynamic(() => import('./component'), { ssr: false });
   ```

2. Suspense boundaries for loading states:
   ```tsx
   <Suspense fallback={<Loading />}>
     <DynamicComponent />
   </Suspense>
   ```

### Next.js Configuration

The Next.js configuration is optimized for both development and production:

- TypeScript errors are ignored in production builds
- Dynamic rendering is enabled for routes with client components
- Import aliases are configured for cleaner imports
