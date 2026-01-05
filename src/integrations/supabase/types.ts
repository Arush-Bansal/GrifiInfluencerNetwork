export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          niche: string | null
          platform: string | null
          followers: string | null
          engagement_rate: string | null
          location: string | null
          website: string | null
          banner_url: string | null
          updated_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          niche?: string | null
          platform?: string | null
          followers?: string | null
          engagement_rate?: string | null
          location?: string | null
          website?: string | null
          banner_url?: string | null
          updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          niche?: string | null
          platform?: string | null
          followers?: string | null
          engagement_rate?: string | null
          location?: string | null
          website?: string | null
          banner_url?: string | null
          updated_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_members: {
        Row: {
          community_id: string
          user_id: string
          role: "admin" | "moderator" | "member" | null
          joined_at: string
        }
        Insert: {
          community_id: string
          user_id: string
          role?: "admin" | "moderator" | "member" | null
          joined_at?: string
        }
        Update: {
          community_id?: string
          user_id?: string
          role?: "admin" | "moderator" | "member" | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_followers: {
        Row: {
          community_id: string
          user_id: string
          followed_at: string
        }
        Insert: {
          community_id: string
          user_id: string
          followed_at?: string
        }
        Update: {
          community_id?: string
          user_id?: string
          followed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_followers_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_posts: {
        Row: {
          id: string
          community_id: string | null
          author_id: string
          content: string
          image_url: string | null
          status: "pending" | "approved" | "rejected" | null
          moderated_by: string | null
          moderated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          community_id?: string | null
          author_id: string
          content: string
          image_url?: string | null
          status?: "pending" | "approved" | "rejected" | null
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string | null
          author_id?: string
          content?: string
          image_url?: string | null
          status?: "pending" | "approved" | "rejected" | null
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      collab_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: "pending" | "accepted" | "rejected" | "completed" | null
          type: "collab" | "sponsorship"
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: "pending" | "accepted" | "rejected" | "completed" | null
          type: "collab" | "sponsorship"
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: "pending" | "accepted" | "rejected" | "completed" | null
          type?: "collab" | "sponsorship"
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collab_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collab_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          curr_user_id: string | null
          content: string
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          curr_user_id?: string | null
          content: string
          read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          curr_user_id?: string | null
          content?: string
          read?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          title: string
          description: string
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          description: string
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          title?: string
          description?: string
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_applications: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          status: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          influencer_id: string
          status?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          influencer_id?: string
          status?: string | null
          message?: string | null
          created_at?: string
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
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
