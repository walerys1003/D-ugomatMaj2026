/**
 * Hand-curated `Database` type for Długomat.
 * Once we wire `supabase gen types typescript` (Tier 5 / DevOps) this file
 * will be regenerated; the manual definition below is the source of truth
 * during Tier 2-4 development.
 *
 * Mirrors:
 *   supabase/migrations/2026051013{0000..1200}_*.sql
 *
 * Convention:
 *   - Row     = SELECT shape
 *   - Insert  = required fields for INSERT
 *   - Update  = Partial<Insert>
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export type CaseType =
  | "sprzeciw_epu"
  | "komornik_zwolnienie_konta"
  | "komornik_zwolnienie_swiadczen"
  | "komornik_skarga"
  | "komornik_ograniczenie"
  | "komornik_umorzenie"
  | "komornik_raty"
  | "potracenia_wniosek_pracodawca"
  | "potracenia_wniosek_komornik"
  | "bik_reklamacja_bank"
  | "bik_reklamacja_bik"
  | "bik_skarga_uodo"
  | "cesja_odpowiedz"
  | "ugoda_raty"
  | "ugoda_umorzenie"
  | "ugoda_propozycja"
  | "upadlosc_wniosek"
  // Tier 7 zad. 301-308 — D9..D16 expansion
  | "upadlosc_pelny_wniosek"
  | "pozew_zwrot_oplat_windykacyjnych"
  | "reklamacja_bank_rf"
  | "skarga_puodo"
  | "wniosek_raty_sadowe"
  | "wniosek_zwolnienie_kosztow_sadowych"
  | "zazalenie_klauzula_wykonalnosci"
  | "pozbawienie_tytulu_wykonalnosci";

export type CaseStatus =
  | "draft"
  | "analysis"
  | "generated"
  | "paid"
  | "downloaded"
  | "completed"
  | "archived";

export type DocumentStatus =
  | "generating"
  | "generated"
  | "validated"
  | "paid"
  | "downloaded"
  | "expired";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "expired";

export type NotificationChannel = "email" | "sms" | "push";
export type NotificationStatus = "scheduled" | "sent" | "failed" | "cancelled";
export type EventActor = "user" | "system" | "ai" | "payment" | "admin";
export type UserRole = "user" | "admin" | "moderator";
export type DeadlineKind =
  | "sprzeciw_14dni"
  | "skarga_komornicza_7dni"
  | "skarga_uodo_30dni"
  | "reklamacja_30dni"
  | "odpowiedz_cesja_14dni"
  | "wniosek_raty"
  | "wniosek_upadlosc"
  // Tier 7 expansion
  | "reklamacja_bank_30dni"
  | "puodo_30dni"
  | "zazalenie_7dni"
  | "powodztwo_przeciwegzekucyjne"
  | "custom";

// -----------------------------------------------------------------------------
// Wizard state — persisted on cases.wizard_state
// -----------------------------------------------------------------------------
export interface WizardState {
  current_step: string;
  completed_steps: string[];
  answers: Record<string, Json>;
  last_saved_at: string | null;
}

// -----------------------------------------------------------------------------
// Database
// -----------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      // -----------------------------------------------------------------
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          locale: string;
          marketing_opt_in: boolean;
          role: UserRole;
          avatar_url: string | null;
          onboarding_completed: boolean;
          settings: Json;
          /** Referral attribution — kod polecającego, ustawiany w callback OAuth. */
          referred_by_code: string | null;
          /** Vlasny kod referral usera (do udostępniania). */
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          locale?: string;
          marketing_opt_in?: boolean;
          role?: UserRole;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          settings?: Json;
          referred_by_code?: string | null;
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      cases: {
        Row: {
          id: string;
          user_id: string;
          type: CaseType;
          status: CaseStatus;
          title: string;
          sygnatura: string | null;
          sad: string | null;
          data_nakazu: string | null;
          data_doreczenia: string | null;
          powod_nazwa: string | null;
          powod_adres: string | null;
          pozwany_nazwa: string | null;
          pozwany_adres: string | null;
          pozwany_pesel_enc: string | null;
          kwota_glowna: number | null;
          kwota_odsetki: number | null;
          kwota_koszty: number | null;
          kwota_razem: number | null;
          metadata: Json;
          wizard_state: WizardState;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: CaseType;
          status?: CaseStatus;
          title?: string;
          sygnatura?: string | null;
          sad?: string | null;
          data_nakazu?: string | null;
          data_doreczenia?: string | null;
          powod_nazwa?: string | null;
          powod_adres?: string | null;
          pozwany_nazwa?: string | null;
          pozwany_adres?: string | null;
          pozwany_pesel_enc?: string | null;
          kwota_glowna?: number | null;
          kwota_odsetki?: number | null;
          kwota_koszty?: number | null;
          metadata?: Json;
          wizard_state?: WizardState;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      documents: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          type: CaseType;
          status: DocumentStatus;
          content_markdown: string | null;
          content_html: string | null;
          pdf_url: string | null;
          version: number;
          is_template: boolean;
          ai_model_used: string | null;
          tokens_input: number | null;
          tokens_output: number | null;
          ai_cost_usd: number | null;
          generation_time_ms: number | null;
          validation_score: number | null;
          validation_issues: Json;
          prompt_hash: string | null;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
          downloaded_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          type: CaseType;
          status?: DocumentStatus;
          content_markdown?: string | null;
          content_html?: string | null;
          pdf_url?: string | null;
          version?: number;
          is_template?: boolean;
          ai_model_used?: string | null;
          tokens_input?: number | null;
          tokens_output?: number | null;
          ai_cost_usd?: number | null;
          generation_time_ms?: number | null;
          validation_score?: number | null;
          validation_issues?: Json;
          prompt_hash?: string | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          downloaded_at?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version_number: number;
          content_markdown: string;
          changed_by: EventActor;
          change_summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          version_number: number;
          content_markdown: string;
          changed_by?: EventActor;
          change_summary?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["document_versions"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      deadlines: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          kind: DeadlineKind;
          description: string;
          start_date: string;
          deadline_date: string;
          notif_d7_sent: boolean;
          notif_d5_sent: boolean;
          notif_d3_sent: boolean;
          notif_d1_sent: boolean;
          notif_d0_morning_sent: boolean;
          notif_d0_evening_sent: boolean;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          kind: DeadlineKind;
          description: string;
          start_date: string;
          deadline_date: string;
          notif_d7_sent?: boolean;
          notif_d5_sent?: boolean;
          notif_d3_sent?: boolean;
          notif_d1_sent?: boolean;
          notif_d0_morning_sent?: boolean;
          notif_d0_evening_sent?: boolean;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deadlines"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      ocr_results: {
        Row: {
          id: string;
          case_id: string | null;
          user_id: string;
          original_filename: string;
          file_url: string;
          file_size_bytes: number;
          mime_type: string;
          raw_text: string | null;
          extracted_data: Json;
          confidence: number | null;
          provider: "tesseract" | "textract";
          processing_time_ms: number | null;
          status: "pending" | "processing" | "completed" | "failed";
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id?: string | null;
          user_id: string;
          original_filename: string;
          file_url: string;
          file_size_bytes: number;
          mime_type: string;
          raw_text?: string | null;
          extracted_data?: Json;
          confidence?: number | null;
          provider?: "tesseract" | "textract";
          processing_time_ms?: number | null;
          status?: "pending" | "processing" | "completed" | "failed";
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ocr_results"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      payments: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          document_id: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_customer_id: string | null;
          amount: number;
          currency: string;
          vat_rate: number;
          vat_amount: number;
          product_type: string;
          product_name: string;
          customer_type: "b2c" | "b2b";
          invoice_company_name: string | null;
          invoice_nip: string | null;
          invoice_address: string | null;
          fakturownia_invoice_id: number | null;
          fakturownia_invoice_number: string | null;
          fakturownia_invoice_url: string | null;
          status: PaymentStatus;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
          refunded_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          user_id: string;
          amount: number;
          product_type: string;
          product_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      notifications: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          deadline_id: string | null;
          channel: NotificationChannel;
          template: string;
          status: NotificationStatus;
          recipient: string;
          subject: string | null;
          body_text: string | null;
          body_html: string | null;
          provider: string | null;
          provider_message_id: string | null;
          provider_response: Json | null;
          scheduled_for: string | null;
          sent_at: string | null;
          failed_at: string | null;
          failure_reason: string | null;
          retry_count: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          user_id: string;
          channel: NotificationChannel;
          template: string;
          recipient: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      case_events: {
        Row: {
          id: string;
          case_id: string;
          user_id: string | null;
          event_type: string;
          actor: EventActor;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id?: string | null;
          event_type: string;
          actor?: EventActor;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["case_events"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      legal_knowledge: {
        Row: {
          id: string;
          category: string;
          subcategory: string | null;
          title: string;
          content: string;
          source: string;
          source_url: string | null;
          effective_date: string | null;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["legal_knowledge"]["Row"]> & {
          category: string;
          title: string;
          content: string;
          source: string;
        };
        Update: Partial<Database["public"]["Tables"]["legal_knowledge"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      prompt_templates: {
        Row: {
          id: string;
          case_type: CaseType;
          variant: string;
          version: number;
          system_prompt: string;
          user_prompt_template: string;
          required_variables: string[];
          model: string;
          temperature: number;
          max_tokens: number;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["prompt_templates"]["Row"]> & {
          case_type: CaseType;
          system_prompt: string;
          user_prompt_template: string;
        };
        Update: Partial<Database["public"]["Tables"]["prompt_templates"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      validation_runs: {
        Row: {
          id: string;
          document_id: string;
          case_id: string;
          user_id: string;
          model: string;
          pass: boolean;
          score: number;
          issues: Json;
          raw_response: Json | null;
          tokens_input: number | null;
          tokens_output: number | null;
          cost_usd: number | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["validation_runs"]["Row"]> & {
          document_id: string;
          case_id: string;
          user_id: string;
          pass: boolean;
          score: number;
        };
        Update: Partial<Database["public"]["Tables"]["validation_runs"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount_pct: number | null;
          discount_grosze: number | null;
          max_uses: number | null;
          per_user_limit: number;
          current_uses: number;
          valid_from: string;
          valid_to: string | null;
          applies_to_case_types: CaseType[] | null;
          applies_to_bundle_ids: string[] | null;
          min_amount_grosze: number;
          campaign: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["promo_codes"]["Row"]> & {
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["promo_codes"]["Insert"]>;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      promo_redemptions: {
        Row: {
          id: string;
          promo_code_id: string;
          user_id: string;
          payment_id: string;
          original_amount_grosze: number;
          discount_grosze: number;
          final_amount_grosze: number;
          redeemed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["promo_redemptions"]["Row"]> & {
          promo_code_id: string;
          user_id: string;
          payment_id: string;
          original_amount_grosze: number;
          discount_grosze: number;
          final_amount_grosze: number;
        };
        Update: Partial<Database["public"]["Tables"]["promo_redemptions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      case_type: CaseType;
      case_status: CaseStatus;
      document_status: DocumentStatus;
      payment_status: PaymentStatus;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      event_actor: EventActor;
      user_role: UserRole;
      deadline_kind: DeadlineKind;
    };
    CompositeTypes: Record<string, never>;
  };
}

// -----------------------------------------------------------------------------
// Convenience aliases used across the app
// -----------------------------------------------------------------------------
type T = Database["public"]["Tables"];
export type Profile        = T["profiles"]["Row"];
export type CaseRow        = T["cases"]["Row"];
export type CaseInsert     = T["cases"]["Insert"];
export type CaseUpdate     = T["cases"]["Update"];
export type DocumentRow    = T["documents"]["Row"];
export type DeadlineRow    = T["deadlines"]["Row"];
export type DeadlineInsert = T["deadlines"]["Insert"];
export type OcrResultRow   = T["ocr_results"]["Row"];
export type PaymentRow     = T["payments"]["Row"];
export type NotificationRow = T["notifications"]["Row"];
export type CaseEventRow    = T["case_events"]["Row"];
export type LegalKnowledgeRow = T["legal_knowledge"]["Row"];
export type PromptTemplateRow = T["prompt_templates"]["Row"];
export type ValidationRunRow  = T["validation_runs"]["Row"];
export type PromoCodeRow       = T["promo_codes"]["Row"];
export type PromoCodeInsert    = T["promo_codes"]["Insert"];
export type PromoRedemptionRow = T["promo_redemptions"]["Row"];
export type PromoRedemptionInsert = T["promo_redemptions"]["Insert"];
