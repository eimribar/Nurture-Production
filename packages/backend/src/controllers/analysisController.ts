import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '../utils/db.js';

// Validation schemas
const analyzeVideoSchema = z.object({
  videoBase64: z.string().min(1),
  mimeType: z.string().regex(/^video\/(mp4|webm|quicktime)$/),
});

interface AnalysisResult {
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
}

export async function analyzeVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get API key at runtime (after dotenv has loaded)
    const apiKey = process.env.GEMINI_API_KEY || '';

    // Validate request body
    const validation = analyzeVideoSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('Invalid request data', 400);
    }

    const { videoBase64, mimeType } = validation.data;

    const prompt = `You are an expert pediatric consultant analyzing a baby's cry.
Based on this video, identify the most likely reason the baby is crying and provide actionable advice.

Return a JSON response with:
{
  "reason": "Primary reason (Hunger/Tiredness/Pain or Gas/Overstimulation/Diaper)",
  "confidence": 0-100,
  "description": "Brief explanation of emotional state",
  "steps": ["Step 1", "Step 2", ...], (3-5 specific, actionable soothing steps)
  "probabilities": {
    "hunger": 0-100,
    "tired": 0-100,
    "pain": 0-100,
    "overstimulation": 0-100,
    "diaper": 0-100
  },
  "context": "Explanation of reasoning"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  data: videoBase64,
                  mimeType: mimeType,
                },
              },
              { text: prompt },
            ],
          }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(
        `Gemini API error: ${errorData.error?.message || 'Unknown error'}`,
        response.status
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('Failed to parse analysis result', 500);
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);

    // Save to history if user is authenticated
    if (req.user) {
      await db.createAnalysis({
        id: randomUUID(),
        userId: req.user.userId,
        analysis,
        createdAt: new Date(),
      });
    }

    res.json({
      status: 'success',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuickTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get API key at runtime (after dotenv has loaded)
    const apiKey = process.env.GEMINI_API_KEY || '';

    const prompt = `Provide 3 quick, general tips for soothing a crying baby.
Be concise and practical. Return as a JSON array of strings.
Example: ["Tip 1", "Tip 2", "Tip 3"]`;

    console.log('[QuickTips] API Key:', apiKey);
    console.log('[QuickTips] API Key length:', apiKey?.length);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    console.log('[QuickTips] Full URL:', url);
    console.log('[QuickTips] Request body:', JSON.stringify(requestBody, null, 2));
    console.log('[QuickTips] Calling Gemini API...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[QuickTips] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('[QuickTips] Error data:', JSON.stringify(errorData));
      throw new AppError(
        `Gemini API error: ${errorData.error?.message || 'Unknown error'}`,
        response.status
      );
    }

    const data = await response.json();
    console.log('[QuickTips] Success! Got response');
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new AppError('Failed to parse tips', 500);
    }

    const tips: string[] = JSON.parse(jsonMatch[0]);

    res.json({
      status: 'success',
      data: { tips },
    });
  } catch (error) {
    next(error);
  }
}
