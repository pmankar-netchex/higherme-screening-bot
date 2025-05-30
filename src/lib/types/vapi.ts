/**
 * Type definitions for Vapi.ai SDK
 */

export interface VapiCallSummary {
  summary?: string;
  transcript?: string;
  audioUrl?: string;
  [key: string]: any;
}

export interface VapiErrorDetail {
  message?: string;
  statusCode?: number;
  [key: string]: any;
}

export interface VapiError {
  error?: VapiErrorDetail;
  [key: string]: any;
}

export interface VapiEvents {
  'call-start': () => void;
  'call-end': (summary: VapiCallSummary) => void;
  'speech-start': () => void;
  'speech-end': () => void;
  'volume-level': (level: number) => void;
  'error': (error: VapiError) => void;
  [key: string]: any;
}

export interface VapiSdk {
  on<K extends keyof VapiEvents>(event: K, listener: VapiEvents[K]): void;
  start(options: any): void;
  stop(): void;
  [key: string]: any;
}
