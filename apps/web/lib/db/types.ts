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
          // Audyt 2026-06-27 (iter. 7): kolumny dla bulk-ops (migracja
          // 20260627050000_audit_bulk_ops_missing_columns.sql).
          archived_at: string | null;
          purge_at: string | null;
          tags: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          type: CaseType;
          status?: CaseStatus;
          archived_at?: string | null;
          purge_at?: string | null;
          tags?: string[];
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
          // Audyt 2026-06-27 (iter. 7): bulk documents.tag.
          tags: string[];
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          type: CaseType;
          status?: DocumentStatus;
          tags?: string[];
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
      // Audyt 2026-06-27: schemat ujednolicony do wersji Tier 18 (zgodnej z
      // lib/deadlines/deadline-tracker.ts) — migracja
      // 20260627030000_audit_reconcile_deadlines_schema.sql. `kind` to text
      // CHECK po stronie DB, więc tu modelujemy go jako string.
      deadlines: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          kind: string;
          title: string;
          start_date: string;
          end_date: string;
          effective_end_date: string;
          legal_basis: string | null;
          snoozed_until: string | null;
          completed_at: string | null;
          reminders_sent: string[];
          created_at: string;
          // Audyt 2026-06-27 (iter. 7): bulk deadlines.reassign.
          assignee_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          case_id?: string | null;
          kind: string;
          title: string;
          start_date: string;
          end_date: string;
          effective_end_date: string;
          legal_basis?: string | null;
          snoozed_until?: string | null;
          completed_at?: string | null;
          reminders_sent?: string[];
          created_at?: string;
          assignee_id?: string | null;
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
      // Audyt #6 — typy dodane ręcznie z kanonicznych migracji, aby usunąć
      // `as any` w warstwie płatności. Źródło prawdy:
      //   subscriptions → 20260522000000_tier19_rag_payments_ux.sql
      //   refunds       → 20260510190000_refunds.sql
      // Docelowo zastąpione przez `npm run gen:types` (patrz docs/audit).
      // Audyt 2026-06-27: SUPERSET schematu Tier 8 (plan_id/cycle/tenant_id) +
      // Tier 19 (plan_code/org_id/paused_*) — patrz migracja
      // 20260627040000_audit_reconcile_subscriptions_schema.sql. Oba zestawy
      // kolumn są opcjonalne (nullable), bo żywa tabela powstała z jednego z
      // dwóch sprzecznych `create table if not exists`, a superset dopełnia
      // brakujące kolumny. `status` modelowany szeroko (text), bo dwie wersje
      // miały różne CHECK-i.
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          // Tier 19
          org_id: string | null;
          plan_code:
            | "free" | "lite" | "pro" | "business" | "enterprise" | null;
          paused_at: string | null;
          paused_until: string | null;
          past_due_retries: number;
          pending_plan_change: string | null;
          pending_effective_at: string | null;
          metadata: Json;
          // Tier 8
          plan_id:
            | "free" | "starter" | "pro" | "family" | "company" | null;
          cycle: "monthly" | "annual" | null;
          tenant_id: string | null;
          // Wspólne
          status: string;
          trial_end: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          user_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      subscription_usage: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          period_end: string;
          cases_created: number;
          ai_generations: number;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["subscription_usage"]["Row"]
        > & {
          user_id: string;
          period_start: string;
          period_end: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["subscription_usage"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      refunds: {
        Row: {
          id: string;
          payment_id: string;
          user_id: string;
          stripe_refund_id: string | null;
          stripe_payment_intent_id: string;
          amount: number;
          currency: string;
          reason: string | null;
          internal_note: string | null;
          status: "pending" | "succeeded" | "failed" | "canceled";
          initiated_by_admin_id: string | null;
          created_at: string;
          updated_at: string;
          succeeded_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["refunds"]["Row"]> & {
          payment_id: string;
          user_id: string;
          stripe_payment_intent_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["refunds"]["Insert"]>;
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
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 7): rodziny affiliate_* + subscription_coupons
      // Źródło: 20260513100000_tier8_pricing_affiliate_growth.sql (jedno źródło
      // prawdy, brak kolizji). Dodane ręcznie, by usunąć `as any`.
      // -----------------------------------------------------------------
      affiliate_accounts: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          display_name: string;
          payout_email: string;
          commission_first_payment_pct: number;
          commission_recurring_pct: number;
          commission_recurring_months: number;
          status: "pending" | "active" | "suspended";
          payout_method: string | null;
          payout_details: Json | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["affiliate_accounts"]["Row"]
        > & {
          user_id: string;
          slug: string;
          display_name: string;
          payout_email: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["affiliate_accounts"]["Insert"]
        >;
        Relationships: [];
      };
      affiliate_clicks: {
        Row: {
          id: string;
          affiliate_id: string;
          slug: string;
          ip_hash: string | null;
          user_agent: string | null;
          referer: string | null;
          landing_path: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["affiliate_clicks"]["Row"]
        > & {
          affiliate_id: string;
          slug: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["affiliate_clicks"]["Insert"]
        >;
        Relationships: [];
      };
      affiliate_referrals: {
        Row: {
          id: string;
          affiliate_id: string;
          user_id: string;
          status: "signed_up" | "converted" | "expired";
          attributed_at: string;
          attribution_expires_at: string;
          converted_at: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["affiliate_referrals"]["Row"]
        > & {
          affiliate_id: string;
          user_id: string;
          attribution_expires_at: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["affiliate_referrals"]["Insert"]
        >;
        Relationships: [];
      };
      affiliate_commissions: {
        Row: {
          id: string;
          affiliate_id: string;
          referral_id: string;
          user_id: string;
          payment_id: string | null;
          amount_grosze: number;
          commission_pct: number;
          is_first_payment: boolean;
          status: "pending" | "paid" | "cancelled" | "reversed";
          payout_id: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["affiliate_commissions"]["Row"]
        > & {
          affiliate_id: string;
          referral_id: string;
          user_id: string;
          amount_grosze: number;
          commission_pct: number;
          is_first_payment: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["affiliate_commissions"]["Insert"]
        >;
        Relationships: [];
      };
      affiliate_payouts: {
        Row: {
          id: string;
          affiliate_id: string;
          amount_grosze: number;
          period_end: string;
          status: "pending" | "transferred" | "failed";
          commission_count: number;
          external_ref: string | null;
          transferred_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["affiliate_payouts"]["Row"]
        > & {
          affiliate_id: string;
          amount_grosze: number;
          period_end: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["affiliate_payouts"]["Insert"]
        >;
        Relationships: [];
      };
      subscription_coupons: {
        Row: {
          id: string;
          code: string;
          stripe_coupon_id: string;
          stripe_promotion_code_id: string;
          discount_pct: number | null;
          discount_grosze: number | null;
          duration: "once" | "repeating" | "forever";
          duration_in_months: number | null;
          max_redemptions: number | null;
          current_redemptions: number;
          applies_to_plans: string[] | null;
          valid_until: string | null;
          is_active: boolean;
          campaign_label: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["subscription_coupons"]["Row"]
        > & {
          code: string;
          stripe_coupon_id: string;
          stripe_promotion_code_id: string;
          duration: "once" | "repeating" | "forever";
        };
        Update: Partial<
          Database["public"]["Tables"]["subscription_coupons"]["Insert"]
        >;
        Relationships: [];
      };
      subscription_coupon_redemptions: {
        Row: {
          id: string;
          coupon_id: string;
          user_id: string;
          subscription_id: string | null;
          redeemed_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["subscription_coupon_redemptions"]["Row"]
        > & {
          coupon_id: string;
          user_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["subscription_coupon_redemptions"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 7): bulk-ops. Źródło:
      // 20260524000000_tier21_realtime_bulk_audit.sql.
      // -----------------------------------------------------------------
      bulk_operations: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          status:
            | "pending"
            | "running"
            | "completed"
            | "completed_with_errors"
            | "canceled"
            | "failed";
          total: number;
          processed: number;
          failed: number;
          target_ids: string[];
          params: Json;
          errors: Json;
          result_url: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["bulk_operations"]["Row"]
        > & {
          user_id: string;
          kind: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["bulk_operations"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 8): referral program v2. Źródło:
      // 20260513100000_tier8_pricing_affiliate_growth.sql.
      // -----------------------------------------------------------------
      referral_codes_v2: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          uses: number;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["referral_codes_v2"]["Row"]
        > & {
          user_id: string;
          code: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["referral_codes_v2"]["Insert"]
        >;
        Relationships: [];
      };
      referral_redemptions_v2: {
        Row: {
          id: string;
          referrer_user_id: string;
          invitee_user_id: string;
          code: string;
          status: "signed_up" | "credited" | "limit_exceeded" | "expired";
          credited_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["referral_redemptions_v2"]["Row"]
        > & {
          referrer_user_id: string;
          invitee_user_id: string;
          code: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["referral_redemptions_v2"]["Insert"]
        >;
        Relationships: [];
      };
      referral_credits_v2: {
        Row: {
          id: string;
          user_id: string;
          amount_grosze: number;
          used_grosze: number;
          source_redemption_id: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["referral_credits_v2"]["Row"]
        > & {
          user_id: string;
          amount_grosze: number;
          expires_at: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["referral_credits_v2"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 8): generation queue. Źródło:
      // 20260512200000_tier7_tables.sql.
      // -----------------------------------------------------------------
      generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          kind: "generation" | "revision" | "polish" | "summary" | "ocr";
          priority: "critical" | "high" | "normal" | "low";
          priority_rank: number;
          status: "queued" | "running" | "completed" | "failed" | "cancelled";
          payload: Json;
          result: Json | null;
          error: string | null;
          attempts: number;
          max_attempts: number;
          worker_id: string | null;
          scheduled_at: string;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["generation_jobs"]["Row"]
        > & {
          user_id: string;
          case_id: string;
          kind: "generation" | "revision" | "polish" | "summary" | "ocr";
        };
        Update: Partial<
          Database["public"]["Tables"]["generation_jobs"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 8): automation (workflows). Źródło:
      // 20260525000000_tier22_agents_automation.sql.
      // -----------------------------------------------------------------
      automation_workflows: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          trigger: Json;
          conditions: Json;
          actions: Json;
          enabled: boolean;
          last_run_at: string | null;
          run_count: number;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["automation_workflows"]["Row"]
        > & {
          user_id: string;
          name: string;
          trigger: Json;
          actions: Json;
        };
        Update: Partial<
          Database["public"]["Tables"]["automation_workflows"]["Insert"]
        >;
        Relationships: [];
      };
      automation_runs: {
        Row: {
          id: string;
          workflow_id: string;
          user_id: string;
          trigger_payload: Json;
          status: "running" | "completed" | "failed" | "skipped";
          steps: Json;
          started_at: string;
          finished_at: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["automation_runs"]["Row"]
        > & {
          workflow_id: string;
          user_id: string;
          status: "running" | "completed" | "failed" | "skipped";
        };
        Update: Partial<
          Database["public"]["Tables"]["automation_runs"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 8): job queue. Źródło:
      // 20260523000000_tier20_observability_flags_jobs_crdt.sql.
      // -----------------------------------------------------------------
      job_queue: {
        Row: {
          id: string;
          kind: string;
          payload: Json;
          status:
            | "pending"
            | "claimed"
            | "running"
            | "completed"
            | "failed"
            | "dead_letter";
          priority: number;
          attempts: number;
          max_attempts: number;
          run_after: string;
          claimed_at: string | null;
          claimed_by: string | null;
          heartbeat_at: string | null;
          completed_at: string | null;
          failed_at: string | null;
          last_error: string | null;
          idempotency_key: string | null;
          trace_id: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["job_queue"]["Row"]
        > & {
          kind: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["job_queue"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 8): e-discovery / legal holds. Źródło:
      // 20260526000000_tier23_compliance_security.sql.
      // -----------------------------------------------------------------
      legal_holds: {
        Row: {
          id: string;
          case_reference: string;
          description: string;
          target_user_ids: string[];
          target_organization_id: string | null;
          resource_types: string[];
          active: boolean;
          imposed_by: string;
          imposed_at: string;
          released_at: string | null;
          release_reason: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["legal_holds"]["Row"]
        > & {
          case_reference: string;
          description: string;
          imposed_by: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["legal_holds"]["Insert"]
        >;
        Relationships: [];
      };
      ediscovery_queries: {
        Row: {
          id: string;
          user_id: string | null;
          filters: Json;
          requested_by: string;
          requested_at: string;
          status: "pending" | "running" | "completed" | "failed";
          result_count: number;
          custody_hash: string | null;
          completed_at: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["ediscovery_queries"]["Row"]
        > & {
          requested_by: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["ediscovery_queries"]["Insert"]
        >;
        Relationships: [];
      };
      // -----------------------------------------------------------------
      // Audyt 2026-06-27 (iter. 8): drip campaigns. Źródło:
      // 20260513100000_tier8_pricing_affiliate_growth.sql.
      // -----------------------------------------------------------------
      email_campaign_enrollments: {
        Row: {
          id: string;
          user_id: string;
          campaign_key: string;
          start_at: string;
          context: Json;
          status: "active" | "cancelled" | "completed";
          cancelled_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["email_campaign_enrollments"]["Row"]
        > & {
          user_id: string;
          campaign_key: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["email_campaign_enrollments"]["Insert"]
        >;
        Relationships: [];
      };
      email_send_log: {
        Row: {
          id: string;
          enrollment_id: string;
          step_id: string;
          status: "sent" | "failed" | "skipped";
          detail: string | null;
          sent_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["email_send_log"]["Row"]
        > & {
          enrollment_id: string;
          step_id: string;
          status: "sent" | "failed" | "skipped";
        };
        Update: Partial<
          Database["public"]["Tables"]["email_send_log"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    // Audyt 2026-06-27: większość RPC nie jest jeszcze dotypowana (degraduje
    // do luźnego wywołania jak wcześniej przy Record<string, never>). Dotypowane
    // są tylko te, które tego wymagają do usunięcia `as any`. Indeks `[fn: string]`
    // zachowuje kompatybilność z pozostałymi wywołaniami `.rpc(...)`.
    Functions: {
      // RPC z 20260513100000_tier8_pricing_affiliate_growth.sql — atomowy
      // upsert+inkrementacja licznika użycia subskrypcji.
      fn_increment_subscription_usage: {
        Args: {
          p_user_id: string;
          p_period_start: string;
          p_period_end: string;
          p_field: "cases_created" | "ai_generations";
          p_delta: number;
        };
        Returns: undefined;
      };
      // RPC z 20260513100000_tier8_pricing_affiliate_growth.sql
      fn_increment_coupon_redemption: {
        Args: { p_coupon_id: string };
        Returns: undefined;
      };
      fn_increment_referral_uses: {
        Args: { p_code: string };
        Returns: undefined;
      };
      [fn: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
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

// -----------------------------------------------------------------------------
// Re-exports from sibling domain modules.
//
// Historically `@/lib/db/types` was the single import point for callers that
// don't care where exactly a type lives. We keep that contract by re-exporting
// the cross-cutting type names that appear in panel pages and route handlers.
// -----------------------------------------------------------------------------
export type { ParsedDocument } from "@/lib/ocr/ocr-types";
export type { ModuleId } from "@/lib/cases/case-types";
