# 7.1 — Diagram ERD (Entity-Relationship)

_source: SPEC_FULL · tags: database, ocr, payments, notifications · line 992 · 3351 chars_

┌────────────┐     ┌────────────────┐     ┌──────────────────┐
│  profiles   │──1──│     cases      │──1──│   documents      │
│            │  :N  │                │  :N │                  │
│ id (FK→auth│      │ id             │     │ id               │
│ email       │      │ user_id (FK)   │     │ case_id (FK)     │
│ full_name   │      │ type           │     │ type             │
│ phone       │      │ status         │     │ content_md       │
│ created_at  │      │ title          │     │ content_html     │
│ updated_at  │      │ metadata (JSON)│     │ pdf_url          │
│ role        │      │ created_at     │     │ status           │
│ avatar_url  │      │ updated_at     │     │ version          │
│ settings    │      │ deleted_at     │     │ ai_model_used    │
└────────────┘      └───────┬────────┘     │ tokens_used      │
                            │              │ validation_score  │
                    ┌───────┴────────┐     │ created_at       │
                    │                │     │ updated_at       │
              ┌─────┴──────┐  ┌──────┴───┐ └──────────────────┘
              │  deadlines  │  │ocr_results│
              │            │  │           │       ┌───────────────┐
              │ id         │  │ id        │       │document_      │
              │ case_id(FK)│  │ case_id   │       │  versions     │
              │ type       │  │ file_url  │       │               │
              │ deadline_dt│  │ raw_text  │       │ id            │
              │ notif_sent │  │ extracted │       │ document_id   │
              │ created_at │  │ confidence│       │ version_num   │
              └────────────┘  │ provider  │       │ content_md    │
                              │ created_at│       │ changed_by    │
                              └───────────┘       │ created_at    │
                                                  └───────────────┘
              ┌──────────────┐     ┌──────────────────┐
              │   payments   │     │   case_events     │
              │              │     │                   │
              │ id           │     │ id                │
              │ user_id (FK) │     │ case_id (FK)      │
              │ case_id (FK) │     │ event_type        │
              │ document_id  │     │ actor             │
              │ stripe_sid   │     │ metadata (JSON)   │
              │ amount       │     │ created_at        │
              │ currency     │     └───────────────────┘
              │ status       │
              │ product_type │     ┌──────────────────┐
              │ created_at   │     │ legal_knowledge   │
              │ paid_at      │     │                   │
              └──────────────┘     │ id                │
                                   │ category          │
              ┌──────────────┐     │ subcategory       │
              │ notifications│     │ title             │
              │              │     │ content           │
              │ id           │     │ embedding (vector)│
              │ user_id (FK) │     │ source            │
              │ case_id (FK) │     │ effective_date    │
              │ channel      │     │ created_at        │
              │ template     │     └──────────────────┘
              │ status       │
              │ sent_at      │
              │ created_at   │
              └──────────────┘
