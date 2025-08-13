import { supabase } from './supabase'
import { authService } from './auth'

export interface Website {
  id?: string
  user_id?: string
  website_name: string
  website_url: string
  category: string[]
  website_status: string
  created_at?: string
  updated_at?: string
}

export class SupabaseWebsiteService {
  private static instance: SupabaseWebsiteService

  public static getInstance(): SupabaseWebsiteService {
    if (!SupabaseWebsiteService.instance) {
      SupabaseWebsiteService.instance = new SupabaseWebsiteService()
    }
    return SupabaseWebsiteService.instance
  }

  async createWebsitesTable() {
    // This would typically be done through Supabase dashboard or migrations
    // But here's the SQL for reference:
    /*
    CREATE TABLE websites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      website_name TEXT NOT NULL,
      website_url TEXT NOT NULL,
      category TEXT[] DEFAULT '{}',
      website_status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS (Row Level Security)
    ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

    -- Create policy so users can only see their own websites
    CREATE POLICY "Users can view own websites" ON websites
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own websites" ON websites
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own websites" ON websites
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own websites" ON websites
      FOR DELETE USING (auth.uid() = user_id);
    */
  }

  async insertWebsite(
    websiteName: string,
    websiteURL: string,
    category: string[],
    websiteStatus: string = 'active'
  ): Promise<{ success: boolean; data?: Website; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('websites')
        .insert([
          {
            user_id: user.id,
            website_name: websiteName,
            website_url: websiteURL,
            category: category,
            website_status: websiteStatus,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error inserting website:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error inserting website:', error)
      return { success: false, error: 'Failed to save website' }
    }
  }

  async getAllWebsites(): Promise<{ success: boolean; data?: Website[]; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching websites:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Unexpected error fetching websites:', error)
      return { success: false, error: 'Failed to fetch websites' }
    }
  }

  async getWebsiteById(id: string): Promise<{ success: boolean; data?: Website; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching website:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error fetching website:', error)
      return { success: false, error: 'Failed to fetch website' }
    }
  }

  async updateWebsite(
    id: string,
    updates: Partial<Website>
  ): Promise<{ success: boolean; data?: Website; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('websites')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating website:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error updating website:', error)
      return { success: false, error: 'Failed to update website' }
    }
  }

  async deleteWebsite(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting website:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error deleting website:', error)
      return { success: false, error: 'Failed to delete website' }
    }
  }

  async searchWebsites(query: string): Promise<{ success: boolean; data?: Website[]; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .or(`website_name.ilike.%${query}%,website_url.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching websites:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Unexpected error searching websites:', error)
      return { success: false, error: 'Failed to search websites' }
    }
  }

  async getWebsitesByCategory(category: string): Promise<{ success: boolean; data?: Website[]; error?: string }> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .contains('category', [category])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching websites by category:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Unexpected error fetching websites by category:', error)
      return { success: false, error: 'Failed to fetch websites by category' }
    }
  }
}

// Export a singleton instance
export const supabaseWebsiteService = SupabaseWebsiteService.getInstance()
