'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isEqual } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { populateTemplate, getSampleDataForTemplate } from '@/lib/utils/templateUtils';
import ConfigBackupRestore from './ConfigBackupRestore';

// Define configuration types
interface SystemConfig {
  applicationSettings: {
    allowOpenApplications: boolean;
    requireScreening: boolean;
    autoScheduleScreening: boolean;
    notifyRecruitersOnNewApplication: boolean;
  };
  screeningSettings: {
    defaultScreeningDuration: number; // in minutes
    recordCalls: boolean;
    generateSummary: boolean;
    sendCandidateFollowup: boolean;
  };
  recruitmentSettings: {
    hiringWorkflowSteps: string[];
    notificationEmails: string[];
    defaultApplicationDeadlineDays: number;
  };
  notificationTemplates: {
    applicationReceived: string;
    screeningInvitation: string;
    screeningComplete: string;
    interviewInvitation: string;
    offerLetter: string;
    rejectionEmail: string;
  };
}

// ESSENTIAL: Default configuration - DO NOT COMMENT OUT - Required for application initialization
const defaultConfig: SystemConfig = {
  applicationSettings: {
    allowOpenApplications: true,
    requireScreening: true,
    autoScheduleScreening: false,
    notifyRecruitersOnNewApplication: true
  },
  screeningSettings: {
    defaultScreeningDuration: 20,
    recordCalls: true,
    generateSummary: true,
    sendCandidateFollowup: true
  },
  recruitmentSettings: {
    hiringWorkflowSteps: [
      'Application Submission',
      'Resume Screening',
      'Phone Screening',
      'Hiring Manager Review',
      'Interview',
      'Offer / Rejection'
    ],
    notificationEmails: ['recruiters@restaurant.com', 'hiring@restaurant.com'],
    defaultApplicationDeadlineDays: 14
  },
  notificationTemplates: {
    applicationReceived: 'Dear {{candidateName}},\n\nThank you for applying to the {{position}} position at our restaurant. We have received your application and will review it shortly.\n\nBest regards,\nThe Recruitment Team',
    screeningInvitation: 'Dear {{candidateName}},\n\nWe would like to invite you to complete a brief AI screening call for the {{position}} position. Please click the link below to schedule your screening.\n\n{{screeningLink}}\n\nBest regards,\nThe Recruitment Team',
    screeningComplete: 'Dear {{candidateName}},\n\nThank you for completing the screening call for the {{position}} position. Our team will review your responses and get back to you soon.\n\nBest regards,\nThe Recruitment Team',
    interviewInvitation: 'Dear {{candidateName}},\n\nWe would like to invite you for an interview for the {{position}} position. Please choose a suitable time from the available slots.\n\n{{interviewLink}}\n\nBest regards,\nThe Recruitment Team',
    offerLetter: 'Dear {{candidateName}},\n\nWe are pleased to offer you the {{position}} position at our restaurant. Please find the details of our offer below:\n\n{{offerDetails}}\n\nBest regards,\nThe Recruitment Team',
    rejectionEmail: 'Dear {{candidateName}},\n\nThank you for your interest in the {{position}} position. After careful consideration, we have decided to pursue other candidates whose qualifications better match our needs at this time.\n\nWe appreciate your interest in our company and wish you success in your job search.\n\nBest regards,\nThe Recruitment Team'
  }
};

