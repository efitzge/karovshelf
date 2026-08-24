export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      book_requests: {
        Row: {
          created_at: string
          id: string
          library_item_id: string
          message: string | null
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          library_item_id: string
          message?: string | null
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          library_item_id?: string
          message?: string | null
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_requests_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          authors: string[]
          cover_url: string | null
          created_at: string
          fetched_at: string
          first_published: number | null
          genre: string | null
          id: string
          is_placeholder: boolean
          isbn10: string | null
          isbn13: string | null
          language: string | null
          lookup_key: string
          match_score: number | null
          match_source: string | null
          subjects: string[]
          subtitle: string | null
          title: string
        }
        Insert: {
          authors?: string[]
          cover_url?: string | null
          created_at?: string
          fetched_at?: string
          first_published?: number | null
          genre?: string | null
          id?: string
          is_placeholder?: boolean
          isbn10?: string | null
          isbn13?: string | null
          language?: string | null
          lookup_key: string
          match_score?: number | null
          match_source?: string | null
          subjects?: string[]
          subtitle?: string | null
          title: string
        }
        Update: {
          authors?: string[]
          cover_url?: string | null
          created_at?: string
          fetched_at?: string
          first_published?: number | null
          genre?: string | null
          id?: string
          is_placeholder?: boolean
          isbn10?: string | null
          isbn13?: string | null
          language?: string | null
          lookup_key?: string
          match_score?: number | null
          match_source?: string | null
          subjects?: string[]
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          book_id: string
          condition: string | null
          confirmed: boolean
          created_at: string
          id: string
          notes: string | null
          owner_id: string
          scan_batch_id: string | null
          scan_legibility: string | null
          scan_spine_text: string | null
          shareable: boolean
        }
        Insert: {
          book_id: string
          condition?: string | null
          confirmed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          owner_id: string
          scan_batch_id?: string | null
          scan_legibility?: string | null
          scan_spine_text?: string | null
          shareable?: boolean
        }
        Update: {
          book_id?: string
          condition?: string | null
          confirmed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          owner_id?: string
          scan_batch_id?: string | null
          scan_legibility?: string | null
          scan_spine_text?: string | null
          shareable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "library_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_scan_batch_id_fkey"
            columns: ["scan_batch_id"]
            isOneToOne: false
            referencedRelation: "scan_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string
          contact_note: string | null
          created_at: string
          display_name: string
          id: string
          neighbourhood: string
        }
        Insert: {
          city?: string
          contact_note?: string | null
          created_at?: string
          display_name: string
          id: string
          neighbourhood: string
        }
        Update: {
          city?: string
          contact_note?: string | null
          created_at?: string
          display_name?: string
          id?: string
          neighbourhood?: string
        }
        Relationships: []
      }
      scan_batches: {
        Row: {
          created_at: string
          flagged_reason: string | null
          id: string
          imported_at: string | null
          owner_id: string
          photo_paths: string[]
          processed_at: string | null
          processing_source: string | null
          stats: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          flagged_reason?: string | null
          id?: string
          imported_at?: string | null
          owner_id: string
          photo_paths?: string[]
          processed_at?: string | null
          processing_source?: string | null
          stats?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          flagged_reason?: string | null
          id?: string
          imported_at?: string | null
          owner_id?: string
          photo_paths?: string[]
          processed_at?: string | null
          processing_source?: string | null
          stats?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_batches_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_cached_book: {
        Args: { p_author?: string; p_limit?: number; p_title: string }
        Returns: {
          authors: string[]
          cover_url: string
          first_published: number
          genre: string
          id: string
          isbn13: string
          lookup_key: string
          match_source: string
          score: number
          subjects: string[]
          title: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
