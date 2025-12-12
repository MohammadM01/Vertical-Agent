import { GoogleGenAI, GenerateContentResponse, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION, MOCK_PATIENTS } from "../constants";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// --- RESPONSE SCHEMA ---
const agentResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diagnoses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        }
      }
    },
    soap: { type: Type.STRING, description: "The full SOAP note text" },
    icd10: { type: Type.ARRAY, items: { type: Type.STRING } },
    cpt: { type: Type.ARRAY, items: { type: Type.STRING } },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tool: { type: Type.STRING },
          args: { 
            type: Type.OBJECT,
            properties: {
              patient_id: { type: Type.STRING },
              date: { type: Type.STRING },
              reason: { type: Type.STRING },
              codes: { type: Type.ARRAY, items: { type: Type.STRING } },
              note: { type: Type.STRING }
            }
          }
        }
      }
    }
  },
  required: ["diagnoses", "soap", "icd10"]
};

/**
 * Main Agent Function
 */
export const runClinicalAgent = async (
  textPrompt: string,
  imageBase64?: string
): Promise<string> => {
  try {
    // 1. Inject Context: Give the AI knowledge of the mock patients
    const patientContext = JSON.stringify(MOCK_PATIENTS.map(p => ({
      id: p.id, name: p.name, age: p.age, condition: p.condition, 
      recent_labs: p.labs, recent_vitals: p.vitals
    })));

    // 2. Define Tools in Prompt (Simulated Tool Use for reliable JSON output)
    const toolDefinitions = `
    AVAILABLE TOOLS:
    1. submitClaim(patient_id, codes, note) - Submit insurance claims.
    2. scheduleFollowUp(patient_id, date, reason) - Schedule appointments.
    
    INSTRUCTIONS:
    - Analyze the input (text/image).
    - If an action is needed (like scheduling or billing), add it to the 'actions' array in the JSON response.
    - Use the provided patient context to find IDs and details.
    
    PATIENT CONTEXT:
    ${patientContext}
    `;

    const parts: any[] = [{ text: toolDefinitions + "\n\nUSER INPUT: " + textPrompt }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64.split(',')[1]
        }
      });
    }

    // 3. Generate content with strict JSON schema
    // Note: We removed 'tools' from config to force the model to output the action as JSON data, 
    // which prevents the "Function Call" modality from swallowing the text response.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: agentResponseSchema,
        temperature: 0.2
      }
    });

    return response.text || "{}";

  } catch (error) {
    console.error("Agent Error:", error);
    return JSON.stringify({
      diagnoses: [],
      soap: `System Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API Key.`,
      icd10: [],
      cpt: [],
      actions: []
    });
  }
};

export const generateClinicalNote = async (input: string) => {
  return runClinicalAgent(input);
}