export default function AdminConfigPanel() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [originalConfig, setOriginalConfig] = useState<SystemConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('application');
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newWorkflowStep, setNewWorkflowStep] = useState('');
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<keyof SystemConfig['notificationTemplates'] | null>(null);
  const [templatePreview, setTemplatePreview] = useState<string>('');
  
  // Set the active tab based on URL query param if present
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['application', 'screening', 'recruitment', 'notifications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // For demonstration, we'll load from backend API
  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (!response.ok) throw new Error('Failed to fetch config');
      
      const data = await response.json();
      setConfig(data);
      setOriginalConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
      // Fallback to default config if API fails
      setConfig(defaultConfig);
      setOriginalConfig(defaultConfig);
    }
  };
  
  useEffect(() => {
    fetchConfig();
  }, []);
  
  // Check if config has been modified
  const hasChanges = !isEqual(config, originalConfig);
  
  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) throw new Error('Failed to save config');
      
      const result = await response.json();
      
      // Update original config to match current
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setSaveMessage({
        type: 'success',
        message: 'Configuration saved successfully!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveMessage({
        type: 'error',
        message: 'Failed to save configuration. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setConfig(JSON.parse(JSON.stringify(originalConfig)));
    setSaveMessage(null);
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (section: keyof SystemConfig, field: string, value: boolean) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section],
        [field]: value
      }
    }));
  };
  
  // Handle number input change
  const handleNumberChange = (section: keyof SystemConfig, field: string, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setConfig(prevConfig => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section],
        [field]: numValue
      }
    }));
  };
  
  // Add new email
  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes('@')) return;
    
    setConfig(prevConfig => ({
      ...prevConfig,
      recruitmentSettings: {
        ...prevConfig.recruitmentSettings,
        notificationEmails: [...prevConfig.recruitmentSettings.notificationEmails, newEmail]
      }
    }));
    setNewEmail('');
  };
  
  // Remove email
  const handleRemoveEmail = (email: string) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      recruitmentSettings: {
        ...prevConfig.recruitmentSettings,
        notificationEmails: prevConfig.recruitmentSettings.notificationEmails.filter(e => e !== email)
      }
    }));
  };
  
  // Add new workflow step
  const handleAddWorkflowStep = () => {
    if (!newWorkflowStep) return;
    
    setConfig(prevConfig => ({
      ...prevConfig,
      recruitmentSettings: {
        ...prevConfig.recruitmentSettings,
        hiringWorkflowSteps: [...prevConfig.recruitmentSettings.hiringWorkflowSteps, newWorkflowStep]
      }
    }));
    setNewWorkflowStep('');
  };
  
  // Remove workflow step
  const handleRemoveWorkflowStep = (step: string) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      recruitmentSettings: {
        ...prevConfig.recruitmentSettings,
        hiringWorkflowSteps: prevConfig.recruitmentSettings.hiringWorkflowSteps.filter(s => s !== step)
      }
    }));
  };
  
  // Move workflow step
  const handleMoveWorkflowStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === config.recruitmentSettings.hiringWorkflowSteps.length - 1)
    ) {
      return; // Can't move first item up or last item down
    }
    
    const newSteps = [...config.recruitmentSettings.hiringWorkflowSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    setConfig(prevConfig => ({
      ...prevConfig,
      recruitmentSettings: {
        ...prevConfig.recruitmentSettings,
        hiringWorkflowSteps: newSteps
      }
    }));
  };
  
  // Handle notification template changes
  const handleTemplateChange = (templateKey: string, value: string) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      notificationTemplates: {
        ...prevConfig.notificationTemplates,
        [templateKey]: value
      }
    }));
  };

  // Get the display name for a template key
  const getTemplateDisplayName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, str => str.toUpperCase());
  };
  
  // Handle template preview
  const handlePreviewTemplate = (templateKey: keyof SystemConfig['notificationTemplates']) => {
    const template = config.notificationTemplates[templateKey];
    const sampleData = getSampleDataForTemplate(templateKey);
    
    // Update the selected template and preview content
    setSelectedTemplateForPreview(templateKey);
    setTemplatePreview(populateTemplate(template, sampleData));
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">System Configuration</h2>
      </div>
      
      {/* Configuration Tabs */}
      <div className="border-b">
        <div className="px-6 flex">
          <button 
            className={`px-4 py-2 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'application' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('application')}
          >
            Application Settings
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'screening' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('screening')}
          >
            Screening Settings
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'recruitment' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('recruitment')}
          >
            Recruitment Settings
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'notifications' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notification Templates
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Save message notification */}
        {saveMessage && (
          <div className={`mb-4 p-3 rounded ${
            saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage.message}
          </div>
        )}
        
        {/* Application Settings Tab */}
        {activeTab === 'application' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Process Configuration</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="allowOpenApplications"
                      type="checkbox"
                      checked={config.applicationSettings.allowOpenApplications}
                      onChange={(e) => handleCheckboxChange('applicationSettings', 'allowOpenApplications', e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="allowOpenApplications" className="font-medium text-gray-700">Allow Open Applications</label>
                    <p className="text-gray-500">Candidates can apply without a specific job posting</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requireScreening"
                      type="checkbox"
                      checked={config.applicationSettings.requireScreening}
                      onChange={(e) => handleCheckboxChange('applicationSettings', 'requireScreening', e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requireScreening" className="font-medium text-gray-700">Require AI Screening</label>
                    <p className="text-gray-500">All candidates must complete an AI screening call</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="autoScheduleScreening"
                      type="checkbox"
                      checked={config.applicationSettings.autoScheduleScreening}
                      onChange={(e) => handleCheckboxChange('applicationSettings', 'autoScheduleScreening', e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="autoScheduleScreening" className="font-medium text-gray-700">Auto-Schedule Screening</label>
                    <p className="text-gray-500">Automatically schedule screening call after application submission</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notifyRecruitersOnNewApplication"
                      type="checkbox"
                      checked={config.applicationSettings.notifyRecruitersOnNewApplication}
                      onChange={(e) => handleCheckboxChange('applicationSettings', 'notifyRecruitersOnNewApplication', e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifyRecruitersOnNewApplication" className="font-medium text-gray-700">Notify Recruiters</label>
                    <p className="text-gray-500">Send email notification to recruiters for new applications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Screening Settings Tab */}
        {activeTab === 'screening' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Screening Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="defaultScreeningDuration" className="block text-sm font-medium text-gray-700">
                    Default Screening Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="defaultScreeningDuration"
                    min="5"
                    max="60"
                    value={config.screeningSettings.defaultScreeningDuration}
                    onChange={(e) => handleNumberChange('screeningSettings', 'defaultScreeningDuration', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="recordCalls"
                      type="checkbox"
                      checked={config.screeningSettings.recordCalls}
                      onChange={(e) => handleCheckboxChange('screeningSettings', 'recordCalls', e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="recordCalls" className="font-medium text-gray-700">Record Screening Calls</label>
                    <p className="text-gray-500">Save recordings of AI screening calls for later review</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="generateSummary"
                      type="checkbox"
                      checked={config.screeningSettings.generateSummary}
                      onChange={(e) => handleCheckboxChange('screeningSettings', 'generateSummary', e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="generateSummary" className="font-medium text-gray-700">Generate AI Summary</label>
                    <p className="text-gray-500">Create automated summary and evaluation after screening</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sendCandidateFollowup"
                      type="checkbox"
                      checked={config.screeningSettings.sendCandidateFollowup}
                      onChange={(e) => handleCheckboxChange('screeningSettings', 'sendCandidateFollowup', e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sendCandidateFollowup" className="font-medium text-gray-700">Send Candidate Follow-up</label>
                    <p className="text-gray-500">Automatically send thank you email after screening completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recruitment Settings Tab */}
        {activeTab === 'recruitment' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hiring Workflow Steps</h3>
              
              <div className="space-y-2">
                <p className="text-gray-500 text-sm mb-2">Configure the steps in your hiring workflow</p>
                
                <div className="mt-2 mb-4">
                  <label htmlFor="workflowStep" className="sr-only">New workflow step</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="workflowStep"
                      value={newWorkflowStep}
                      onChange={(e) => setNewWorkflowStep(e.target.value)}
                      placeholder="New workflow step"
                      className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddWorkflowStep}
                      className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <ul className="divide-y divide-gray-200 border rounded-md">
                  {config.recruitmentSettings.hiringWorkflowSteps.map((step, index) => (
                    <li key={index} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{step}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleMoveWorkflowStep(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded-md ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveWorkflowStep(index, 'down')}
                          disabled={index === config.recruitmentSettings.hiringWorkflowSteps.length - 1}
                          className={`p-1 rounded-md ${
                            index === config.recruitmentSettings.hiringWorkflowSteps.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkflowStep(step)}
                          className="p-1 rounded-md text-red-500 hover:bg-gray-100"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              
              <div>
                <label htmlFor="notificationEmails" className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Recipients
                </label>
                
                <div className="mt-2 mb-4">
                  <div className="flex">
                    <input
                      type="email"
                      id="notificationEmail"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Email address"
                      className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.recruitmentSettings.notificationEmails.map(email => (
                    <div key={email} className="inline-flex items-center bg-blue-50 rounded-full px-3 py-1 text-sm">
                      <span className="text-blue-800 mr-1">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="defaultApplicationDeadlineDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Application Deadline (days)
                </label>
                <input
                  type="number"
                  id="defaultApplicationDeadlineDays"
                  min="1"
                  value={config.recruitmentSettings.defaultApplicationDeadlineDays}
                  onChange={(e) => handleNumberChange('recruitmentSettings', 'defaultApplicationDeadlineDays', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notification Templates Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notification Templates</h3>
              <p className="text-sm text-gray-500 mb-4">
                Customize email templates sent to candidates at different stages of the recruitment process. 
                Use placeholders like <code>{'{{candidateName}}'}</code>, <code>{'{{position}}'}</code>, etc. 
                which will be replaced with actual values.
              </p>
              
              <div className="space-y-6 mt-6">
                {Object.entries(config.notificationTemplates).map(([key, value]) => (
                  <div key={key} className="bg-white p-4 rounded-md shadow-sm">
                    <div className="mb-3">
                      <label htmlFor={`template-${key}`} className="block text-md font-medium text-gray-800 mb-1">
                        {getTemplateDisplayName(key)}
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        {key === 'applicationReceived' && 'Sent when a candidate submits an application'}
                        {key === 'screeningInvitation' && 'Sent to invite candidates to schedule a screening call'}
                        {key === 'screeningComplete' && 'Sent after candidate completes the AI screening'}
                        {key === 'interviewInvitation' && 'Sent to invite candidates for an interview'}
                        {key === 'offerLetter' && 'Formal job offer sent to selected candidates'}
                        {key === 'rejectionEmail' && 'Sent to candidates who were not selected'}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        id={`template-${key}`}
                        rows={6}
                        value={value}
                        onChange={(e) => handleTemplateChange(key, e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                      />
                      
                      <div className="absolute top-2 right-2">
                        <div className="bg-gray-100 rounded-md p-1 flex space-x-1">
                          <button 
                            type="button" 
                            className="p-1 rounded hover:bg-gray-200" 
                            title="Reset to default"
                            onClick={() => handleTemplateChange(key, defaultConfig.notificationTemplates[key as keyof typeof defaultConfig.notificationTemplates])}
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="bg-gray-50 rounded p-2">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Available placeholders:</h5>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            {'{{candidateName}}'}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            {'{{position}}'}
                          </span>
                          {key === 'screeningInvitation' && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              {'{{screeningLink}}'}
                            </span>
                          )}
                          {key === 'interviewInvitation' && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              {'{{interviewLink}}'}
                            </span>
                          )}
                          {key === 'offerLetter' && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              {'{{offerDetails}}'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Template Preview</h3>
              <p className="text-sm text-gray-500 mb-4">Preview how your templates will look with actual data.</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(config.notificationTemplates).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePreviewTemplate(key as keyof SystemConfig['notificationTemplates'])}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedTemplateForPreview === key
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {getTemplateDisplayName(key)}
                  </button>
                ))}
              </div>
              
              {selectedTemplateForPreview && (
                <div className="bg-white border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">
                      {getTemplateDisplayName(selectedTemplateForPreview)} Preview
                    </h4>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="mb-2 pb-2 border-b border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">To:</span> john.smith@example.com
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Subject:</span> {getTemplateDisplayName(selectedTemplateForPreview)} - Restaurant Name
                      </div>
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {templatePreview}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Send Test Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Configuration Backup & Restore */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
            Configuration Backup & Restore
          </h2>
          <ConfigBackupRestore 
            onRestoreComplete={() => {
              // Reload the configuration after restore
              fetchConfig();
              setActiveTab('application');
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              hasChanges && !isSaving 
                ? 'bg-white hover:bg-gray-50' 
                : 'bg-gray-100 cursor-not-allowed'
            }`}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              hasChanges && !isSaving 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
