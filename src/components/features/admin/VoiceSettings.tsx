'use client';

import { useState, useEffect } from 'react';
import { VapiConfig } from '@/lib/integrations/vapi/vapiConfig';

interface VoiceSettingsProps {
  vapiSettings: VapiConfig;
  onUpdate: (settings: Partial<VapiConfig>) => void;
}

export default function VoiceSettings({ vapiSettings, onUpdate }: VoiceSettingsProps) {
  const [settings, setSettings] = useState<VapiConfig>(vapiSettings);
  const [showProviders, setShowProviders] = useState(false);

  // Initialize form with settings data
  useEffect(() => {
    if (vapiSettings) {
      setSettings(vapiSettings);
    }
  }, [vapiSettings]);

  // Handle input changes
  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle nested object changes
  const handleNestedChange = (category: 'voice' | 'model' | 'transcriber', field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  // Save changes
  const handleSave = () => {
    onUpdate(settings);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Vapi AI Voice Settings</h3>
        <p className="text-sm text-gray-600">Configure the voice, model, and transcriber settings for AI screening calls.</p>
      </div>

      {/* Voice Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2 flex items-center justify-between">
          Voice Settings 
          <button 
            onClick={() => setShowProviders(!showProviders)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showProviders ? 'Hide providers info' : 'Show providers info'}
          </button>
        </h4>

        {showProviders && (
          <div className="mb-4 bg-blue-50 p-3 rounded-md text-sm">
            <p className="font-medium text-blue-700 mb-1">Available Providers:</p>
            <ul className="list-disc pl-5 space-y-1 text-blue-700">
              <li><span className="font-medium">PlayHT</span>: Natural-sounding voices with good emotional range</li>
              <li><span className="font-medium">ElevenLabs</span>: High-quality, emotionally expressive voices</li>
              <li><span className="font-medium">OpenAI</span>: Good quality voices with natural pacing</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voice Provider</label>
            <select 
              value={settings.voice.provider}
              onChange={(e) => handleNestedChange('voice', 'provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="playht">PlayHT</option>
              <option value="elevenlabs">ElevenLabs</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voice ID</label>
            <input 
              type="text" 
              value={settings.voice.voiceId}
              onChange={(e) => handleNestedChange('voice', 'voiceId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., jennifer, alloy, nova"
            />
          </div>
        </div>
      </div>

      {/* Model Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">AI Model Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Provider</label>
            <select 
              value={settings.model.provider}
              onChange={(e) => handleNestedChange('model', 'provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="azure">Azure OpenAI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
            <select 
              value={settings.model.model}
              onChange={(e) => handleNestedChange('model', 'model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transcriber Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Transcription Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transcriber</label>
            <select 
              value={settings.transcriber.provider}
              onChange={(e) => handleNestedChange('transcriber', 'provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="deepgram">Deepgram</option>
              <option value="whisper">OpenAI Whisper</option>
              <option value="assembly">AssemblyAI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input 
              type="text" 
              value={settings.transcriber.model}
              onChange={(e) => handleNestedChange('transcriber', 'model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., nova-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input 
              type="text" 
              value={settings.transcriber.language}
              onChange={(e) => handleNestedChange('transcriber', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., en-US"
            />
          </div>
        </div>
      </div>

      {/* Conversation Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Conversation Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conversation Tone</label>
            <select 
              name="conversationTone"
              value={settings.conversationTone}
              onChange={handleBasicChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="friendly and professional">Friendly and Professional</option>
              <option value="warm and conversational">Warm and Conversational</option>
              <option value="formal and structured">Formal and Structured</option>
              <option value="casual and relaxed">Casual and Relaxed</option>
              <option value="enthusiastic and energetic">Enthusiastic and Energetic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Call Duration (seconds)</label>
            <input 
              type="number" 
              name="maxCallDuration"
              value={settings.maxCallDuration}
              onChange={handleNumberChange}
              min={60}
              max={600}
              step={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {Math.floor(settings.maxCallDuration / 60)} minutes {settings.maxCallDuration % 60} seconds
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Voice Settings
        </button>
      </div>
    </div>
  );
}
