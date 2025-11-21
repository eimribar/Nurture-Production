import { apiClient } from './apiClient';

export interface CryAnalysisResult {
  primaryReason: string;
  confidenceScore: number;
  emotionalState: string;
  actionableSteps: string[];
  medicalDisclaimer: string;
  analysisContext: string;
  chartData: { name: string; value: number }[];
}

export interface BackendAnalysisResponse {
  status: 'success';
  data: {
    reason: string;
    confidence: number;
    description: string;
    steps: string[];
    probabilities: {
      hunger: number;
      tired: number;
      pain: number;
      overstimulation: number;
      diaper: number;
    };
    context: string;
  };
}

export interface QuickTipsResponse {
  status: 'success';
  data: {
    tips: string[];
  };
}

/**
 * Analyze baby cry video via backend API
 */
export const analyzeCryVideo = async (
  videoBase64: string,
  mimeType: string
): Promise<CryAnalysisResult> => {
  const response = await apiClient.post<BackendAnalysisResponse>('/analysis/video', {
    videoBase64,
    mimeType,
  });

  // Transform backend response to match frontend interface
  const { data } = response;
  return {
    primaryReason: data.reason,
    confidenceScore: data.confidence,
    emotionalState: data.description,
    actionableSteps: data.steps,
    medicalDisclaimer: data.confidence < 70
      ? 'Low confidence - please consult a pediatrician if symptoms persist.'
      : '',
    analysisContext: data.context,
    chartData: [
      { name: 'Hunger', value: data.probabilities.hunger },
      { name: 'Tired', value: data.probabilities.tired },
      { name: 'Pain/Gas', value: data.probabilities.pain },
      { name: 'Overstimulation', value: data.probabilities.overstimulation },
      { name: 'Diaper', value: data.probabilities.diaper },
    ],
  };
};

/**
 * Get quick soothing tips via backend API
 */
export const getQuickTips = async (): Promise<string> => {
  const response = await apiClient.get<QuickTipsResponse>('/analysis/quick-tips');
  return response.data.tips.join(' • ');
};
