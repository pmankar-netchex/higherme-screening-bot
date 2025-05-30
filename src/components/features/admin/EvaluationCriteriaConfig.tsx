'use client';

import { useState, useEffect } from 'react';
import { ScreeningRole } from '@/lib/types';
import { RoleConfig, EvaluationCriterion, EvaluationCriteriaSet } from '@/lib/screening/screeningConfigUtils';

interface EvaluationCriteriaConfigProps {
  roles: { [key: string]: RoleConfig };
  onUpdate: (roleType: ScreeningRole, updatedConfig: RoleConfig) => void;
}

export default function EvaluationCriteriaConfig({
  roles,
  onUpdate
}: EvaluationCriteriaConfigProps) {
  // State for selected role
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  // Local state for form data
  const [criteria, setCriteria] = useState<EvaluationCriteriaSet>({});
  const [newCriterionKey, setNewCriterionKey] = useState('');
  const [newCriterionDescription, setNewCriterionDescription] = useState('');
  const [newCriterionWeight, setNewCriterionWeight] = useState(0);
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize with first role if available
  useEffect(() => {
    const roleKeys = Object.keys(roles);
    if (roleKeys.length > 0 && !selectedRole) {
      setSelectedRole(roleKeys[0]);
    }
  }, [roles, selectedRole]);

  // Initialize form data from selected role
  useEffect(() => {
    if (selectedRole && roles[selectedRole]?.evaluationCriteria) {
      setCriteria(roles[selectedRole].evaluationCriteria);
    } else {
      setCriteria({});
    }
  }, [selectedRole, roles]);

  // Calculate total weight and remaining weight
  const totalWeight = Object.values(criteria).reduce(
    (sum, criterion) => sum + criterion.weight, 
    0
  );
  
  const remainingWeight = Math.max(0, parseFloat((1.0 - totalWeight).toFixed(2)));

  // Handle weight change for a criterion
  const handleWeightChange = (criterionKey: string, value: number) => {
    const numericValue = parseFloat(value.toFixed(2));
    
    setCriteria({
      ...criteria,
      [criterionKey]: {
        ...criteria[criterionKey],
        weight: numericValue
      }
    });
  };

  // Handle description change for a criterion
  const handleDescriptionChange = (criterionKey: string, value: string) => {
    setCriteria({
      ...criteria,
      [criterionKey]: {
        ...criteria[criterionKey],
        description: value
      }
    });
  };

  // Add new evaluation criterion
  const handleAddCriterion = () => {
    // Reset errors
    setErrors({});
    
    // Validate inputs
    let hasErrors = false;
    const newErrors: { [key: string]: string } = {};
    
    if (!newCriterionKey.trim()) {
      newErrors.key = 'Criterion key is required';
      hasErrors = true;
    } else if (criteria[newCriterionKey]) {
      newErrors.key = 'A criterion with this key already exists';
      hasErrors = true;
    }
    
    if (!newCriterionDescription.trim()) {
      newErrors.description = 'Description is required';
      hasErrors = true;
    }
    
    if (newCriterionWeight <= 0 || newCriterionWeight > remainingWeight) {
      newErrors.weight = `Weight must be between 0 and ${remainingWeight}`;
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    // Add new criterion
    setCriteria({
      ...criteria,
      [newCriterionKey]: {
        weight: parseFloat(newCriterionWeight.toFixed(2)),
        description: newCriterionDescription.trim()
      }
    });
    
    // Reset form
    setNewCriterionKey('');
    setNewCriterionDescription('');
    setNewCriterionWeight(0);
    setIsAddingCriterion(false);
  };

  // Remove criterion
  const handleRemoveCriterion = (criterionKey: string) => {
    const updatedCriteria = { ...criteria };
    delete updatedCriteria[criterionKey];
    setCriteria(updatedCriteria);
  };

  // Save changes
  const handleSave = () => {
    if (!selectedRole) return;
    
    // Ensure weights sum to 1.0 (or very close due to floating point precision)
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      alert("Evaluation criteria weights must sum to 1.0");
      return;
    }
    
    // Create updated role config with new evaluation criteria
    const updatedRoleConfig: RoleConfig = {
      ...roles[selectedRole],
      evaluationCriteria: criteria
    };
    
    // Update parent component
    onUpdate(selectedRole as ScreeningRole, updatedRoleConfig);
  };

  // Auto-adjust remaining criteria weight when removing a criterion (optional feature)
  const redistributeRemainingWeight = () => {
    if (Object.keys(criteria).length === 0) return;
    
    const remainingWeight = 1.0 - totalWeight;
    if (remainingWeight === 0) return;
    
    const weightPerCriterion = remainingWeight / Object.keys(criteria).length;
    
    const updatedCriteria = Object.entries(criteria).reduce((acc, [key, criterion]) => {
      return {
        ...acc,
        [key]: {
          ...criterion,
          weight: parseFloat((criterion.weight + weightPerCriterion).toFixed(2))
        }
      };
    }, {});
    
    setCriteria(updatedCriteria);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Evaluation Criteria Configuration</h3>
        <p className="text-sm text-gray-600">
          Configure evaluation criteria and weights for role-specific screening. 
          Weights must sum to 1.0 (100%).
        </p>
        
        {/* Role Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a role...</option>
            {Object.entries(roles).map(([roleKey, roleData]) => (
              <option key={roleKey} value={roleKey}>
                {roleData.name} ({roleData.department})
              </option>
            ))}
          </select>
        </div>
        
        {selectedRole && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Total weight:</span> {totalWeight.toFixed(2)} / 1.00
              {remainingWeight > 0 && (
                <span className="ml-2 text-green-700">({remainingWeight.toFixed(2)} remaining)</span>
              )}
              {remainingWeight < 0 && (
                <span className="ml-2 text-red-700">(exceeds by {Math.abs(remainingWeight).toFixed(2)})</span>
              )}
            </p>
          </div>
        )}
      </div>

      {selectedRole ? (
        <>
          {/* Current Criteria */}
          <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-700">Current Criteria</h4>
          <button
            type="button"
            onClick={() => setIsAddingCriterion(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Criterion
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criterion
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(criteria).map(([key, criterion]) => (
                <tr key={key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="text"
                      value={criterion.description}
                      onChange={(e) => handleDescriptionChange(key, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={criterion.weight}
                      onChange={(e) => handleWeightChange(key, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveCriterion(key)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Criterion Form */}
      {isAddingCriterion && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-3">Add New Criterion</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={newCriterionKey}
                onChange={(e) => setNewCriterionKey(e.target.value)}
                className={`w-full px-3 py-2 border ${
                  errors.key ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g. experience"
              />
              {errors.key && <p className="mt-1 text-sm text-red-600">{errors.key}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newCriterionDescription}
                onChange={(e) => setNewCriterionDescription(e.target.value)}
                className={`w-full px-3 py-2 border ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g. Previous restaurant experience"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Max: {remainingWeight.toFixed(2)})</label>
              <input
                type="number"
                min="0"
                max={remainingWeight}
                step="0.05"
                value={newCriterionWeight}
                onChange={(e) => setNewCriterionWeight(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border ${
                  errors.weight ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsAddingCriterion(false)}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Criterion
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div>
          {remainingWeight !== 0 && Object.keys(criteria).length > 0 && (
            <button
              type="button"
              onClick={redistributeRemainingWeight}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Auto-Distribute Remaining Weight
            </button>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Save Changes
          </button>
        </div>
      </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Please select a role to configure evaluation criteria.</p>
        </div>
      )}
    </div>
  );
}
