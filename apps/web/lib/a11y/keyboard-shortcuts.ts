// Global keyboard shortcut registry — Ctrl/Cmd combos, with help overlay support.

export interface Shortcut {
  id: string;
  combo: string; // e.g. "mod+k", "shift+?", "g c"
  description: string;
  handler: () => void;
  scope?: "global" | "case" | "editor";
}

const shortcuts = new Map<string, Shortcut>();
let sequenceBuffer: string[] = [];
let sequenceTimer: ReturnType<typeof setTimeout> | null = null;

export function registerShortcut(sc: Shortcut): () => void {
  shortcuts.set(sc.id, sc);
  return () => shortcuts.delete(sc.id);
}

export function listShortcuts(): Shortcut[] {
  return Array.from(shortcuts.values());
}

export function attachShortcutListener(target: Window = window): () => void {
  if (typeof target === "undefined") return () => {};
  const handler = (e: KeyboardEvent) => {
    // Ignore when focused in input/textarea/contentEditable, unless combo includes mod.
    const tgt = e.target as HTMLElement | null;
    const inField = tgt?.tagName === "INPUT" || tgt?.tagName === "TEXTAREA" || tgt?.isContentEditable;

    const isMod = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;
    const key = e.key.toLowerCase();

    // single-combo first
    const comboParts: string[] = [];
    if (isMod) comboParts.push("mod");
    if (isShift) comboParts.push("shift");
    if (isAlt) comboParts.push("alt");
    comboParts.push(key);
    const combo = comboParts.join("+");

    for (const sc of shortcuts.values()) {
      if (sc.combo === combo) {
        if (inField && !isMod) continue;
        e.preventDefault();
        sc.handler();
        return;
      }
    }

    // sequence support — "g c" etc. only when no mod keys and not in field
    if (!isMod && !isShift && !isAlt && !inField && /^[a-z0-9]$/.test(key)) {
      sequenceBuffer.push(key);
      if (sequenceTimer) clearTimeout(sequenceTimer);
      const candidate = sequenceBuffer.join(" ");
      for (const sc of shortcuts.values()) {
        if (sc.combo === candidate) {
          e.preventDefault();
          sc.handler();
          sequenceBuffer = [];
          return;
        }
      }
      sequenceTimer = setTimeout(() => { sequenceBuffer = []; }, 1000);
    }
  };

  target.addEventListener("keydown", handler);
  return () => target.removeEventListener("keydown", handler);
}

// Built-in defaults — wire up in app shell.
export const DEFAULT_SHORTCUTS: Omit<Shortcut, "handler">[] = [
  { id: "search", combo: "mod+k", description: "Otwórz wyszukiwanie", scope: "global" },
  { id: "new-case", combo: "g c", description: "Nowa sprawa", scope: "global" },
  { id: "scan-doc", combo: "g s", description: "Skanuj dokument", scope: "global" },
  { id: "deadlines", combo: "g t", description: "Lista terminów", scope: "global" },
  { id: "help", combo: "shift+?", description: "Pokaż skróty klawiszowe", scope: "global" },
];
