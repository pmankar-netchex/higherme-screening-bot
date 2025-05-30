'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/lib/types/jobs';

interface JobFormProps {
  job?: Job;
  onSubmit: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> | Partial<Job>) => Promise<void> | void;
  onCancel: () => void;
}

export default function JobForm({ job, onSubmit, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState<Omit<Job, 'id' | 'createdAt' | 'updatedAt'> | Partial<Job>>({
    title: '',
    department: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    shiftTypes: [],
    weekendRequired: false,
    hourlyRate: '',
    status: 'active'
  });

  // Initialize form with job data if editing
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        department: job.department,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        shiftTypes: job.shiftTypes,
        weekendRequired: job.weekendRequired,
        hourlyRate: job.hourlyRate,
        status: job.status
      });
    }
  }, [job]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle shift type selection
  const handleShiftTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      shiftTypes: checked 
        ? [...(prev.shiftTypes || []), value] 
        : (prev.shiftTypes || []).filter(shift => shift !== value)
    }));
  };

  // Handle array fields (requirements & responsibilities)
  const handleArrayItemChange = (field: 'requirements' | 'responsibilities', index: number, value: string) => {
    const items = [...(formData[field] || [])];
    items[index] = value;
    
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  // Add new item to array fields
  const addArrayItem = (field: 'requirements' | 'responsibilities') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  // Remove item from array fields
  const removeArrayItem = (field: 'requirements' | 'responsibilities', index: number) => {
    const items = [...(formData[field] || [])];
    items.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      [field]: items.length ? items : [''] // Keep at least one empty field
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty array items
    const cleanedData = {
      ...formData,
      requirements: formData.requirements?.filter(item => item.trim() !== '') || [],
      responsibilities: formData.responsibilities?.filter(item => item.trim() !== '') || []
    };

    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {job ? 'Edit Job' : 'Create New Job'}
        </h2>
        <p className="text-gray-600">
          {job ? 'Update the job information below' : 'Fill in the job details below to create a new job posting.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div className="col-span-1">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title*
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Restaurant Manager"
          />
        </div>

        {/* Department */}
        <div className="col-span-1">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department*
          </label>
          <input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Front of House"
          />
        </div>

        {/* Job Description */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description*
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide a detailed description of the job..."
          />
        </div>

        {/* Requirements */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirements*
          </label>
          {formData.requirements?.map((requirement, index) => (
            <div key={`req-${index}`} className="flex mb-2">
              <input
                type="text"
                value={requirement}
                onChange={(e) => handleArrayItemChange('requirements', index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2+ years of restaurant experience"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('requirements', index)}
                className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('requirements')}
            className="mt-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Requirement
          </button>
        </div>

        {/* Responsibilities */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsibilities*
          </label>
          {formData.responsibilities?.map((responsibility, index) => (
            <div key={`resp-${index}`} className="flex mb-2">
              <input
                type="text"
                value={responsibility}
                onChange={(e) => handleArrayItemChange('responsibilities', index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Manage daily restaurant operations"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('responsibilities', index)}
                className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('responsibilities')}
            className="mt-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Responsibility
          </button>
        </div>

        {/* Shift Types */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Shift Types*</label>
          <div className="flex flex-wrap gap-4">
            {['Morning', 'Afternoon', 'Evening', 'Night', 'Split', 'On-Call'].map(shift => (
              <label key={shift} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="shiftTypes"
                  value={shift}
                  checked={(formData.shiftTypes || []).includes(shift)}
                  onChange={handleShiftTypeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">{shift}</span>
              </label>
            ))}
          </div>
          {formData.shiftTypes?.length === 0 && (
            <p className="text-red-500 text-xs mt-1">Please select at least one shift type</p>
          )}
        </div>

        {/* Weekend Required */}
        <div className="col-span-1">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="weekendRequired"
              checked={formData.weekendRequired}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Weekend Availability Required</span>
          </label>
        </div>

        {/* Hourly Rate */}
        <div className="col-span-1">
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate*
          </label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="text"
            value={formData.hourlyRate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., $15-20/hr or DOE"
          />
        </div>

        {/* Job Status */}
        <div className="col-span-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status*
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="filled">Filled</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}