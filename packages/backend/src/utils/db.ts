import type { User, AnalysisRecord } from '../types/user.js';
import { getSupabaseClient } from './supabaseClient.js';

/**
 * Database service using Supabase
 * Provides a consistent interface for database operations
 */
class SupabaseDB {
  private supabase = getSupabaseClient();

  // User methods
  async createUser(user: User): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        password_hash: user.passwordHash,
        name: user.name || null,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return this.mapDbUserToUser(data);
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }

    return data ? this.mapDbUserToUser(data) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to get user by email: ${error.message}`);
    }

    return data ? this.mapDbUserToUser(data) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.passwordHash !== undefined) dbUpdates.password_hash = updates.passwordHash;
    if (updates.name !== undefined) dbUpdates.name = updates.name;

    const { data, error } = await (this.supabase as any)
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data ? this.mapDbUserToUser(data) : null;
  }

  // Analysis methods
  async createAnalysis(analysis: AnalysisRecord): Promise<AnalysisRecord> {
    const { data, error} = await this.supabase
      .from('analyses')
      .insert({
        id: analysis.id,
        user_id: analysis.userId,
        video_url: analysis.videoUrl || null,
        primary_reason: analysis.analysis.reason,
        confidence_score: analysis.analysis.confidence,
        emotional_state: analysis.analysis.description,
        actionable_steps: analysis.analysis.steps,
        medical_disclaimer: null, // Add if needed in frontend
        analysis_context: analysis.analysis.context,
        chart_data: analysis.analysis.probabilities,
        created_at: analysis.createdAt.toISOString(),
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create analysis: ${error.message}`);
    }

    return this.mapDbAnalysisToAnalysisRecord(data);
  }

  async getAnalysisByUserId(userId: string): Promise<AnalysisRecord[]> {
    const { data, error } = await this.supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get analyses for user: ${error.message}`);
    }

    return data ? data.map(this.mapDbAnalysisToAnalysisRecord) : [];
  }

  async getAnalysisById(id: string): Promise<AnalysisRecord | null> {
    const { data, error } = await this.supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get analysis by ID: ${error.message}`);
    }

    return data ? this.mapDbAnalysisToAnalysisRecord(data) : null;
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('analyses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete analysis: ${error.message}`);
    }

    return true;
  }

  // Helper methods to map database rows to application types
  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      passwordHash: dbUser.password_hash,
      name: dbUser.name || undefined,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    };
  }

  private mapDbAnalysisToAnalysisRecord(dbAnalysis: any): AnalysisRecord {
    return {
      id: dbAnalysis.id,
      userId: dbAnalysis.user_id,
      videoUrl: dbAnalysis.video_url || undefined,
      analysis: {
        reason: dbAnalysis.primary_reason || '',
        confidence: dbAnalysis.confidence_score || 0,
        description: dbAnalysis.emotional_state || '',
        steps: Array.isArray(dbAnalysis.actionable_steps) ? dbAnalysis.actionable_steps : [],
        probabilities: dbAnalysis.chart_data || {
          hunger: 0,
          tired: 0,
          pain: 0,
          overstimulation: 0,
          diaper: 0,
        },
        context: dbAnalysis.analysis_context || '',
      },
      createdAt: new Date(dbAnalysis.created_at),
    };
  }
}

// Export singleton instance
export const db = new SupabaseDB();
