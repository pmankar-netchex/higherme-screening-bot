'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ScreeningConfigSimple from '@/components/features/admin/ScreeningConfigSimple';
import PromptCustomization from '@/components/features/admin/PromptCustomization';
import EvaluationCriteriaConfig from '@/components/features/admin/EvaluationCriteriaConfig';
import RoleTypeManagement from '@/components/features/admin/RoleTypeManagement';
import { RoleConfig } from '@/lib/screening/screeningConfigUtils';
import { ScreeningRole } from '@/lib/types';
import { VapiConfig, DEFAULT_VAPI_CONFIG } from '@/lib/integrations/vapi/vapiConfig';
import VoiceSettings from '@/components/features/admin/VoiceSettings';

// Tab type definition
type TabType = 'roles' | 'voice' | 'prompts' | 'evaluation' | 'rolemanagement';

export default function ScreeningContent() {
  // Get search params for tab
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === 'voice' ? 'voice' : 
    tabParam === 'prompts' ? 'prompts' : 
    tabParam === 'evaluation' ? 'evaluation' : 
    tabParam === 'rolemanagement' ? 'rolemanagement' : 'roles'
  );
  
  // State for screening configuration
  const [config, setConfig] = useState<{
    roles: {
      [key: string]: RoleConfig;
    };
    mandatoryQuestions: string[];
    vapiSettings: VapiConfig;
  } | null>(null);
  
  const [newRoleName, setNewRoleName] = useState('');
  const [activeRole, setActiveRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  
  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Function to load configuration
  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/screening');
      
      if (response.ok) {
        const configData = await response.json();
        setConfig(configData);
        
        // Set active role to first role in the list if none is selected
        if (configData.roles && Object.keys(configData.roles).length > 0 && !activeRole) {
          setActiveRole(Object.keys(configData.roles)[0]);
        }
      } else {
        console.error('Failed to load screening configuration');
      }
    } catch (error) {
      console.error('Error loading screening configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save configuration
  const saveConfig = async () => {
    if (!config) return;
    
    try {
      const response = await fetch('/api/admin/screening', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration');
    }
  };

  // Function to add a new role
  const addRole = () => {
    if (!newRoleName.trim() || !config) return;
    
    // Check if role already exists
    if (config.roles[newRoleName]) {
      alert(`Role "${newRoleName}" already exists`);
      return;
    }
    
    // Create a new role with default settings
    const updatedConfig = {
      ...config,
      roles: {
        ...config.roles,
        [newRoleName]: {
          name: newRoleName,
          department: 'General',
          screeningQuestions: [
            'Tell me about your previous experience in restaurants.',
            'What are your strengths in a fast-paced environment?',
            'How do you handle difficult customers?'
          ],
          evaluationCriteria: {
            experience: {
              weight: 0.4,
              description: 'Previous restaurant experience'
            },
            communication: {
              weight: 0.3,
              description: 'Communication skills'
            },
            availability: {
              weight: 0.3,
              description: 'Schedule flexibility'
            }
          }
        }
      }
    };
    
    setConfig(updatedConfig);
    setActiveRole(newRoleName);
    setNewRoleName('');
    setShowAddRoleModal(false);
  };

  // Function to delete a role
  const deleteRole = () => {
    if (!roleToDelete || !config) return;
    
    const updatedRoles = { ...config.roles };
    delete updatedRoles[roleToDelete];
    
    const updatedConfig = {
      ...config,
      roles: updatedRoles
    };
    
    setConfig(updatedConfig);
    
    // If the deleted role was active, set a new active role
    if (roleToDelete === activeRole) {
      const remainingRoles = Object.keys(updatedRoles);
      if (remainingRoles.length > 0) {
        setActiveRole(remainingRoles[0]);
      } else {
        setActiveRole('');
      }
    }
    
    setShowDeleteModal(false);
    setRoleToDelete('');
  };

  // Function to update Vapi settings
  const updateVapiSettings = (settings: Partial<VapiConfig>) => {
    if (!config) return;
    
    const updatedConfig = {
      ...config,
      vapiSettings: {
        ...config.vapiSettings,
        ...settings
      }
    };
    
    setConfig(updatedConfig);
  };

  // Function to update mandatory questions
  const updateMandatoryQuestions = (questions: string[]) => {
    if (!config) return;
    
    const updatedConfig = {
      ...config,
      mandatoryQuestions: questions
    };
    
    setConfig(updatedConfig);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading screening configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Voice Screening Configuration
            </h1>
            <button
              onClick={saveConfig}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Save Configuration
            </button>
          </div>
          <p className="text-gray-600">
            Configure automated voice screening settings, questions, and evaluation criteria.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('roles')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Role Questions
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'voice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Voice Settings
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prompts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Prompt Customization
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evaluation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Evaluation Criteria
            </button>
            <button
              onClick={() => setActiveTab('rolemanagement')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rolemanagement'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Role Types
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'roles' && config && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Role-Specific Questions</h2>
                <button
                  onClick={() => setShowAddRoleModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
                >
                  Add New Role
                </button>
              </div>

              {/* Role selector */}
              {Object.keys(config.roles).length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role to Configure:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(config.roles).map((roleName) => (
                      <div key={roleName} className="relative">
                        <button
                          onClick={() => setActiveRole(roleName)}
                          className={`py-2 px-4 rounded-md ${
                            activeRole === roleName
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          {roleName}
                        </button>
                        <button
                          onClick={() => {
                            setRoleToDelete(roleName);
                            setShowDeleteModal(true);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          title="Delete role"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md mb-6">
                  No roles configured yet. Click "Add New Role" to create your first role.
                </div>
              )}

              {/* Questions configuration */}
              {activeRole && config.roles[activeRole] && (
                <ScreeningConfigSimple
                  roleType={activeRole as ScreeningRole}
                  roleConfig={config.roles[activeRole]}
                  mandatoryQuestions={config.mandatoryQuestions}
                  onUpdate={(roleType: ScreeningRole, updatedConfig: RoleConfig) => {
                    if (!config) return;
                    const updatedRoles = {
                      ...config.roles,
                      [roleType]: updatedConfig
                    };
                    setConfig({
                      ...config,
                      roles: updatedRoles
                    });
                  }}
                  onUpdateMandatory={updateMandatoryQuestions}
                />
              )}
            </div>
          )}

          {activeTab === 'voice' && config && (
            <VoiceSettings
              vapiSettings={config.vapiSettings || DEFAULT_VAPI_CONFIG}
              onUpdate={updateVapiSettings}
            />
          )}

          {activeTab === 'prompts' && config && (
            <PromptCustomization
              vapiSettings={config.vapiSettings || DEFAULT_VAPI_CONFIG}
              onUpdate={updateVapiSettings}
            />
          )}

          {activeTab === 'evaluation' && activeRole && config?.roles[activeRole] && (
            <EvaluationCriteriaConfig
              roles={config.roles}
              onUpdate={(roleType: ScreeningRole, updatedConfig: RoleConfig) => {
                if (!config) return;
                const updatedRoles = {
                  ...config.roles,
                  [roleType]: updatedConfig
                };
                setConfig({
                  ...config,
                  roles: updatedRoles
                });
              }}
            />
          )}

          {activeTab === 'rolemanagement' && config && (
            <RoleTypeManagement
              roles={config.roles}
              onUpdate={(updatedRoles: { [key: string]: RoleConfig }) => {
                if (!config) return;
                setConfig({
                  ...config,
                  roles: updatedRoles
                });
              }}
            />
          )}
        </div>

        {/* Add Role Modal */}
        {showAddRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Role</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name:
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Chef, Waiter, Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={addRole}
                  disabled={!newRoleName.trim()}
                  className={`px-4 py-2 text-sm text-white rounded-md ${
                    newRoleName.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-400 cursor-not-allowed'
                  }`}
                >
                  Add Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete the role "{roleToDelete}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteRole}
                  className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
