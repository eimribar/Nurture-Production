import { apiClient } from './apiClient';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatResponse {
  status: 'success';
  data: {
    message: string;
    sources?: Array<{
      url: string;
      title: string;
    }>;
  };
}

/**
 * Send chat message via backend API
 */
export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<{ text: string; sources?: any[] }> => {
  const response = await apiClient.post<ChatResponse>('/chat/message', {
    message,
    history: history.map(msg => ({
      role: msg.role,
      parts: msg.text,
    })),
  });

  return {
    text: response.data.message,
    sources: response.data.sources,
  };
};
