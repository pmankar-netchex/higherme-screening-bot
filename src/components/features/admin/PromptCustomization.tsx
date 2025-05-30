'use client';

import { useState, useEffect } from 'react';
import { VapiConfig } from '@/lib/integrations/vapi/vapiConfig';

interface PromptCustomizationProps {
  vapiSettings: VapiConfig;
  onUpdate: (settings: Partial<VapiConfig>) => void;
}

export default function PromptCustomization({ vapiSettings, onUpdate }: PromptCustomizationProps) {
  const [settings, setSettings] = useState<Partial<VapiConfig>>(vapiSettings);
  const [customTone, setCustomTone] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form with settings data
  useEffect(() => {
    if (vapiSettings) {
      setSettings({
        conversationTone: vapiSettings.conversationTone
      });
    }
  }, [vapiSettings]);

  // Handle tone selection change
  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === 'custom') {
      setShowPreview(true);
    } else {
      setSettings({
        ...settings,
        conversationTone: value
      });
      setCustomTone('');
      setShowPreview(true);
    }
  };

  // Handle custom tone input change
  const handleCustomToneChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setCustomTone(value);
    setSettings({
      ...settings,
      conversationTone: value
    });
  };

  // Preview the tone effect
  const getPromptPreview = () => {
    const tone = settings.conversationTone || 'friendly and professional';
    return `You are an AI assistant conducting a screening interview for a Server position at a restaurant.
Your goal is to assess the candidate's experience, availability, and fit for the role in a ${tone} manner.

IMPORTANT GUIDELINES:
- Keep the conversation brief (2-3 minutes) and focused on gathering key information.
- Use a ${tone} tone throughout the conversation.
- Ask questions directly and one at a time, waiting for responses.
- Do not provide evaluative feedback to the candidate during the call.`;
  };

  // Save changes
  const handleSave = () => {
    onUpdate({
      conversationTone: settings.conversationTone || 'friendly and professional'
    });
  };

  // Get greeting examples based on conversation tone
  const getGreetingExamples = () => {
    const tone = settings.conversationTone?.toLowerCase() || 'friendly and professional';
    
    const examples = {
      'friendly and professional': [
        "Hi there! I'm the AI assistant conducting your screening today.",
        "Welcome! I'll be asking you a few questions about your experience."
      ],
      'warm and conversational': [
        "Hello! How are you doing today? I'm excited to learn more about you!",
        "Hi there! Thanks for taking the time to chat with me today."
      ],
      'formal and structured': [
        "Good day. I will be conducting your initial screening interview.",
        "Thank you for your application. Let us proceed with the screening process."
      ],
      'casual and relaxed': [
        "Hey! Thanks for checking in today. Let's chat about your experience.",
        "What's up? I'm going to ask you some quick questions about your background."
      ],
      'enthusiastic and energetic': [
        "Hi there! Super excited to be talking with you about this amazing opportunity!",
        "Welcome! I can't wait to hear all about your experience and skills!"
      ],
      'custom': [
        "Custom greeting based on your tone settings",
        "Another example of your custom tone in action"
      ]
    };
    
    // Find the best match for the current tone
    const toneKey = Object.keys(examples).find(key => 
      tone.includes(key) || key.includes(tone)
    ) || 'friendly and professional';
    
    return examples[toneKey as keyof typeof examples];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Conversation Tone</h3>
        <p className="text-sm text-gray-600">Customize how the AI assistant speaks and interacts with candidates during screening calls.</p>
      </div>

      {/* Tone Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Conversation Tone & Style</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Tone</label>
            <select 
              value={customTone ? 'custom' : settings.conversationTone}
              onChange={handleToneChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="friendly and professional">Friendly and Professional (Default)</option>
              <option value="warm and conversational">Warm and Conversational</option>
              <option value="formal and structured">Formal and Structured</option>
              <option value="casual and relaxed">Casual and Relaxed</option>
              <option value="enthusiastic and energetic">Enthusiastic and Energetic</option>
              <option value="custom">Custom Tone...</option>
            </select>
          </div>
          
          {/* Custom tone input */}
          {customTone !== '' || settings.conversationTone === 'custom' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Tone Description</label>
              <textarea 
                value={customTone || ''}
                onChange={handleCustomToneChange}
                placeholder="Describe the tone in detail, e.g., 'friendly but formal, with occasional humor'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Conversation Preview */}
      {showPreview && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center justify-between">
            <span>Conversation Preview</span>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Hide Preview
            </button>
          </h4>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">The AI will use this tone throughout the conversation:</h5>
            <div className="mb-4">
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-sm font-medium text-blue-800 mb-1">Greeting Examples:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {getGreetingExamples().map((example, index) => (
                    <li key={index} className="text-sm text-blue-700">{example}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-md">
                <p className="text-sm font-medium text-indigo-800 mb-1">System Prompt Preview:</p>
                <pre className="text-xs text-indigo-700 whitespace-pre-wrap font-mono bg-indigo-100 p-2 rounded">
                  {getPromptPreview()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Prompt Settings
        </button>
      </div>
    </div>
  );
}
