import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Database Types
 * These match the schema defined in src/db/migrations/001_initial_schema.sql
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          video_url: string | null;
          primary_reason: string | null;
          confidence_score: number | null;
          emotional_state: string | null;
          actionable_steps: any | null;
          medical_disclaimer: string | null;
          analysis_context: string | null;
          chart_data: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_url?: string | null;
          primary_reason?: string | null;
          confidence_score?: number | null;
          emotional_state?: string | null;
          actionable_steps?: any | null;
          medical_disclaimer?: string | null;
          analysis_context?: string | null;
          chart_data?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_url?: string | null;
          primary_reason?: string | null;
          confidence_score?: number | null;
          emotional_state?: string | null;
          actionable_steps?: any | null;
          medical_disclaimer?: string | null;
          analysis_context?: string | null;
          chart_data?: any | null;
          created_at?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'model';
          message: string;
          sources: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'model';
          message: string;
          sources?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'user' | 'model';
          message?: string;
          sources?: any | null;
          created_at?: string;
        };
      };
    };
  };
}

// Singleton Supabase client
let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Get or create Supabase client instance
 * Uses singleton pattern to reuse connection
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}
