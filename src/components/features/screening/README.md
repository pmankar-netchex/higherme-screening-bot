# Unified Voice Screening Call Component

This component combines the best features from both `VoiceScreeningCall` and `EnhancedVoiceScreening` components to provide a more maintainable, reliable solution for voice screening calls.

## Features

- 🔄 **Enhanced Error Handling**: Improved error detection, logging, and recovery
- 📊 **State Conflict Detection**: Automatically identifies and resolves inconsistent call states
- 🔁 **Automatic Retries**: Retries call data retrieval when necessary
- 📝 **Comprehensive Analysis**: Performs in-depth analysis of call transcripts and summaries
- 📈 **Advanced Monitoring**: Detailed logging and diagnostics for better debugging
- 🎛️ **Configurable Options**: Customizable retry behavior, debug info, and more

## Usage

```tsx
import { UnifiedVoiceScreeningCall } from '@/components/features/screening';

// Basic usage
<UnifiedVoiceScreeningCall
  jobId="job-123"
  candidateId="candidate-456"
  applicationId="app-789"
/>

// With all options
<UnifiedVoiceScreeningCall
  jobId="job-123"
  candidateId="candidate-456"
  applicationId="app-789"
  job={jobData}
  candidate={candidateData}
  onCallStart={() => console.log('Call started')}
  onCallEnd={(data) => console.log('Call ended with data:', data)}
  onCallError={(error) => console.error('Call error:', error)}
  onDataRetrieved={(data) => console.log('Retrieved data:', data)}
  autoRetry={true}
  maxRetryAttempts={5}
  showDebugInfo={false}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `jobId` | string | Yes | - | ID of the job being screened for |
| `candidateId` | string | Yes | - | ID of the candidate being screened |
| `applicationId` | string | Yes | - | ID of the job application |
| `job` | Job | No | - | Job object with title and department info |
| `candidate` | Candidate | No | - | Candidate object with personal info |
| `onCallStart` | function | No | - | Callback when call starts |
| `onCallEnd` | function | No | - | Callback when call ends, with call data |
| `onCallError` | function | No | - | Callback when error occurs |
| `onDataRetrieved` | function | No | - | Callback when call data is retrieved |
| `autoRetry` | boolean | No | true | Whether to auto retry data retrieval |
| `maxRetryAttempts` | number | No | 5 | Maximum number of retry attempts |
| `showDebugInfo` | boolean | No | false | Show debug information in UI |

## Integration with Existing Systems

This component is fully compatible with the existing screening service and can be used as a drop-in replacement for both `VoiceScreeningCall` and `EnhancedVoiceScreening`. It integrates with:

- Screening records database
- Vapi API for call handling
- Transcript analysis services
- Error monitoring systems

## Implementation Details

The unified component incorporates the following improvements:

1. **Cleaner State Management**: Uses React's useState and useRef hooks for more predictable state updates
2. **Enhanced Error Logging**: Captures and categorizes errors for better debugging
3. **Call State Conflict Resolution**: Automatically detects and resolves inconsistencies in call data
4. **Comprehensive Data Retrieval**: Multiple strategies to ensure call data is properly retrieved
5. **Improved Cleanup**: Proper cleanup of timers and event listeners to prevent memory leaks
6. **Better Type Safety**: Enhanced TypeScript interfaces for better code completion and error checking

## Migrating from Older Components

To migrate from the older components, simply replace:

```tsx
import { VoiceScreeningCall } from '@/components/features/screening/VoiceScreeningCall';
// or
import { EnhancedVoiceScreening } from '@/components/features/screening/EnhancedVoiceScreening';
```

with:

```tsx
import { UnifiedVoiceScreeningCall } from '@/components/features/screening';
```

And update the component name in your JSX. All props are compatible with both previous components.
