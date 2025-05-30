'use client';

import { useState, useEffect } from 'react';
import { ScreeningRole } from '@/lib/types';
import { RoleConfig, EvaluationCriterion } from '@/lib/screening/screeningConfigUtils';

interface ScreeningQuestion {
  id: string;
  question: string;
  required: boolean;
}

interface ScreeningConfigProps {
  roleType: ScreeningRole;
  roleConfig: RoleConfig;
  mandatoryQuestions: string[];
  onUpdate: (roleType: ScreeningRole, updatedConfig: RoleConfig) => void;
  onUpdateMandatory: (questions: string[]) => void;
}

export default function ScreeningConfig({
  roleType,
  roleConfig,
  mandatoryQuestions,
  onUpdate,
  onUpdateMandatory
}: ScreeningConfigProps) {
  // Local state for form data
  const [formData, setFormData] = useState<RoleConfig>({
    name: '',
    department: '',
    screeningQuestions: [],
    evaluationCriteria: {}
  });
  
  const [mandatoryQuestionsLocal, setMandatoryQuestionsLocal] = useState<string[]>([]);
  const [tempQuestion, setTempQuestion] = useState('');
  const [tempMandatoryQuestion, setTempMandatoryQuestion] = useState('');

  // Initialize form data from props
  useEffect(() => {
    if (roleConfig) {
      setFormData(roleConfig);
    }
    if (mandatoryQuestions) {
      setMandatoryQuestionsLocal(mandatoryQuestions);
    }
  }, [roleConfig, mandatoryQuestions]);

  // Handle role-specific question changes
  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...formData.screeningQuestions];
    updatedQuestions[index] = value;
    setFormData({
      ...formData,
      screeningQuestions: updatedQuestions
    });
  };

  // Add new role-specific question
  const addQuestion = () => {
    if (tempQuestion.trim()) {
      setFormData({
        ...formData,
        screeningQuestions: [...formData.screeningQuestions, tempQuestion.trim()]
      });
      setTempQuestion('');
    }
  };

  // Remove role-specific question
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...formData.screeningQuestions];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      screeningQuestions: updatedQuestions
    });
  };

  // Handle mandatory question changes
  const handleMandatoryQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...mandatoryQuestionsLocal];
    updatedQuestions[index] = value;
    setMandatoryQuestionsLocal(updatedQuestions);
  };

  // Add new mandatory question
  const addMandatoryQuestion = () => {
    if (tempMandatoryQuestion.trim()) {
      setMandatoryQuestionsLocal([...mandatoryQuestionsLocal, tempMandatoryQuestion.trim()]);
      setTempMandatoryQuestion('');
    }
  };

  // Remove mandatory question
  const removeMandatoryQuestion = (index: number) => {
    const updatedQuestions = [...mandatoryQuestionsLocal];
    updatedQuestions.splice(index, 1);
    setMandatoryQuestionsLocal(updatedQuestions);
  };

  // Handle evaluation criteria weight changes
  const handleWeightChange = (criterion: string, weight: number) => {
    setFormData({
      ...formData,
      evaluationCriteria: {
        ...formData.evaluationCriteria,
        [criterion]: {
          ...formData.evaluationCriteria[criterion as keyof typeof formData.evaluationCriteria],
          weight: isNaN(weight) ? 0 : weight
        }
      }
    });
  };

  // Handle evaluation criteria description changes
  const handleDescriptionChange = (criterion: string, description: string) => {
    setFormData({
      ...formData,
      evaluationCriteria: {
        ...formData.evaluationCriteria,
        [criterion]: {
          ...formData.evaluationCriteria[criterion as keyof typeof formData.evaluationCriteria],
          description
        }
      }
    });
  };

  // Save changes
  const handleSave = () => {
    onUpdate(roleType, formData);
    onUpdateMandatory(mandatoryQuestionsLocal);
  };

  // Calculate remaining weight allocation
  const calculateRemainingWeight = (excludeCriterion?: string): number => {
    const totalWeight = Object.entries(formData.evaluationCriteria)
      .filter(([key]) => excludeCriterion ? key !== excludeCriterion : true)
      .reduce((sum, [, value]) => sum + value.weight, 0);
    return Math.max(0, 1.0 - totalWeight);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Role Configuration: {formData.name}</h3>
        <p className="text-sm text-gray-600">Configure screening questions and evaluation criteria for {formData.name} role.</p>
      </div>

      {/* Role Details */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Role Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input 
              type="text" 
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Questions (Shared across all roles) */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Mandatory Questions (All Roles)</h4>
        <p className="text-xs text-gray-500 mb-2">These questions will be asked in all screening interviews regardless of role.</p>
        
        {mandatoryQuestionsLocal.map((question, index) => (
          <div key={`mandatory-${index}`} className="flex items-center mb-2">
            <input 
              type="text" 
              value={question}
              onChange={(e) => handleMandatoryQuestionChange(index, e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={() => removeMandatoryQuestion(index)}
              className="ml-2 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              aria-label="Remove question"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        <div className="flex mt-2">
          <input 
            type="text" 
            value={tempMandatoryQuestion}
            onChange={(e) => setTempMandatoryQuestion(e.target.value)}
            placeholder="Add a mandatory question..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button 
            onClick={addMandatoryQuestion}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>

      {/* Role-Specific Questions */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Role-Specific Questions</h4>
        <p className="text-xs text-gray-500 mb-2">These questions are specific to the {formData.name} role.</p>
        
        {formData.screeningQuestions.map((question, index) => (
          <div key={`role-${index}`} className="flex items-center mb-2">
            <input 
              type="text" 
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={() => removeQuestion(index)}
              className="ml-2 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              aria-label="Remove question"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        <div className="flex mt-2">
          <input 
            type="text" 
            value={tempQuestion}
            onChange={(e) => setTempQuestion(e.target.value)}
            placeholder="Add a role-specific question..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button 
            onClick={addQuestion}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Evaluation Criteria</h4>
        <p className="text-xs text-gray-500 mb-2">Weights must sum to 1.0 (100%).</p>
        
        {/* Experience */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Weight (0-1)</label>
              <input 
                type="number" 
                min="0" 
                max="1" 
                step="0.1"
                value={formData.evaluationCriteria.experience.weight}
                onChange={(e) => handleWeightChange('experience', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.evaluationCriteria.experience.description}
                onChange={(e) => handleDescriptionChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Weight (0-1)</label>
              <input 
                type="number" 
                min="0" 
                max="1" 
                step="0.1"
                value={formData.evaluationCriteria.availability.weight}
                onChange={(e) => handleWeightChange('availability', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.evaluationCriteria.availability.description}
                onChange={(e) => handleDescriptionChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Soft Skills */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Soft Skills</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Weight (0-1)</label>
              <input 
                type="number" 
                min="0" 
                max="1" 
                step="0.1"
                value={formData.evaluationCriteria.softSkills.weight}
                onChange={(e) => handleWeightChange('softSkills', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.evaluationCriteria.softSkills.description}
                onChange={(e) => handleDescriptionChange('softSkills', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Total Weight Display */}
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Weight:</span>
            <span className={`text-sm font-semibold ${
              Math.abs(
                formData.evaluationCriteria.experience.weight + 
                formData.evaluationCriteria.availability.weight + 
                formData.evaluationCriteria.softSkills.weight - 1.0
              ) < 0.01 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(
                formData.evaluationCriteria.experience.weight + 
                formData.evaluationCriteria.availability.weight + 
                formData.evaluationCriteria.softSkills.weight
              ).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
