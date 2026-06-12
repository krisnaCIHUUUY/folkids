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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          class_id: number
          created_at: string
          created_by: string
          due_at: string | null
          id: number
          instructions: string | null
          kind: Database["public"]["Enums"]["assignment_kind"]
          quiz_id: number | null
          story_id: number | null
          title: string
        }
        Insert: {
          class_id: number
          created_at?: string
          created_by: string
          due_at?: string | null
          id?: never
          instructions?: string | null
          kind: Database["public"]["Enums"]["assignment_kind"]
          quiz_id?: number | null
          story_id?: number | null
          title: string
        }
        Update: {
          class_id?: number
          created_at?: string
          created_by?: string
          due_at?: string | null
          id?: never
          instructions?: string | null
          kind?: Database["public"]["Enums"]["assignment_kind"]
          quiz_id?: number | null
          story_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: Database["public"]["Enums"]["badge_category"]
          code: string
          description: string
          emoji: string
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          category: Database["public"]["Enums"]["badge_category"]
          code: string
          description: string
          emoji: string
          id?: never
          name: string
          sort_order?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["badge_category"]
          code?: string
          description?: string
          emoji?: string
          id?: never
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      class_students: {
        Row: {
          class_id: number
          enrolled_at: string
          id: number
          student_id: string
        }
        Insert: {
          class_id: number
          enrolled_at?: string
          id?: never
          student_id: string
        }
        Update: {
          class_id?: number
          enrolled_at?: string
          id?: never
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          code: string
          created_at: string
          grade_level: string
          id: number
          name: string
          teacher_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          grade_level: string
          id?: never
          name: string
          teacher_id: string
        }
        Update: {
          code?: string
          created_at?: string
          grade_level?: string
          id?: never
          name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_plays: {
        Row: {
          created_at: string
          detail: Json | null
          duration_seconds: number | null
          game: Database["public"]["Enums"]["game_type"]
          id: number
          points: number
          score: number
          student_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json | null
          duration_seconds?: number | null
          game: Database["public"]["Enums"]["game_type"]
          id?: never
          points?: number
          score?: number
          student_id: string
        }
        Update: {
          created_at?: string
          detail?: Json | null
          duration_seconds?: number | null
          game?: Database["public"]["Enums"]["game_type"]
          id?: never
          points?: number
          score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_plays_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: number
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: never
          link?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: never
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          id: number
          max_score: number
          quiz_id: number
          started_at: string
          student_id: string
          total_score: number
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          id?: never
          max_score?: number
          quiz_id: number
          started_at?: string
          student_id: string
          total_score?: number
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: never
          max_score?: number
          quiz_id?: number
          started_at?: string
          student_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          id: number
          options: Json | null
          order_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: number
          score_weight: number
        }
        Insert: {
          correct_answer: string
          id?: never
          options?: Json | null
          order_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: number
          score_weight?: number
        }
        Update: {
          correct_answer?: string
          id?: never
          options?: Json | null
          order_number?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id?: number
          score_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          created_by: string
          id: number
          story_id: number
          time_limit_minutes: number
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: never
          story_id: number
          time_limit_minutes?: number
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: never
          story_id?: number
          time_limit_minutes?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          completed_at: string | null
          id: number
          is_completed: boolean
          last_page_read: number
          started_at: string
          story_id: number
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: never
          is_completed?: boolean
          last_page_read?: number
          started_at?: string
          story_id: number
          student_id: string
        }
        Update: {
          completed_at?: string | null
          id?: never
          is_completed?: boolean
          last_page_read?: number
          started_at?: string
          story_id?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          character_theme: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          id: number
          is_published: boolean
          region_origin: string | null
          synopsis: string | null
          title: string
          updated_at: string
        }
        Insert: {
          character_theme?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          id?: never
          is_published?: boolean
          region_origin?: string | null
          synopsis?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          character_theme?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          id?: never
          is_published?: boolean
          region_origin?: string | null
          synopsis?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_pages: {
        Row: {
          animation_data: Json | null
          audio_url: string | null
          character_values: string | null
          content: string
          created_at: string
          id: number
          illustration_url: string | null
          page_number: number
          story_id: number
        }
        Insert: {
          animation_data?: Json | null
          audio_url?: string | null
          character_values?: string | null
          content: string
          created_at?: string
          id?: never
          illustration_url?: string | null
          page_number: number
          story_id: number
        }
        Update: {
          animation_data?: Json | null
          audio_url?: string | null
          character_values?: string | null
          content?: string
          created_at?: string
          id?: never
          illustration_url?: string | null
          page_number?: number
          story_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "story_pages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      student_badges: {
        Row: {
          badge_id: number
          earned_at: string
          id: number
          student_id: string
        }
        Insert: {
          badge_id: number
          earned_at?: string
          id?: never
          student_id: string
        }
        Update: {
          badge_id?: number
          earned_at?: string
          id?: never
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_badges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard_stats: { Args: never; Returns: Json }
      class_leaderboard: {
        Args: { p_class_id: number }
        Returns: {
          game_points: number
          name: string
          quiz_points: number
          rank: number
          reading_points: number
          student_id: string
          total_points: number
        }[]
      }
      create_assignment: {
        Args: {
          p_class_id: number
          p_due_at: string
          p_instructions: string
          p_kind: Database["public"]["Enums"]["assignment_kind"]
          p_quiz_id: number
          p_story_id: number
          p_title: string
        }
        Returns: number
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      evaluate_badges: { Args: { p_student: string }; Returns: undefined }
      generate_class_code: { Args: never; Returns: string }
      is_class_member: { Args: { p_class_id: number }; Returns: boolean }
      is_class_teacher: { Args: { p_class_id: number }; Returns: boolean }
      is_student_in_my_class: {
        Args: { p_student_id: string }
        Returns: boolean
      }
      join_class_by_code: { Args: { p_code: string }; Returns: Json }
      regenerate_class_code: { Args: { p_class_id: number }; Returns: string }
      reorder_quiz_question: {
        Args: { p_direction: string; p_question_id: number }
        Returns: undefined
      }
      reorder_story_page: {
        Args: { p_direction: string; p_page_id: number }
        Returns: undefined
      }
      send_announcement: {
        Args: { p_body: string; p_class_id: number; p_title: string }
        Returns: number
      }
      submit_quiz_attempt: {
        Args: { p_answers: Json; p_quiz_id: number }
        Returns: Json
      }
    }
    Enums: {
      assignment_kind: "baca" | "kuis"
      badge_category: "membaca" | "kuis" | "game"
      difficulty: "mudah" | "sedang" | "sulit"
      game_type: "tangkap_kata" | "susun_kata" | "ketik_cepat"
      notification_type:
        | "tugas_baru"
        | "kuis_dinilai"
        | "pengumuman"
        | "badge_baru"
      question_type: "pilihan_ganda" | "benar_salah" | "isian" | "mencocokkan"
      user_role: "admin" | "guru" | "siswa"
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
      assignment_kind: ["baca", "kuis"],
      badge_category: ["membaca", "kuis", "game"],
      difficulty: ["mudah", "sedang", "sulit"],
      game_type: ["tangkap_kata", "susun_kata", "ketik_cepat"],
      notification_type: [
        "tugas_baru",
        "kuis_dinilai",
        "pengumuman",
        "badge_baru",
      ],
      question_type: ["pilihan_ganda", "benar_salah", "isian", "mencocokkan"],
      user_role: ["admin", "guru", "siswa"],
    },
  },
} as const
