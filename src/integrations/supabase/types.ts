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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      communities: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon_url: string | null
          id: string
          member_count: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          member_count?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          member_count?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_impacts: {
        Row: {
          co2_saved_kg: number | null
          created_at: string | null
          distance_km: number | null
          fuel_saved_liters: number | null
          id: string
          ride_id: string | null
          user_id: string
        }
        Insert: {
          co2_saved_kg?: number | null
          created_at?: string | null
          distance_km?: number | null
          fuel_saved_liters?: number | null
          id?: string
          ride_id?: string | null
          user_id: string
        }
        Update: {
          co2_saved_kg?: number | null
          created_at?: string | null
          distance_km?: number | null
          fuel_saved_liters?: number | null
          id?: string
          ride_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eco_impacts_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eco_impacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          event_date: string
          id: string
          location: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          event_date: string
          id?: string
          location: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          event_date?: string
          id?: string
          location?: string
          name?: string
        }
        Relationships: []
      }
      lost_items: {
        Row: {
          created_at: string | null
          found_by: string | null
          id: string
          item_description: string
          item_image_url: string | null
          reporter_id: string
          ride_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          found_by?: string | null
          id?: string
          item_description: string
          item_image_url?: string | null
          reporter_id: string
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          found_by?: string | null
          id?: string
          item_description?: string
          item_image_url?: string | null
          reporter_id?: string
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lost_items_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          flexibility_radius_km: number | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_verified: boolean | null
          phone: string | null
          preferred_mood: Database["public"]["Enums"]["mood_type"] | null
          rating: number | null
          reward_points: number | null
          role: Database["public"]["Enums"]["user_role"]
          total_ratings: number | null
          total_rides_shared: number | null
          total_rides_taken: number | null
          updated_at: string | null
          vehicle_number: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          flexibility_radius_km?: number | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          preferred_mood?: Database["public"]["Enums"]["mood_type"] | null
          rating?: number | null
          reward_points?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          total_ratings?: number | null
          total_rides_shared?: number | null
          total_rides_taken?: number | null
          updated_at?: string | null
          vehicle_number?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          flexibility_radius_km?: number | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          preferred_mood?: Database["public"]["Enums"]["mood_type"] | null
          rating?: number | null
          reward_points?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          total_ratings?: number | null
          total_rides_shared?: number | null
          total_rides_taken?: number | null
          updated_at?: string | null
          vehicle_number?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rated_user_id: string
          rater_user_id: string
          rating: number
          ride_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_user_id: string
          rater_user_id: string
          rating: number
          ride_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_user_id?: string
          rater_user_id?: string
          rating?: number
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_awarded: boolean | null
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_awarded?: boolean | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_awarded?: boolean | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      reward_transactions: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
          ride_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          reason: string
          ride_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          ride_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_transactions_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_bookings: {
        Row: {
          actual_pickup_location: string | null
          created_at: string | null
          detour_distance_km: number | null
          detour_surcharge: number | null
          dropoff_eta: string | null
          feedback: string | null
          id: string
          pickup_eta: string | null
          pickup_location: string | null
          rating: number | null
          ride_id: string
          rider_id: string
          seats_booked: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_pickup_location?: string | null
          created_at?: string | null
          detour_distance_km?: number | null
          detour_surcharge?: number | null
          dropoff_eta?: string | null
          feedback?: string | null
          id?: string
          pickup_eta?: string | null
          pickup_location?: string | null
          rating?: number | null
          ride_id: string
          rider_id: string
          seats_booked?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_pickup_location?: string | null
          created_at?: string | null
          detour_distance_km?: number | null
          detour_surcharge?: number | null
          dropoff_eta?: string | null
          feedback?: string | null
          id?: string
          pickup_eta?: string | null
          pickup_location?: string | null
          rating?: number | null
          ride_id?: string
          rider_id?: string
          seats_booked?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_bookings_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_notifications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          message: string
          notification_type: string
          read: boolean | null
          ride_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          notification_type: string
          read?: boolean | null
          ride_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          read?: boolean | null
          ride_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "ride_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_notifications_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          available_seats: number
          created_at: string | null
          departure_time: string
          destination: string
          destination_lat: number | null
          destination_lng: number | null
          id: string
          is_recurring: boolean | null
          is_wheelchair_accessible: boolean | null
          is_women_only: boolean | null
          notes: string | null
          origin: string
          origin_lat: number | null
          origin_lng: number | null
          preferred_mood: Database["public"]["Enums"]["mood_type"] | null
          price_per_seat: number | null
          recurrence_pattern: string | null
          sharer_id: string
          status: Database["public"]["Enums"]["ride_status"] | null
          total_seats: number
          updated_at: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          available_seats: number
          created_at?: string | null
          departure_time: string
          destination: string
          destination_lat?: number | null
          destination_lng?: number | null
          id?: string
          is_recurring?: boolean | null
          is_wheelchair_accessible?: boolean | null
          is_women_only?: boolean | null
          notes?: string | null
          origin: string
          origin_lat?: number | null
          origin_lng?: number | null
          preferred_mood?: Database["public"]["Enums"]["mood_type"] | null
          price_per_seat?: number | null
          recurrence_pattern?: string | null
          sharer_id: string
          status?: Database["public"]["Enums"]["ride_status"] | null
          total_seats: number
          updated_at?: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          available_seats?: number
          created_at?: string | null
          departure_time?: string
          destination?: string
          destination_lat?: number | null
          destination_lng?: number | null
          id?: string
          is_recurring?: boolean | null
          is_wheelchair_accessible?: boolean | null
          is_women_only?: boolean | null
          notes?: string | null
          origin?: string
          origin_lat?: number | null
          origin_lng?: number | null
          preferred_mood?: Database["public"]["Enums"]["mood_type"] | null
          price_per_seat?: number | null
          recurrence_pattern?: string | null
          sharer_id?: string
          status?: Database["public"]["Enums"]["ride_status"] | null
          total_seats?: number
          updated_at?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rides_sharer_id_fkey"
            columns: ["sharer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_communities: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_communities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_communities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_ride_notification: {
        Args: {
          p_booking_id: string
          p_message: string
          p_ride_id: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      mood_type: "quiet" | "chatty" | "music" | "focus"
      request_status:
        | "pending"
        | "accepted"
        | "declined"
        | "completed"
        | "cancelled"
      ride_status: "scheduled" | "active" | "completed" | "cancelled"
      user_role: "student" | "faculty" | "staff"
      vehicle_type: "car" | "bike" | "scooter"
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
      app_role: ["admin", "moderator", "user"],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      mood_type: ["quiet", "chatty", "music", "focus"],
      request_status: [
        "pending",
        "accepted",
        "declined",
        "completed",
        "cancelled",
      ],
      ride_status: ["scheduled", "active", "completed", "cancelled"],
      user_role: ["student", "faculty", "staff"],
      vehicle_type: ["car", "bike", "scooter"],
    },
  },
} as const
