export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  videoUrl?: string;
  analysis: {
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
  createdAt: Date;
}
