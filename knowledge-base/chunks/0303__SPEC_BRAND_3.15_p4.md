# 3.15#p4 — FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW (part 4)

_source: SPEC_BRAND · tags: frontend, ai-engine, ocr, notifications, modules, strategy · line 1410 · 3739 chars_

    Day cells: grid 7-col, gap-1
      Size: 36x36px, radius-md, center
      Default: Inter 14px 400 iron-800
      Hover: bg dlug-50, text dlug-700
      Today: border 1.5px dlug-400, font-weight 600
      Selected: bg dlug-500, text white, font-weight 600
      Disabled (past dates for deadline picker): iron-300,
        cursor-not-allowed, no hover
      Range (if applicable): bg dlug-100 between start/end

    Special: deadline dates
      Dates that are legally significant (14-day deadline etc.)
      Highlighted: bg warn-50, text warn-700, border warn-300
      Tooltip on hover: "Ostatni dzień na złożenie sprzeciwu"

    Keyboard:
      Arrow keys: navigate days
      Enter: select
      Escape: close
      Page Up/Down: previous/next month

    Mobile:
      Calendar opens as bottom sheet (not dropdown)
      Full-width, radius-xl top corners
      Backdrop: iron-950/60%, click outside closes
      Swipe down to dismiss
FILE UPLOAD (Drag & Drop):
  Komponent: FileDropzone

  Default state:
    Border: 2px dashed iron-300
    Radius: --radius-xl (18px)
    Bg: iron-50
    Min-height: 180px
    Padding: 32px
    Display: flex col, align-center, justify-center, gap-4
    Cursor: pointer

    Icon: UploadCloud 48px iron-300
    Heading: "Przeciągnij plik lub kliknij"
             Inter 16px 600 iron-700
    Subtext: "JPG, PNG lub PDF · maksymalnie 10 MB"
             Inter 14px 400 iron-500
    Button (alternative): [Wybierz plik]
             ghost button sm, dlug-500

  Hover / drag-over:
    Border: 2px dashed dlug-400
    Bg: dlug-50
    Icon color: dlug-400
    Heading color: dlug-700
    Scale: 1.01 (subtle, 200ms ease)

  Active drop (file hovering over):
    Border: 2px solid dlug-500
    Bg: dlug-100
    Shadow: inset 0 0 0 4px dlug-100
    Icon: animated bounce-gentle (translateY 0→-4px→0, 600ms)

  File selected (replaces dropzone content):
    Border: 1.5px solid iron-200 (solid, not dashed)
    Bg: white
    Padding: 16px
    Flex row, gap-12px, align-center

    Thumbnail:
      If image: 48x48px, radius-md, object-cover, border iron-200
      If PDF: FileText icon 48px in iron-100 bg circle

    Info: flex col
      Filename: Inter 14px 600 iron-800, truncate max-width 280px
      File size: Inter 12px 400 iron-500, "2.4 MB"

    Actions (right):
      [✕ Usuń] — icon button, ghost, danger-500 on hover

  Upload progress (during OCR/upload):
    Below file info:
      Progress bar: h-1.5, bg iron-200, radius-full
      Fill: dlug-500, animated width 0→100%, ease
      Label below: Inter 12px 400 iron-500
        "Przesyłanie... 67%" → "Rozpoznawanie tekstu..." → "Gotowe ✓"
      Scanning animation overlay:
        Thin line (2px, dlug-300/50%) sweeping top→bottom
        of thumbnail, 2s infinite (during OCR phase only)

  Error state:
    Border: 2px dashed danger-300
    Bg: danger-50
    Icon: AlertCircle 48px danger-400
    Heading: "Nie udało się przesłać pliku" Inter 16px 600 danger-700
    Subtext: error message, Inter 14px 400 danger-600
      "Plik jest za duży (max 10 MB)" lub
      "Nieobsługiwany format — użyj JPG, PNG lub PDF" lub
      "Błąd serwera — spróbuj ponownie"
    [Spróbuj ponownie] ghost button sm, danger-500

  Multiple files variant (for KomornikShield — multiple documents):
    After first file: dropzone shrinks to compact (h-16, horizontal)
    Files list below: flex col, gap-2
    Each file: same as "file selected" row
    Max files: 5 (configurable)
    Reorder: drag handle (GripVertical icon, left side)
MODAL / DIALOG (Radix Dialog):
  Overlay:
    Bg: iron-950/60% (rgba(10, 13, 20, 0.60))
    Backdrop-filter: blur(4px)
    Animation: opacity 0→1, 200ms ease-out
    Click outside: closes modal (unless preventClose flag)
