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
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          file_name: string
          id: string
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          body: string
          created_at: string
          id: string
        }
        Insert: {
          application_id: string
          author_id: string
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          age_band: string | null
          assigned_to: string | null
          city_region: string | null
          consents: Json
          created_at: string
          decision_reason: string | null
          education_level: string | null
          email: string
          full_name: string
          id: string
          motivation: string
          occupation: string | null
          opportunity_id: string | null
          phone: string | null
          plans: string | null
          preferred_cluster_id: string | null
          programme_id: string | null
          reference: string
          reviewed_at: string | null
          reviewed_by: string | null
          secondary_interests: string[] | null
          site: Database["public"]["Enums"]["site_id"]
          source_host: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          updated_at: string
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          age_band?: string | null
          assigned_to?: string | null
          city_region?: string | null
          consents?: Json
          created_at?: string
          decision_reason?: string | null
          education_level?: string | null
          email: string
          full_name: string
          id?: string
          motivation: string
          occupation?: string | null
          opportunity_id?: string | null
          phone?: string | null
          plans?: string | null
          preferred_cluster_id?: string | null
          programme_id?: string | null
          reference: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          secondary_interests?: string[] | null
          site: Database["public"]["Enums"]["site_id"]
          source_host?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
          world: Database["public"]["Enums"]["world"]
        }
        Update: {
          age_band?: string | null
          assigned_to?: string | null
          city_region?: string | null
          consents?: Json
          created_at?: string
          decision_reason?: string | null
          education_level?: string | null
          email?: string
          full_name?: string
          id?: string
          motivation?: string
          occupation?: string | null
          opportunity_id?: string | null
          phone?: string | null
          plans?: string | null
          preferred_cluster_id?: string | null
          programme_id?: string | null
          reference?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          secondary_interests?: string[] | null
          site?: Database["public"]["Enums"]["site_id"]
          source_host?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "applications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_preferred_cluster_id_fkey"
            columns: ["preferred_cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          author_id: string | null
          author_name: string | null
          body: Json
          category: string | null
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          current_version: number
          excerpt: string
          id: string
          is_public: boolean
          locale: string
          provenance: Json
          published_at: string | null
          published_display_at: string | null
          reading_minutes: number | null
          related_programme_id: string | null
          reviewer_id: string | null
          scheduled_at: string | null
          seo: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          submitted_at: string | null
          title: string
          translation_of: string | null
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          author_id?: string | null
          author_name?: string | null
          body?: Json
          category?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          excerpt?: string
          id?: string
          is_public?: boolean
          locale?: string
          provenance?: Json
          published_at?: string | null
          published_display_at?: string | null
          reading_minutes?: number | null
          related_programme_id?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          author_id?: string | null
          author_name?: string | null
          body?: Json
          category?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          excerpt?: string
          id?: string
          is_public?: boolean
          locale?: string
          provenance?: Json
          published_at?: string | null
          published_display_at?: string | null
          reading_minutes?: number | null
          related_programme_id?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title?: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "articles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_related_programme_fk"
            columns: ["related_programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json
          next: Json | null
          object_id: string | null
          object_type: string
          previous: Json | null
          site: Database["public"]["Enums"]["site_id"] | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          next?: Json | null
          object_id?: string | null
          object_type: string
          previous?: Json | null
          site?: Database["public"]["Enums"]["site_id"] | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          next?: Json | null
          object_id?: string | null
          object_type?: string
          previous?: Json | null
          site?: Database["public"]["Enums"]["site_id"] | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clusters: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          body: Json
          code: string | null
          created_at: string
          created_by: string | null
          current_version: number
          hero_media_id: string | null
          id: string
          is_public: boolean
          locale: string
          location: string | null
          member_count: number | null
          name: string
          programme_id: string | null
          provenance: Json
          published_at: string | null
          reviewer_id: string | null
          scheduled_at: string | null
          sector: string
          seo: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status_content: Database["public"]["Enums"]["content_status"]
          status_label: string | null
          submitted_at: string | null
          summary: string
          translation_of: string | null
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          hero_media_id?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          location?: string | null
          member_count?: number | null
          name: string
          programme_id?: string | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          sector?: string
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug: string
          status_content?: Database["public"]["Enums"]["content_status"]
          status_label?: string | null
          submitted_at?: string | null
          summary?: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          hero_media_id?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          location?: string | null
          member_count?: number | null
          name?: string
          programme_id?: string | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          sector?: string
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug?: string
          status_content?: Database["public"]["Enums"]["content_status"]
          status_label?: string | null
          submitted_at?: string | null
          summary?: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "clusters_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organization: string | null
          programme_id: string | null
          property_id: string | null
          reference: string
          resolved_at: string | null
          site: Database["public"]["Enums"]["site_id"]
          source_host: string | null
          source_page: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["enquiry_status"]
          updated_at: string
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organization?: string | null
          programme_id?: string | null
          property_id?: string | null
          reference: string
          resolved_at?: string | null
          site: Database["public"]["Enums"]["site_id"]
          source_host?: string | null
          source_page?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
          world: Database["public"]["Enums"]["world"]
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organization?: string | null
          programme_id?: string | null
          property_id?: string | null
          reference?: string
          resolved_at?: string | null
          site?: Database["public"]["Enums"]["site_id"]
          source_host?: string | null
          source_page?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          enquiry_id: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          enquiry_id: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          enquiry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiry_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiry_notes_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          created_at: string
          evidence_date: string | null
          file_media_id: string | null
          id: string
          source: string | null
          supersedes_id: string | null
          title: string
          type: Database["public"]["Enums"]["evidence_type"]
          uploaded_by: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          evidence_date?: string | null
          file_media_id?: string | null
          id?: string
          source?: string | null
          supersedes_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["evidence_type"]
          uploaded_by?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          evidence_date?: string | null
          file_media_id?: string | null
          id?: string
          source?: string | null
          supersedes_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["evidence_type"]
          uploaded_by?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_file_media_id_fkey"
            columns: ["file_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_metric_values: {
        Row: {
          id: string
          metric_id: string
          note: string | null
          period: string
          recorded_at: string
          recorded_by: string | null
          value: number | null
        }
        Insert: {
          id?: string
          metric_id: string
          note?: string | null
          period: string
          recorded_at?: string
          recorded_by?: string | null
          value?: number | null
        }
        Update: {
          id?: string
          metric_id?: string
          note?: string | null
          period?: string
          recorded_at?: string
          recorded_by?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_metric_values_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "impact_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_metric_values_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_metrics: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_public: boolean
          name: string
          programme_id: string | null
          provenance: Json
          published_at: string | null
          reporting_scope: string | null
          slug: string
          status: Database["public"]["Enums"]["metric_status"]
          unit: Database["public"]["Enums"]["metric_unit"]
          updated_at: string
          updated_by: string | null
          verified_at: string | null
          verified_by: string | null
          world: Database["public"]["Enums"]["world"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_public?: boolean
          name: string
          programme_id?: string | null
          provenance?: Json
          published_at?: string | null
          reporting_scope?: string | null
          slug: string
          status?: Database["public"]["Enums"]["metric_status"]
          unit?: Database["public"]["Enums"]["metric_unit"]
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          world?: Database["public"]["Enums"]["world"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_public?: boolean
          name?: string
          programme_id?: string | null
          provenance?: Json
          published_at?: string | null
          reporting_scope?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["metric_status"]
          unit?: Database["public"]["Enums"]["metric_unit"]
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          world?: Database["public"]["Enums"]["world"] | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_metrics_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_metrics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_metrics_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_metrics_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_metrics_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string
          bucket: string
          caption: string | null
          collection_id: string | null
          created_at: string
          filename: string
          height: number | null
          id: string
          mime_type: string
          path: string
          size_bytes: number | null
          source_credit: string | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text: string
          bucket: string
          caption?: string | null
          collection_id?: string | null
          created_at?: string
          filename: string
          height?: number | null
          id?: string
          mime_type: string
          path: string
          size_bytes?: number | null
          source_credit?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string
          bucket?: string
          caption?: string | null
          collection_id?: string | null
          created_at?: string
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string
          path?: string
          size_bytes?: number | null
          source_credit?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "media_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_collections: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_collections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_usages: {
        Row: {
          created_at: string
          id: string
          media_id: string
          object_id: string
          object_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          object_id: string
          object_type: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          object_id?: string
          object_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_usages_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_programmes: {
        Row: {
          mentor_id: string
          programme_id: string
        }
        Insert: {
          mentor_id: string
          programme_id: string
        }
        Update: {
          mentor_id?: string
          programme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_programmes_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_programmes_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          availability:
            | Database["public"]["Enums"]["mentor_availability"]
            | null
          bio: string | null
          created_at: string
          created_by: string | null
          current_version: number
          expertise: string[]
          id: string
          initials: string
          is_public: boolean
          locale: string
          name: string
          photo_media_id: string | null
          provenance: Json
          published_at: string | null
          reviewer_id: string | null
          role: string | null
          scheduled_at: string | null
          sector: string | null
          site: Database["public"]["Enums"]["site_id"]
          status_content: Database["public"]["Enums"]["content_status"]
          submitted_at: string | null
          translation_of: string | null
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          availability?:
            | Database["public"]["Enums"]["mentor_availability"]
            | null
          bio?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          expertise?: string[]
          id?: string
          initials: string
          is_public?: boolean
          locale?: string
          name: string
          photo_media_id?: string | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          role?: string | null
          scheduled_at?: string | null
          sector?: string | null
          site?: Database["public"]["Enums"]["site_id"]
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          availability?:
            | Database["public"]["Enums"]["mentor_availability"]
            | null
          bio?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          expertise?: string[]
          id?: string
          initials?: string
          is_public?: boolean
          locale?: string
          name?: string
          photo_media_id?: string | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          role?: string | null
          scheduled_at?: string | null
          sector?: string | null
          site?: Database["public"]["Enums"]["site_id"]
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "mentors_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_photo_media_id_fkey"
            columns: ["photo_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_evidence: {
        Row: {
          added_by: string | null
          created_at: string
          evidence_id: string
          metric_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          evidence_id: string
          metric_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          evidence_id?: string
          metric_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_evidence_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_evidence_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_evidence_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "impact_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          area: string
          created_at: string
          created_by: string | null
          cross_site: boolean
          footer_column: number | null
          footer_heading: string | null
          href: string
          id: string
          is_live: boolean
          label: string
          parent_id: string | null
          site: Database["public"]["Enums"]["site_id"]
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area: string
          created_at?: string
          created_by?: string | null
          cross_site?: boolean
          footer_column?: number | null
          footer_heading?: string | null
          href: string
          id?: string
          is_live?: boolean
          label: string
          parent_id?: string | null
          site: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area?: string
          created_at?: string
          created_by?: string | null
          cross_site?: boolean
          footer_column?: number | null
          footer_heading?: string | null
          href?: string
          id?: string
          is_live?: boolean
          label?: string
          parent_id?: string | null
          site?: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          category: Database["public"]["Enums"]["opportunity_category"]
          code: string | null
          created_at: string
          created_by: string | null
          current_version: number
          deadline: string | null
          eligibility: string | null
          external_url: string | null
          id: string
          is_public: boolean
          locale: string
          opens_at: string | null
          provenance: Json
          published_at: string | null
          reviewer_id: string | null
          scheduled_at: string | null
          seo: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status: Database["public"]["Enums"]["opportunity_status"]
          status_content: Database["public"]["Enums"]["content_status"]
          submitted_at: string | null
          title: string
          translation_of: string | null
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          category?: Database["public"]["Enums"]["opportunity_category"]
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          deadline?: string | null
          eligibility?: string | null
          external_url?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          opens_at?: string | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          category?: Database["public"]["Enums"]["opportunity_category"]
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          deadline?: string | null
          eligibility?: string | null
          external_url?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          opens_at?: string | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug?: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title?: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          current_version: number
          id: string
          is_public: boolean
          locale: string
          path: string
          provenance: Json
          published_at: string | null
          reviewer_id: string | null
          scheduled_at: string | null
          sections: Json
          seo: Json
          site: Database["public"]["Enums"]["site_id"]
          status: Database["public"]["Enums"]["content_status"]
          submitted_at: string | null
          title: string
          translation_of: string | null
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          id?: string
          is_public?: boolean
          locale?: string
          path: string
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          sections?: Json
          seo?: Json
          site: Database["public"]["Enums"]["site_id"]
          status?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          id?: string
          is_public?: boolean
          locale?: string
          path?: string
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          sections?: Json
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          status?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title?: string
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"] | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_placements: {
        Row: {
          context: string
          created_at: string
          featured: boolean
          id: string
          is_public: boolean
          partner_id: string
          site: Database["public"]["Enums"]["site_id"]
          sort_order: number
          updated_at: string
        }
        Insert: {
          context: string
          created_at?: string
          featured?: boolean
          id?: string
          is_public?: boolean
          partner_id: string
          site: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          context?: string
          created_at?: string
          featured?: boolean
          id?: string
          is_public?: boolean
          partner_id?: string
          site?: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_placements_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          category: Database["public"]["Enums"]["partner_category"]
          consent_recorded: boolean
          created_at: string
          created_by: string | null
          current_version: number
          id: string
          logo_media_id: string | null
          name: string
          provenance: Json
          published_at: string | null
          relationship: string | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["partner_category"]
          consent_recorded?: boolean
          created_at?: string
          created_by?: string | null
          current_version?: number
          id?: string
          logo_media_id?: string | null
          name: string
          provenance?: Json
          published_at?: string | null
          relationship?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["partner_category"]
          consent_recorded?: boolean
          created_at?: string
          created_by?: string | null
          current_version?: number
          id?: string
          logo_media_id?: string | null
          name?: string
          provenance?: Json
          published_at?: string | null
          relationship?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          bio: string | null
          created_at: string
          created_by: string | null
          current_version: number
          division: string | null
          id: string
          initials: string
          links: Json
          name: string
          photo_media_id: string | null
          position: string | null
          provenance: Json
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          division?: string | null
          id?: string
          initials?: string
          links?: Json
          name: string
          photo_media_id?: string | null
          position?: string | null
          provenance?: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          division?: string | null
          id?: string
          initials?: string
          links?: Json
          name?: string
          photo_media_id?: string | null
          position?: string | null
          provenance?: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_photo_media_id_fkey"
            columns: ["photo_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      person_placements: {
        Row: {
          context: string
          created_at: string
          id: string
          is_public: boolean
          person_id: string
          site: Database["public"]["Enums"]["site_id"]
          sort_order: number
        }
        Insert: {
          context: string
          created_at?: string
          id?: string
          is_public?: boolean
          person_id: string
          site: Database["public"]["Enums"]["site_id"]
          sort_order?: number
        }
        Update: {
          context?: string
          created_at?: string
          id?: string
          is_public?: boolean
          person_id?: string
          site?: Database["public"]["Enums"]["site_id"]
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "person_placements_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          last_active_at: string | null
          role_key: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          email: string
          id: string
          last_active_at?: string | null
          role_key?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          last_active_at?: string | null
          role_key?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      programmes: {
        Row: {
          application_deadline: string | null
          application_open: boolean
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          body: Json
          certification: string | null
          code: string | null
          created_at: string
          created_by: string | null
          current_version: number
          delivery_mode: string | null
          duration: string | null
          hero_media_id: string | null
          id: string
          is_public: boolean
          locale: string
          location: string | null
          name: string
          places: number | null
          provenance: Json
          published_at: string | null
          reviewer_id: string | null
          scheduled_at: string | null
          seo: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status: Database["public"]["Enums"]["programme_status"]
          status_content: Database["public"]["Enums"]["content_status"]
          submitted_at: string | null
          summary: string
          translation_of: string | null
          type: string | null
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          application_deadline?: string | null
          application_open?: boolean
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          certification?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          delivery_mode?: string | null
          duration?: string | null
          hero_media_id?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          location?: string | null
          name: string
          places?: number | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status?: Database["public"]["Enums"]["programme_status"]
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          summary?: string
          translation_of?: string | null
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Update: {
          application_deadline?: string | null
          application_open?: boolean
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          certification?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          delivery_mode?: string | null
          duration?: string | null
          hero_media_id?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          location?: string | null
          name?: string
          places?: number | null
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug?: string
          status?: Database["public"]["Enums"]["programme_status"]
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          summary?: string
          translation_of?: string | null
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "programmes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programmes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programmes_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programmes_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programmes_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programmes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: string[]
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          body: Json
          capacity: number | null
          code: string | null
          created_at: string
          created_by: string | null
          current_version: number
          external_booking_url: string | null
          id: string
          is_public: boolean
          locale: string
          location: string | null
          name: string
          provenance: Json
          published_at: string | null
          reviewer_id: string | null
          scheduled_at: string | null
          seo: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status_content: Database["public"]["Enums"]["content_status"]
          submitted_at: string | null
          summary: string
          translation_of: string | null
          type: string | null
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          amenities?: string[]
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          capacity?: number | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          external_booking_url?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          location?: string | null
          name: string
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug: string
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          summary?: string
          translation_of?: string | null
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Update: {
          amenities?: string[]
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          capacity?: number | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          external_booking_url?: string | null
          id?: string
          is_public?: boolean
          locale?: string
          location?: string | null
          name?: string
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug?: string
          status_content?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          summary?: string
          translation_of?: string | null
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "properties_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          media_id: string
          position: number
          property_id: string
        }
        Insert: {
          media_id: string
          position?: number
          property_id: string
        }
        Update: {
          media_id?: string
          position?: number
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          area: Database["public"]["Enums"]["permission_area"]
          level: Database["public"]["Enums"]["permission_level"]
          role_key: string
        }
        Insert: {
          area: Database["public"]["Enums"]["permission_area"]
          level: Database["public"]["Enums"]["permission_level"]
          role_key: string
        }
        Update: {
          area?: Database["public"]["Enums"]["permission_area"]
          level?: Database["public"]["Enums"]["permission_level"]
          role_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          description?: string
          key: string
          label: string
        }
        Update: {
          created_at?: string
          description?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      site_home_sections: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_live: boolean
          key: string
          site: Database["public"]["Enums"]["site_id"]
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_live?: boolean
          key: string
          site: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_live?: boolean
          key?: string
          site?: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_home_sections_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string
          default_seo: Json
          name: string
          navigation_pending_confirmation: boolean
          provenance: Json
          site: Database["public"]["Enums"]["site_id"]
          social: Json
          tagline: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          default_seo?: Json
          name: string
          navigation_pending_confirmation?: boolean
          provenance?: Json
          site: Database["public"]["Enums"]["site_id"]
          social?: Json
          tagline?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          default_seo?: Json
          name?: string
          navigation_pending_confirmation?: boolean
          provenance?: Json
          site?: Database["public"]["Enums"]["site_id"]
          social?: Json
          tagline?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          body: Json
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          current_version: number
          excerpt: string
          id: string
          is_public: boolean
          locale: string
          provenance: Json
          published_at: string | null
          reviewer_id: string | null
          scheduled_at: string | null
          seo: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          submitted_at: string | null
          title: string
          translation_of: string | null
          type: Database["public"]["Enums"]["story_type"]
          updated_at: string
          updated_by: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          excerpt?: string
          id?: string
          is_public?: boolean
          locale?: string
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site: Database["public"]["Enums"]["site_id"]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title: string
          translation_of?: string | null
          type: Database["public"]["Enums"]["story_type"]
          updated_at?: string
          updated_by?: string | null
          world: Database["public"]["Enums"]["world"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          body?: Json
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          excerpt?: string
          id?: string
          is_public?: boolean
          locale?: string
          provenance?: Json
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_at?: string | null
          seo?: Json
          site?: Database["public"]["Enums"]["site_id"]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          submitted_at?: string | null
          title?: string
          translation_of?: string | null
          type?: Database["public"]["Enums"]["story_type"]
          updated_at?: string
          updated_by?: string | null
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "stories_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_attempts: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
          kind: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash: string
          kind: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
          kind?: string
        }
        Relationships: []
      }
      submission_counters: {
        Row: {
          kind: string
          last: number
          site: Database["public"]["Enums"]["site_id"]
          year: number
        }
        Insert: {
          kind: string
          last?: number
          site: Database["public"]["Enums"]["site_id"]
          year: number
        }
        Update: {
          kind?: string
          last?: number
          site?: Database["public"]["Enums"]["site_id"]
          year?: number
        }
        Relationships: []
      }
      user_site_scopes: {
        Row: {
          created_at: string
          id: string
          site: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          site: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          site?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_site_scopes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venture_placements: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          listing_status: Database["public"]["Enums"]["listing_status"]
          site: Database["public"]["Enums"]["site_id"]
          sort_order: number
          updated_at: string
          venture_id: string
          world: Database["public"]["Enums"]["world"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          listing_status?: Database["public"]["Enums"]["listing_status"]
          site: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
          venture_id: string
          world: Database["public"]["Enums"]["world"]
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          listing_status?: Database["public"]["Enums"]["listing_status"]
          site?: Database["public"]["Enums"]["site_id"]
          sort_order?: number
          updated_at?: string
          venture_id?: string
          world?: Database["public"]["Enums"]["world"]
        }
        Relationships: [
          {
            foreignKeyName: "venture_placements_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      ventures: {
        Row: {
          body: Json
          code: string | null
          created_at: string
          created_by: string | null
          current_version: number
          description: string
          id: string
          locale: string
          location: string | null
          logo_media_id: string | null
          name: string
          provenance: Json
          published_at: string | null
          related_programme_id: string | null
          sector: string | null
          seo: Json
          slug: string
          stage: string | null
          status: Database["public"]["Enums"]["content_status"]
          translation_of: string | null
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          body?: Json
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string
          id?: string
          locale?: string
          location?: string | null
          logo_media_id?: string | null
          name: string
          provenance?: Json
          published_at?: string | null
          related_programme_id?: string | null
          sector?: string | null
          seo?: Json
          slug: string
          stage?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          body?: Json
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string
          id?: string
          locale?: string
          location?: string | null
          logo_media_id?: string | null
          name?: string
          provenance?: Json
          published_at?: string | null
          related_programme_id?: string | null
          sector?: string | null
          seo?: Json
          slug?: string
          stage?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          translation_of?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventures_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventures_related_programme_id_fkey"
            columns: ["related_programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventures_translation_of_fkey"
            columns: ["translation_of"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventures_updated_by_fkey"
            columns: ["updated_by"]
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
      confirm_application_document: {
        Args: { p_document_id: string }
        Returns: undefined
      }
      register_application_document: {
        Args: {
          p_application_id: string
          p_file_name: string
          p_mime_type: string
          p_size_bytes: number
        }
        Returns: {
          document_id: string
          storage_path: string
        }[]
      }
      submit_application: {
        Args: {
          p_age_band?: string
          p_city_region?: string
          p_consents?: Json
          p_education_level?: string
          p_email: string
          p_full_name: string
          p_honeypot?: string
          p_ip?: string
          p_motivation: string
          p_occupation?: string
          p_opportunity_id?: string
          p_phone?: string
          p_plans?: string
          p_preferred_cluster_id?: string
          p_programme_id?: string
          p_secondary_interests?: string[]
          p_site: Database["public"]["Enums"]["site_id"]
          p_source_host?: string
          p_source_url?: string
        }
        Returns: {
          id: string
          reference: string
        }[]
      }
      submit_enquiry: {
        Args: {
          p_category: string
          p_email: string
          p_honeypot?: string
          p_ip?: string
          p_message: string
          p_name: string
          p_organization?: string
          p_programme_id?: string
          p_property_id?: string
          p_site: Database["public"]["Enums"]["site_id"]
          p_source_host?: string
          p_source_page?: string
          p_source_url?: string
        }
        Returns: {
          id: string
          reference: string
        }[]
      }
    }
    Enums: {
      application_status:
        | "new"
        | "under_review"
        | "shortlisted"
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "archived"
      content_status:
        | "draft"
        | "in_review"
        | "changes_requested"
        | "approved"
        | "scheduled"
        | "published"
        | "archived"
      enquiry_status:
        | "new"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "archived"
      evidence_type:
        | "report"
        | "document"
        | "dataset"
        | "photo"
        | "letter"
        | "other"
      listing_status: "pipeline" | "active" | "alumni" | "exited"
      mentor_availability: "open" | "limited" | "by_request"
      metric_status:
        | "draft"
        | "needs_verification"
        | "verified"
        | "approved"
        | "published"
      metric_unit:
        | "people"
        | "enterprises"
        | "certificates"
        | "percent"
        | "ventures"
        | "partnerships"
        | "count"
      opportunity_category:
        | "residency"
        | "grant"
        | "programme"
        | "competition"
        | "other"
      opportunity_status: "open" | "closing_soon" | "upcoming" | "expired"
      partner_category:
        | "university"
        | "corporate"
        | "development"
        | "government"
        | "investor"
        | "community"
      permission_area:
        | "pages"
        | "articles"
        | "stories"
        | "media"
        | "programmes"
        | "applications"
        | "people"
        | "partners"
        | "ventures"
        | "properties"
        | "impact_metrics"
        | "evidence"
        | "site_config"
        | "enquiries"
        | "users"
        | "roles"
        | "audit_log"
        | "settings"
      permission_level: "none" | "view" | "review" | "full"
      programme_status:
        | "open"
        | "closing_soon"
        | "upcoming"
        | "closed"
        | "pilot"
        | "under_development"
      site_id: "corporate" | "vti" | "startup"
      story_type: "beneficiary" | "enterprise" | "cohort"
      world: "corporate" | "vti" | "startup" | "venture_capital" | "hospitality"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      application_status: [
        "new",
        "under_review",
        "shortlisted",
        "accepted",
        "rejected",
        "withdrawn",
        "archived",
      ],
      content_status: [
        "draft",
        "in_review",
        "changes_requested",
        "approved",
        "scheduled",
        "published",
        "archived",
      ],
      enquiry_status: [
        "new",
        "assigned",
        "in_progress",
        "resolved",
        "archived",
      ],
      evidence_type: [
        "report",
        "document",
        "dataset",
        "photo",
        "letter",
        "other",
      ],
      listing_status: ["pipeline", "active", "alumni", "exited"],
      mentor_availability: ["open", "limited", "by_request"],
      metric_status: [
        "draft",
        "needs_verification",
        "verified",
        "approved",
        "published",
      ],
      metric_unit: [
        "people",
        "enterprises",
        "certificates",
        "percent",
        "ventures",
        "partnerships",
        "count",
      ],
      opportunity_category: [
        "residency",
        "grant",
        "programme",
        "competition",
        "other",
      ],
      opportunity_status: ["open", "closing_soon", "upcoming", "expired"],
      partner_category: [
        "university",
        "corporate",
        "development",
        "government",
        "investor",
        "community",
      ],
      permission_area: [
        "pages",
        "articles",
        "stories",
        "media",
        "programmes",
        "applications",
        "people",
        "partners",
        "ventures",
        "properties",
        "impact_metrics",
        "evidence",
        "site_config",
        "enquiries",
        "users",
        "roles",
        "audit_log",
        "settings",
      ],
      permission_level: ["none", "view", "review", "full"],
      programme_status: [
        "open",
        "closing_soon",
        "upcoming",
        "closed",
        "pilot",
        "under_development",
      ],
      site_id: ["corporate", "vti", "startup"],
      story_type: ["beneficiary", "enterprise", "cohort"],
      world: ["corporate", "vti", "startup", "venture_capital", "hospitality"],
    },
  },
} as const
