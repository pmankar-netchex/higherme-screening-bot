import fs from 'fs';
import path from 'path';
import { ScreeningConfig } from '../../screening/screeningConfigUtils';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export class ConfigRepository {
  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private getDefaultConfig(): ScreeningConfig {
    return {
      roles: {
        server: {
          name: "Server",
          department: "Front of House",
          screeningQuestions: [
            "Do you have previous serving experience?",
            "How comfortable are you handling cash transactions?",
            "Can you describe your customer service experience?"
          ],
          evaluationCriteria: {
            experience: {
              weight: 0.3,
              description: "Previous restaurant or service experience"
            },
            availability: {
              weight: 0.4,
              description: "Flexibility with shifts and weekend work"
            },
            customerService: {
              weight: 0.3,
              description: "Customer service skills and attitude"
            }
          }
        },
        cook: {
          name: "Cook",
          department: "Back of House",
          screeningQuestions: [
            "Do you have experience working in a commercial kitchen?",
            "How comfortable are you working under pressure?",
            "Can you describe your food safety knowledge?"
          ],
          evaluationCriteria: {
            experience: {
              weight: 0.4,
              description: "Commercial kitchen experience"
            },
            availability: {
              weight: 0.3,
              description: "Flexibility with shifts and weekend work"
            },
            foodSafety: {
              weight: 0.3,
              description: "Food safety knowledge and practices"
            }
          }
        }
      },
      generalSettings: {
        maxCallDuration: 600, // 10 minutes
        language: "en",
        voice: {
          provider: "elevenlabs",
          voiceId: "default"
        }
      },
      mandatoryQuestions: [],
      vapiSettings: {
        voice: {
          provider: "elevenlabs",
          voiceId: "default"
        },
        model: {
          provider: "openai",
          model: "gpt-4"
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en"
        },
        conversationTone: "friendly",
        maxCallDuration: 600
      },
      applicationSettings: {
        maxResumeSize: "5MB",
        allowedFileTypes: [".pdf", ".docx"],
        autoAdvanceToScreening: true
      }
    };
  }

  private readConfigFromFile(): ScreeningConfig {
    this.ensureDataDirectory();
    
    if (!fs.existsSync(CONFIG_FILE)) {
      const defaultConfig = this.getDefaultConfig();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      return defaultConfig;
    }
    
    try {
      const rawData = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(rawData) as ScreeningConfig;
    } catch (error) {
      console.error('Error reading config file:', error);
      return this.getDefaultConfig();
    }
  }

  private writeConfigToFile(config: ScreeningConfig): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error writing config file:', error);
      throw error;
    }
  }

  getConfig(): ScreeningConfig {
    return this.readConfigFromFile();
  }

  updateConfig(config: ScreeningConfig): ScreeningConfig {
    this.writeConfigToFile(config);
    return config;
  }

  updateRoleConfig(roleId: string, roleConfig: any): ScreeningConfig {
    const config = this.readConfigFromFile();
    config.roles[roleId] = roleConfig;
    this.writeConfigToFile(config);
    return config;
  }

  updateGeneralSettings(settings: any): ScreeningConfig {
    const config = this.readConfigFromFile();
    config.generalSettings = { ...config.generalSettings, ...settings };
    this.writeConfigToFile(config);
    return config;
  }

  backup(): string {
    const config = this.readConfigFromFile();
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const backupPath = path.join(DATA_DIR, `config.backup.${timestamp}.json`);
    
    try {
      fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));
      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  restore(configData: ScreeningConfig): ScreeningConfig {
    // Create backup before restoring
    this.backup();
    
    this.writeConfigToFile(configData);
    return configData;
  }
}

// Export singleton instance
export const configRepository = new ConfigRepository();
