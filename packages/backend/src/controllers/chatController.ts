import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

// Validation schema
const chatMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.string(),
  })).optional(),
});

export async function sendChatMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get API key at runtime (after dotenv has loaded)
    const apiKey = process.env.GEMINI_API_KEY || '';

    // Validate request body
    const validation = chatMessageSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Invalid request data', 400);
    }

    const { message, history = [] } = validation.data;

    // Build conversation history with current message
    const contents = [
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: message }],
      },
    ];

    // Call Gemini API with Google Search grounding
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          tools: [{
            googleSearchRetrieval: {
              dynamicRetrievalConfig: {
                mode: 'MODE_DYNAMIC',
                dynamicThreshold: 0.7,
              },
            },
          }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new AppError(
        `Gemini API error: ${errorData.error?.message || 'Unknown error'}`,
        response.status
      );
    }

    const data = await response.json() as any;
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract grounding metadata (search results)
    const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingSupports?.map((support: any) => ({
      url: support.segment?.text,
      title: support.segment?.text,
    })) || [];

    res.json({
      status: 'success',
      data: {
        message: responseText,
        sources,
      },
    });
  } catch (error) {
    next(error);
  }
}
