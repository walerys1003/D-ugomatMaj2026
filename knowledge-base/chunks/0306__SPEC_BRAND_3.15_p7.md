# 3.15#p7 — FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW (part 7)

_source: SPEC_BRAND · tags: frontend, notifications, modules · line 1410 · 3487 chars_

    Header: flex row between, p-4 pb-3, border-bottom iron-100
      "Powiadomienia" Inter 15px 600 iron-900
      [Oznacz jako przeczytane] text link, Inter 12px dlug-500

    List: flex col, overflow-y auto
      Item: p-4, border-bottom iron-50, cursor-pointer
        Unread: bg dlug-50/30%, dot 8px dlug-500 (left side)
        Read: bg white

        Flex row, gap-3
        Left: icon container 36x36 radius-lg
          Deadline reminder: CalendarClock, warn-100 bg, warn-600 icon
          Document ready: FileCheck, accent-100 bg, accent-600 icon
          Payment: Receipt, dlug-100 bg, dlug-600 icon
          System: Info, iron-100 bg, iron-600 icon

        Center: flex col
          Title: Inter 14px 500 iron-800, truncate 1 line
            "Termin za 3 dni: Sprzeciw I Nc 3847/26"
          Description: Inter 13px 400 iron-500, truncate 2 lines
            "Złóż sprzeciw przed 28 kwietnia 2026"
          Time: Inter 12px 400 iron-400, mt-1
            "2 godziny temu"

        Hover: bg iron-50

    Footer: p-3, border-top iron-100, center
      [Zobacz wszystkie powiadomienia →]
      text link, Inter 13px 500 dlug-500

    Empty state:
      Center, p-8
      Icon: BellOff 40px iron-300
      "Brak nowych powiadomień"
      Inter 14px 400 iron-500

    Mobile: full bottom sheet instead of dropdown
SEARCH (Command Palette — ⌘K):
  Trigger:
    Desktop: ⌘K (Mac) / Ctrl+K (Win) keyboard shortcut
    Also: Search icon in header → opens palette
    Search input in header:
      Bg: iron-100, radius-full, h-9, px-4
      Placeholder: "Szukaj... ⌘K" Inter 14px 400 iron-500
      Click → opens command palette (not inline search)

  Palette overlay:
    Bg: iron-950/50% backdrop-blur-sm
    Click outside: close

  Palette content:
    Bg: white, shadow-2xl, radius-2xl, border iron-200
    Width: 560px
    Max-height: 480px
    Position: center, top 20vh

    Input:
      Full-width, border-bottom iron-200
      h-14, px-5
      Font: Inter 16px 400 iron-900
      Placeholder: "Szukaj spraw, dokumentów, akcji..."
      Icon: Search 20px iron-400 (left)
      Clear: X button (right, visible when text entered)
      No border-radius on input (inherits from parent top radius)

    Results: flex col, overflow-y auto, p-2
      Group header: Inter 12px 600 iron-500, px-3, py-2, uppercase
        "SPRAWY", "DOKUMENTY", "AKCJE"

      Result item: flex row, gap-3, px-3, py-2.5, radius-lg
        Icon: 18px iron-500
        Label: Inter 14px 500 iron-800
        Description: Inter 13px 400 iron-500 (optional)
        Shortcut badge (for actions): Inter 11px iron-400,
          bg iron-100, px-1.5 py-0.5, radius-sm, monospace
          Np: "Enter", "⌘N"

        Hover / keyboard selected: bg iron-100

      Np results:
        🔍 SPRAWY
          Briefcase  I Nc 3847/26 — Sprzeciw EPU
          Briefcase  KM 1223/26 — Skarga na komornika
        📄 DOKUMENTY
          FileText  Sprzeciw_I_Nc_3847_26.pdf
        ⚡ AKCJE
          Plus  Nowy sprzeciw EPU                    ⌘N
          ScanSearch  Skanuj dokument                 ⌘U
          CreditCard  Reklamacja BIK

    Empty state:
      Center, p-8
      "Nie znaleziono wyników dla „xyz""
      Inter 14px 400 iron-500

    Keyboard:
      ↑↓: navigate items
      Enter: select/navigate to item
      Escape: close palette
      Type: filters in real-time (debounce 200ms)

    Animation:
      Open: scale 0.98→1.0, opacity 0→1, 200ms ease-out
      Close: opacity 1→0, 150ms ease-in
