import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

// Helper to get a fresh AI client instance
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Types ---
export interface CryAnalysisResult {
  primaryReason: string;
  confidenceScore: number;
  emotionalState: string;
  actionableSteps: string[];
  medicalDisclaimer: string;
  analysisContext: string;
  chartData: { name: string; value: number }[];
}

// --- Video Analysis (Gemini 2.5 Flash) ---
export const analyzeCryVideo = async (
  videoBase64: string,
  mimeType: string
): Promise<CryAnalysisResult> => {
  const ai = getAiClient();
  const prompt = `
    Analyze this video of a crying baby. 
    Identify the likely cause of the cry (Hunger, Tiredness, Pain/Gas, Overstimulation, Diaper).
    Provide actionable, step-by-step soothing techniques.
    Return a strictly formatted JSON response.
  `;

  // Schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      primaryReason: { type: Type.STRING, description: "The most likely reason for crying" },
      confidenceScore: { type: Type.NUMBER, description: "Confidence level 0-100" },
      emotionalState: { type: Type.STRING, description: "Description of the baby's state (e.g., Frantic, Whining)" },
      actionableSteps: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 3-5 immediate steps for the parent to take"
      },
      medicalDisclaimer: { type: Type.STRING, description: "Standard medical disclaimer if signs of illness are present" },
      analysisContext: { 
        type: Type.STRING, 
        description: "A brief, natural language explanation (max 2 sentences) of why the AI assigned these probabilities based on specific cues (e.g. 'The rhythmic nature of the cry suggests hunger, but the leg movements also indicate possible gas.')." 
      },
      chartData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER }
          }
        },
        description: "Data for a chart showing probability of different causes (must sum to 100)"
      }
    },
    required: ["primaryReason", "actionableSteps", "chartData", "analysisContext"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: videoBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as CryAnalysisResult;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// --- Quick Tips (Gemini 2.5 Flash) ---
export const getQuickTips = async (): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Give me 3 universal, safe, and quick tips for soothing a crying baby immediately while I wait for detailed analysis. Keep it under 50 words.",
  });
  return response.text || "Try swaddling, gentle rocking, or checking the diaper.";
};

// --- Chat with Search Grounding (Gemini 2.5 Flash) ---
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const sendChatMessage = async (
  message: string, 
  history: ChatMessage[]
): Promise<{ text: string; sources?: any[] }> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        tools: [{ googleSearch: {} }], // Search Grounding
        systemInstruction: "You are a helpful, empathetic pediatric assistant. Provide safe, evidence-based advice.",
      }
    });

    const text = response.text || "I'm sorry, I couldn't generate a response.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return { text, sources };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

// --- Text to Speech (Gemini 2.5 Flash TTS) ---
export const speakAdvice = async (text: string): Promise<AudioBuffer> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Calming voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  return decodeAudioData(base64ToUint8Array(base64Audio), audioCtx, 24000);
};

// --- Live API Connect ---
export const connectLiveParams = (
  callbacks: {
    onOpen: () => void,
    onMessage: (msg: LiveServerMessage) => void,
    onClose: () => void,
    onError: (err: any) => void
  },
  systemInstruction: string = "You are a calming, expert parenting coach named Nurture. Listen to the parent and the baby. Offer soothing advice in real-time. Keep responses concise and very calm."
) => {
    return {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: callbacks.onOpen,
            onmessage: callbacks.onMessage,
            onclose: callbacks.onClose,
            onerror: callbacks.onError,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            systemInstruction: systemInstruction,
        }
    };
};

// Helper to get the Live client from a fresh instance
export const getLiveClient = () => {
  const ai = getAiClient();
  return ai.live;
};