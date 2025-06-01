import { NextRequest, NextResponse } from 'next/server';
import { RoleConfig } from '@/lib/screening/screeningConfigUtils';
import { ScreeningRole } from '@/lib/types/common';
import { readConfigFile, writeConfigFile } from '@/lib/utils/fileUtils';

// GET /api/admin/screening
export async function GET() {
  try {
    const config = readConfigFile();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting screening configuration:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to get screening configuration' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// POST /api/admin/screening/role
// Updates or adds a role configuration
export async function POST(request: NextRequest) {
  try {
    const { roleType, roleConfig, action } = await request.json();
    
    if (!roleType || !roleConfig) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    const config = readConfigFile();
    
    // Add or update role config based on action
    if (action === 'add') {
      config.roles[roleType] = roleConfig as RoleConfig;
    } else {
      config.roles[roleType as ScreeningRole] = roleConfig as RoleConfig;
    }
    
    writeConfigFile(config);
    
    return NextResponse.json({ 
      success: true, 
      message: `Role ${roleType} ${action === 'add' ? 'added' : 'updated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating role configuration:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update role configuration' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// PUT /api/admin/screening
// Updates settings (voice settings, mandatory questions, or full configuration)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = readConfigFile();
    let message = 'Settings updated successfully';
    
    // If the body contains the full configuration structure, update the entire config
    if (body.roles && body.mandatoryQuestions && body.vapiSettings) {
      // Full configuration update
      const updatedConfig = {
        ...config,
        ...body
      };
      writeConfigFile(updatedConfig);
      message = 'Full configuration updated successfully';
    } else {
      // Partial updates (backwards compatibility)
      
      // Update Vapi Settings if provided
      if (body.vapiSettings) {
        config.vapiSettings = {
          ...config.vapiSettings,
          ...body.vapiSettings
        };
        message = 'Voice settings updated successfully';
      }
      
      // Update mandatory questions if provided
      if (Array.isArray(body.mandatoryQuestions)) {
        config.mandatoryQuestions = body.mandatoryQuestions;
        message = 'Mandatory questions updated successfully';
      }
      
      // Save the updated configuration
      writeConfigFile(config);
    }
    
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error updating screening settings:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update settings' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// DELETE /api/admin/screening/role
// Deletes a role configuration
export async function DELETE(request: NextRequest) {
  try {
    const { roleType } = await request.json();
    
    if (!roleType) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // Delete role config
    const config = readConfigFile();
    
    if (config.roles[roleType]) {
      delete config.roles[roleType];
      writeConfigFile(config);
    }
    
    return NextResponse.json({ success: true, message: `Role ${roleType} deleted successfully` });
  } catch (error) {
    console.error('Error deleting role configuration:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete role configuration' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
