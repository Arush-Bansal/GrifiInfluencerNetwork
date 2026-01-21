export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campaign_applications: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          influencer_id: string
          message: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          influencer_id: string
          message?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          influencer_id?: string
          message?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_applications_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          created_at: string
          description: string
          id: string
          status: string | null
          title: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          description: string
          id?: string
          status?: string | null
          title: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          description?: string
          id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collab_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          receiver_id: string
          sender_id: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          type: Database["public"]["Enums"]["request_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id: string
          sender_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          type: Database["public"]["Enums"]["request_type"]
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          type?: Database["public"]["Enums"]["request_type"]
        }
        Relationships: []
      }
      featured_reels: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          thumbnail_url: string | null
          title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          thumbnail_url?: string | null
          title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_reels_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          curr_user_id: string | null
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          curr_user_id?: string | null
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          curr_user_id?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      past_collaborations: {
        Row: {
          brand_logo_url: string | null
          brand_name: string
          created_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          brand_logo_url?: string | null
          brand_name: string
          created_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          brand_logo_url?: string | null
          brand_name?: string
          created_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "past_collaborations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          email_copy_count: number | null
          engagement_rate: string | null
          followers: string | null
          full_name: string | null
          id: string
          insta_copy_count: number | null
          instagram_url: string | null
          is_verified: boolean | null
          location: string | null
          niche: string | null
          onboarding_completed: boolean | null
          page_visits: number | null
          platform: string | null
          public_email: string | null
          service_appearances: boolean | null
          service_brand: boolean
          service_ugc: boolean
          services: string[] | null
          twitter_copy_count: number | null
          twitter_url: string | null
          updated_at: string | null
          username: string | null
          website: string | null
          youtube_url: string | null
          yt_copy_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          email_copy_count?: number | null
          engagement_rate?: string | null
          followers?: string | null
          full_name?: string | null
          id: string
          insta_copy_count?: number | null
          instagram_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          niche?: string | null
          onboarding_completed?: boolean | null
          page_visits?: number | null
          platform?: string | null
          public_email?: string | null
          service_appearances?: boolean | null
          service_brand?: boolean
          service_ugc?: boolean
          services?: string[] | null
          twitter_copy_count?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          youtube_url?: string | null
          yt_copy_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          email_copy_count?: number | null
          engagement_rate?: string | null
          followers?: string | null
          full_name?: string | null
          id?: string
          insta_copy_count?: number | null
          instagram_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          niche?: string | null
          onboarding_completed?: boolean | null
          page_visits?: number | null
          platform?: string | null
          public_email?: string | null
          service_appearances?: boolean | null
          service_brand?: boolean
          service_ugc?: boolean
          services?: string[] | null
          twitter_copy_count?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          youtube_url?: string | null
          yt_copy_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_community_role: {
        Args: {
          comm_id: string
          required_roles: Database["public"]["Enums"]["community_role"][]
          target_user_id: string
        }
        Returns: boolean
      }
      delete_own_user: { Args: never; Returns: undefined }
      increment_profile_stat: {
        Args: { profile_id: string; stat_column: string }
        Returns: undefined
      }
      is_admin: { Args: { cid: string }; Returns: boolean }
      is_mod: { Args: { cid: string }; Returns: boolean }
    }
    Enums: {
      community_role: "admin" | "moderator" | "member"
      post_status: "pending" | "approved" | "rejected"
      request_status: "pending" | "accepted" | "rejected" | "completed"
      request_type: "collab" | "sponsorship"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      community_role: ["admin", "moderator", "member"],
      post_status: ["pending", "approved", "rejected"],
      request_status: ["pending", "accepted", "rejected", "completed"],
      request_type: ["collab", "sponsorship"],
    },
  },
} as const
