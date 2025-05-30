'use client';

import { useState, useEffect } from 'react';
import { RoleConfig } from '@/lib/screening/screeningConfigUtils';

interface Department {
  id: string;
  name: string;
  description: string;
  roles: string[];
}

interface RoleTemplate {
  id: string;
  name: string;
  department: string;
  description: string;
  defaultQuestions: string[];
  defaultCriteria: {
    [key: string]: {
      weight: number;
      description: string;
    };
  };
  isCustom: boolean;
}

interface RoleTypeManagementProps {
  roles: { [key: string]: RoleConfig };
  onUpdate: (roles: { [key: string]: RoleConfig }) => void;
}

export default function RoleTypeManagement({
  roles,
  onUpdate
}: RoleTypeManagementProps) {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 'front-of-house',
      name: 'Front of House',
      description: 'Customer-facing positions',
      roles: ['server', 'host', 'bartender']
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      description: 'Food preparation and cooking positions',
      roles: ['cook', 'chef', 'prep-cook', 'dishwasher']
    },
    {
      id: 'management',
      name: 'Management',
      description: 'Leadership and supervisory positions',
      roles: ['manager', 'assistant-manager', 'shift-supervisor']
    },
    {
      id: 'general',
      name: 'General',
      description: 'Multi-purpose and entry-level positions',
      roles: ['general']
    }
  ]);

  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([
    {
      id: 'server',
      name: 'Server',
      department: 'front-of-house',
      description: 'Takes orders and serves customers',
      defaultQuestions: [
        'Do you have previous serving experience?',
        'How comfortable are you handling cash transactions?',
        'Can you describe your customer service experience?'
      ],
      defaultCriteria: {
        experience: { weight: 0.3, description: 'Previous restaurant or service experience' },
        availability: { weight: 0.4, description: 'Flexibility with shifts and weekend work' },
        customerService: { weight: 0.3, description: 'Communication skills and customer service attitude' }
      },
      isCustom: false
    },
    {
      id: 'cook',
      name: 'Cook',
      department: 'kitchen',
      description: 'Prepares food according to recipes and standards',
      defaultQuestions: [
        'What kitchen experience do you have?',
        'Are you comfortable working in a fast-paced kitchen environment?',
        'Do you have any food safety certifications?'
      ],
      defaultCriteria: {
        experience: { weight: 0.5, description: 'Kitchen and cooking experience' },
        availability: { weight: 0.3, description: 'Shift flexibility and weekend availability' },
        teamwork: { weight: 0.2, description: 'Teamwork and ability to work under pressure' }
      },
      isCustom: false
    },
    {
      id: 'host',
      name: 'Host/Hostess',
      department: 'front-of-house',
      description: 'Greets guests and manages seating',
      defaultQuestions: [
        'What customer service experience do you have?',
        'How do you handle stressful situations with customers?',
        'Are you comfortable using computer systems for reservations?'
      ],
      defaultCriteria: {
        experience: { weight: 0.2, description: 'Customer service or hospitality experience' },
        availability: { weight: 0.4, description: 'Evening and weekend availability' },
        communication: { weight: 0.4, description: 'Professional demeanor and communication skills' }
      },
      isCustom: false
    },
    {
      id: 'manager',
      name: 'Manager',
      department: 'management',
      description: 'Oversees restaurant operations and staff',
      defaultQuestions: [
        'What experience do you have managing restaurant staff?',
        'How do you handle scheduling and staff conflicts?',
        'What strategies do you use to improve customer satisfaction?'
      ],
      defaultCriteria: {
        experience: { weight: 0.5, description: 'Previous management experience' },
        availability: { weight: 0.2, description: 'Scheduling flexibility' },
        leadership: { weight: 0.3, description: 'Leadership and communication skills' }
      },
      isCustom: false
    }
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'templates' | 'roles'>('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDepartment, setNewRoleDepartment] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<RoleTemplate | null>(null);

  // Get role statistics
  const getRoleStats = () => {
    const totalRoles = Object.keys(roles).length;
    const customRoles = roleTemplates.filter(t => t.isCustom).length;
    
    const departmentStats = departments.map(dept => ({
      name: dept.name,
      count: Object.values(roles).filter(role => role.department === dept.name).length
    }));

    return { totalRoles, departmentStats };
  };

  const stats = getRoleStats();

  // Handle creating a new role from template
  const handleCreateRoleFromTemplate = async (templateId: string) => {
    const template = roleTemplates.find(t => t.id === templateId);
    if (!template) return;

    const roleKey = template.id;
    const newRoleConfig: RoleConfig = {
      name: template.name,
      department: departments.find(d => d.id === template.department)?.name || 'General',
      screeningQuestions: [...template.defaultQuestions],
      evaluationCriteria: { ...template.defaultCriteria }
    };

    try {
      // Save to server via API
      const response = await fetch('/api/admin/screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleType: roleKey,
          roleConfig: newRoleConfig,
          action: 'add'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create role from template');
      }

      const updatedRoles = {
        ...roles,
        [roleKey]: newRoleConfig
      };

      onUpdate(updatedRoles);
    } catch (error) {
      console.error('Failed to create role from template:', error);
      alert('Failed to create role. Please try again.');
    }
  };

  // Handle creating a custom role
  const handleCreateCustomRole = async () => {
    if (!newRoleName.trim() || !newRoleDepartment) return;

    const roleKey = newRoleName.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check if role already exists
    if (roles[roleKey]) {
      alert('A role with this name already exists.');
      return;
    }

    const newRoleConfig: RoleConfig = {
      name: newRoleName.trim(),
      department: departments.find(d => d.id === newRoleDepartment)?.name || 'General',
      screeningQuestions: [
        'What experience do you have relevant to this position?',
        'How do you handle high-pressure situations?',
        'What are your strengths in a team environment?'
      ],
      evaluationCriteria: {
        experience: {
          weight: 0.4,
          description: 'Relevant experience for the role'
        },
        availability: {
          weight: 0.3,
          description: 'Schedule flexibility'
        },
        skills: {
          weight: 0.3,
          description: 'Communication and teamwork skills'
        }
      }
    };

    try {
      // Save to server via API
      const response = await fetch('/api/admin/screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleType: roleKey,
          roleConfig: newRoleConfig,
          action: 'add'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create custom role');
      }

      const updatedRoles = {
        ...roles,
        [roleKey]: newRoleConfig
      };

      onUpdate(updatedRoles);
      setNewRoleName('');
      setNewRoleDepartment('');
      setShowAddRoleModal(false);
    } catch (error) {
      console.error('Failed to create custom role:', error);
      alert('Failed to create role. Please try again.');
    }
  };

  // Handle deleting a role
  const handleDeleteRole = async (roleKey: string) => {
    if (confirm(`Are you sure you want to delete the ${roles[roleKey]?.name} role? This action cannot be undone.`)) {
      try {
        // Delete from server via API
        const response = await fetch('/api/admin/screening', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roleType: roleKey
          })
        });

        if (!response.ok) {
          throw new Error('Failed to delete role');
        }

        const updatedRoles = { ...roles };
        delete updatedRoles[roleKey];
        onUpdate(updatedRoles);
      } catch (error) {
        console.error('Failed to delete role:', error);
        alert('Failed to delete role. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Role Type Management</h2>
        <p className="text-gray-600">
          Manage restaurant role types, departments, and templates for consistent hiring processes.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'departments', label: 'Departments', icon: '🏢' },
              { id: 'templates', label: 'Role Templates', icon: '📋' },
              { id: 'roles', label: 'Active Roles', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{stats.totalRoles}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-900">Total Roles</p>
                      <p className="text-xs text-blue-600">Active in system</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                        <span className="text-green-600 font-semibold">{departments.length}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-900">Departments</p>
                      <p className="text-xs text-green-600">Organizational units</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">{roleTemplates.length}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-900">Templates</p>
                      <p className="text-xs text-purple-600">Available templates</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {roleTemplates.filter(t => t.isCustom).length}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-900">Custom Roles</p>
                      <p className="text-xs text-orange-600">User-created</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles by Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.departmentStats.map((dept) => (
                    <div key={dept.name} className="bg-white rounded-md p-4 border">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                        <span className="text-2xl font-bold text-blue-600">{dept.count}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">active roles</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Role</h3>
                  <p className="text-gray-500 mb-4">Start from scratch or use a template</p>
                  <button
                    onClick={() => setShowAddRoleModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Role
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Templates</h3>
                  <p className="text-gray-500 mb-4">Edit existing role templates</p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Templates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Department Management</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map((dept) => (
                  <div key={dept.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{dept.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {Object.values(roles).filter(role => role.department === dept.name).length} roles
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{dept.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Active Roles:</h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(roles)
                          .filter(([, role]) => role.department === dept.name)
                          .map(([roleKey, role]) => (
                            <span
                              key={roleKey}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {role.name}
                            </span>
                          ))}
                        {Object.values(roles).filter(role => role.department === dept.name).length === 0 && (
                          <span className="text-xs text-gray-500 italic">No active roles</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Role Templates</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roleTemplates.map((template) => (
                  <div key={template.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                      <div className="flex items-center space-x-2">
                        {template.isCustom && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Department: </span>
                        <span className="text-sm text-gray-600">
                          {departments.find(d => d.id === template.department)?.name}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Questions: </span>
                        <span className="text-sm text-gray-600">{template.defaultQuestions.length}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Criteria: </span>
                        <span className="text-sm text-gray-600">
                          {Object.keys(template.defaultCriteria).length}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-2">
                      <button
                        onClick={() => handleCreateRoleFromTemplate(template.id)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Use Template
                      </button>
                      {template.isCustom && (
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowEditTemplateModal(true);
                          }}
                          className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Active Roles</h3>
                <button
                  onClick={() => setShowAddRoleModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Role
                </button>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {Object.entries(roles).map(([roleKey, role]) => (
                    <li key={roleKey}>
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {role.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {role.department}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                  {role.screeningQuestions.length} questions
                                </span>
                                <span className="text-sm text-gray-500">
                                  {Object.keys(role.evaluationCriteria).length} criteria
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteRole(roleKey)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Role</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="newRoleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  id="newRoleName"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Bartender, Dishwasher"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="newRoleDepartment" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="newRoleDepartment"
                  value={newRoleDepartment}
                  onChange={(e) => setNewRoleDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-gray-500">
                This will create a new role with default screening questions and evaluation criteria.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddRoleModal(false);
                  setNewRoleName('');
                  setNewRoleDepartment('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomRole}
                disabled={!newRoleName.trim() || !newRoleDepartment}
                className={`px-4 py-2 border border-transparent rounded-md text-white ${
                  newRoleName.trim() && newRoleDepartment
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
