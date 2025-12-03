export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          social_links: Json | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          social_links?: Json | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          social_links?: Json | null
          role?: string
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: 'need' | 'offer'
          category: string
          location: string
          latitude: number | null
          longitude: number | null
          media_urls: string[] | null
          status: 'active' | 'closed' | 'pending'
          contact_email: string | null
          contact_phone: string | null
          view_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: 'need' | 'offer'
          category: string
          location: string
          latitude?: number | null
          longitude?: number | null
          media_urls?: string[] | null
          status?: 'active' | 'closed' | 'pending'
          contact_email?: string | null
          contact_phone?: string | null
          view_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: 'need' | 'offer'
          category?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          media_urls?: string[] | null
          status?: 'active' | 'closed' | 'pending'
          contact_email?: string | null
          contact_phone?: string | null
          view_count?: number
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          listing_id: string
          user_id: string | null
          message: string
          contact_info: string | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id?: string | null
          message: string
          contact_info?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string | null
          message?: string
          contact_info?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
    }
  }
}
