import fs from 'fs';
import path from 'path';
import { ScreeningConfig } from '../screening/screeningConfigUtils';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'config.json');

// Ensure the config file exists
export const ensureConfigFile = () => {
  const dataDir = path.dirname(CONFIG_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    // Create default configuration if the file doesn't exist
    const defaultConfig: ScreeningConfig = {
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
            softSkills: {
              weight: 0.3,
              description: "Communication skills and customer service attitude"
            }
          }
        },
        cook: {
          name: "Cook",
          department: "Kitchen",
          screeningQuestions: [
            "What kitchen experience do you have?",
            "Are you comfortable working in a fast-paced kitchen environment?",
            "Do you have any food safety certifications?"
          ],
          evaluationCriteria: {
            experience: {
              weight: 0.5,
              description: "Kitchen and cooking experience"
            },
            availability: {
              weight: 0.3,
              description: "Shift flexibility and weekend availability"
            },
            softSkills: {
              weight: 0.2,
              description: "Teamwork and ability to work under pressure"
            }
          }
        },
        host: {
          name: "Host/Hostess",
          department: "Front of House",
          screeningQuestions: [
            "What customer service experience do you have?",
            "How do you handle stressful situations with customers?",
            "Are you comfortable using computer systems for reservations?"
          ],
          evaluationCriteria: {
            experience: {
              weight: 0.2,
              description: "Customer service or hospitality experience"
            },
            availability: {
              weight: 0.4,
              description: "Evening and weekend availability"
            },
            softSkills: {
              weight: 0.4,
              description: "Professional demeanor and communication skills"
            }
          }
        },
        manager: {
          name: "Manager",
          department: "Management",
          screeningQuestions: [
            "What experience do you have managing restaurant staff?",
            "How do you handle scheduling and staff conflicts?",
            "What strategies do you use to improve customer satisfaction?"
          ],
          evaluationCriteria: {
            experience: {
              weight: 0.5,
              description: "Previous management experience"
            },
            availability: {
              weight: 0.2,
              description: "Scheduling flexibility"
            },
            softSkills: {
              weight: 0.3,
              description: "Leadership and communication skills"
            }
          }
        },
        general: {
          name: "General Staff",
          department: "General",
          screeningQuestions: [
            "What restaurant experience do you have?",
            "What are your strengths in a fast-paced work environment?",
            "How would you contribute to a positive team atmosphere?"
          ],
          evaluationCriteria: {
            experience: {
              weight: 0.3,
              description: "Previous relevant experience"
            },
            availability: {
              weight: 0.4,
              description: "Schedule flexibility"
            },
            softSkills: {
              weight: 0.3,
              description: "Teamwork and adaptability"
            }
          }
        }
      },
      mandatoryQuestions: [
        "Are you available to work morning shifts (6 AM - 2 PM)?",
        "Are you available to work evening shifts (2 PM - 10 PM)?",
        "Can you work weekends?",
        "Do you have reliable transportation to get to work?"
      ],
      vapiSettings: {
        voice: {
          provider: "playht",
          voiceId: "jennifer"
        },
        model: {
          provider: "openai",
          model: "gpt-4"
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US"
        },
        conversationTone: "friendly and professional",
        maxCallDuration: 180
      },
      applicationSettings: {
        maxResumeSize: "5MB",
        allowedFileTypes: ["pdf"],
        autoAdvanceToScreening: true
      }
    };
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(defaultConfig, null, 2), 'utf8');
  }
};

// Read the config file
export const readConfigFile = (): ScreeningConfig => {
  ensureConfigFile();
  const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
  return JSON.parse(data) as ScreeningConfig;
};

// Write to the config file
export const writeConfigFile = (config: ScreeningConfig): void => {
  ensureConfigFile();
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
};
