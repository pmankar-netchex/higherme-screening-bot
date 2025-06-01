'use client';

import { useState, useEffect } from 'react';
import { VapiConfig } from '@/lib/integrations/vapi/vapiConfig';
import { generateScreeningSystemPrompt } from '@/lib/integrations/vapi/vapiConfig';

interface PromptCustomizationProps {
  vapiSettings: VapiConfig;
  onUpdate: (settings: Partial<VapiConfig>) => void;
}

export default function PromptCustomization({ vapiSettings, onUpdate }: PromptCustomizationProps) {
  const [settings, setSettings] = useState<Partial<VapiConfig>>(vapiSettings);
  const [customTone, setCustomTone] = useState('');
  const [activeTab, setActiveTab] = useState<'tone' | 'system' | 'analysis'>('tone');
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form with settings data
  useEffect(() => {
    if (vapiSettings) {
      setSettings({
        conversationTone: vapiSettings.conversationTone,
        customSystemPrompt: vapiSettings.customSystemPrompt,
        customAnalysisPrompt: vapiSettings.customAnalysisPrompt
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

  // Handle system prompt change
  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setSettings({
      ...settings,
      customSystemPrompt: value
    });
  };

  // Handle analysis prompt change
  const handleAnalysisPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setSettings({
      ...settings,
      customAnalysisPrompt: value
    });
  };

  // Reset system prompt to default
  const resetSystemPrompt = () => {
    setSettings({
      ...settings,
      customSystemPrompt: undefined
    });
  };

  // Reset analysis prompt to default
  const resetAnalysisPrompt = () => {
    setSettings({
      ...settings,
      customAnalysisPrompt: undefined
    });
  };

  // Get default system prompt for preview
  const getDefaultSystemPrompt = () => {
    return generateScreeningSystemPrompt(
      '{jobTitle}',
      'server',
      ['{roleSpecificQuestions}'],
      settings.conversationTone || 'friendly and professional'
    );
  };

  // Get default analysis prompt for preview
  const getDefaultAnalysisPrompt = () => {
    return `Analyze this {jobTitle} screening call and provide a structured summary including:
1. Candidate's relevant experience
2. Availability (shifts, weekends, transportation)
3. Key responses to role-specific questions
4. Overall assessment of communication skills
5. Any concerns or red flags

Format the response as a clear, professional summary for hiring managers.`;
  };

  // Save changes
  const handleSave = () => {
    onUpdate({
      conversationTone: settings.conversationTone || 'friendly and professional',
      customSystemPrompt: settings.customSystemPrompt,
      customAnalysisPrompt: settings.customAnalysisPrompt
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
        <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Prompt Customization</h3>
        <p className="text-sm text-gray-600">Customize the AI assistant's conversation style, system instructions, and analysis prompts for screening calls.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tone')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tone'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Conversation Tone
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Prompt
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis Prompt
            </button>
          </nav>
        </div>
      </div>

      {/* Conversation Tone Tab */}
      {activeTab === 'tone' && (
        <div>
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Conversation Tone & Style</h4>
            <p className="text-sm text-gray-600 mb-4">Control how the AI assistant speaks and interacts with candidates during screening calls.</p>
            
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
              {(customTone !== '' || settings.conversationTone === 'custom') && (
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
              )}
            </div>
          </div>

          {/* Tone Preview */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span>Tone Preview</span>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </h4>
            
            {showPreview && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-800 mb-1">Greeting Examples:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {getGreetingExamples().map((example, index) => (
                      <li key={index} className="text-sm text-blue-700">{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Prompt Tab */}
      {activeTab === 'system' && (
        <div>
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">System Prompt Customization</h4>
            <p className="text-sm text-gray-600 mb-4">Customize the core instructions that guide the AI assistant during screening interviews. Use variables like {'{jobTitle}'}, {'{roleType}'}, {'{conversationTone}'}, and {'{roleSpecificQuestions}'} for dynamic content.</p>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Custom System Prompt</label>
                <div className="space-x-2">
                  <button
                    onClick={resetSystemPrompt}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
              <textarea
                value={settings.customSystemPrompt || ''}
                onChange={handleSystemPromptChange}
                placeholder="Enter custom system prompt or leave empty to use default..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                rows={12}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{jobTitle}'}, {'{roleType}'}, {'{conversationTone}'}, {'{roleSpecificQuestions}'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Default System Prompt (for reference):</h5>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-100 p-3 rounded max-h-60 overflow-y-auto">
                {getDefaultSystemPrompt()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Prompt Tab */}
      {activeTab === 'analysis' && (
        <div>
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Analysis Prompt Customization</h4>
            <p className="text-sm text-gray-600 mb-4">Customize how the AI analyzes and summarizes screening calls for recruiters. This prompt guides the post-call analysis and summary generation.</p>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Custom Analysis Prompt</label>
                <div className="space-x-2">
                  <button
                    onClick={resetAnalysisPrompt}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
              <textarea
                value={settings.customAnalysisPrompt || ''}
                onChange={handleAnalysisPromptChange}
                placeholder="Enter custom analysis prompt or leave empty to use default..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{jobTitle}'} (job title will be automatically substituted)
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Default Analysis Prompt (for reference):</h5>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-100 p-3 rounded">
                {getDefaultAnalysisPrompt()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
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
