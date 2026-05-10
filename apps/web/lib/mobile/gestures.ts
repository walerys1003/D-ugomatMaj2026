// Mobile gesture helpers — pointer-event based swipe & pinch detection.
// Framework-agnostic; consumers wire to onPointerDown/Move/Up on a target node.

export type SwipeDir = "left" | "right" | "up" | "down";

export interface SwipeConfig {
  thresholdPx?: number;
  thresholdMs?: number;
  onSwipe?: (dir: SwipeDir, distance: number) => void;
}

export function createSwipeDetector(cfg: SwipeConfig = {}) {
  const threshold = cfg.thresholdPx ?? 50;
  const maxTime = cfg.thresholdMs ?? 600;
  let startX = 0;
  let startY = 0;
  let startT = 0;
  let active = false;

  return {
    onPointerDown(e: { clientX: number; clientY: number }) {
      startX = e.clientX;
      startY = e.clientY;
      startT = Date.now();
      active = true;
    },
    onPointerUp(e: { clientX: number; clientY: number }) {
      if (!active) return;
      active = false;
      const dt = Date.now() - startT;
      if (dt > maxTime) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (Math.max(ax, ay) < threshold) return;
      let dir: SwipeDir;
      if (ax > ay) dir = dx > 0 ? "right" : "left";
      else dir = dy > 0 ? "down" : "up";
      cfg.onSwipe?.(dir, Math.max(ax, ay));
    },
    onPointerCancel() {
      active = false;
    },
  };
}

// Pinch detection — for image zoom on scanned documents.
export interface PinchConfig {
  onPinch?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

export function createPinchDetector(cfg: PinchConfig = {}) {
  const minScale = cfg.minScale ?? 0.5;
  const maxScale = cfg.maxScale ?? 4;
  let initialDist = 0;

  return {
    onTouchStart(e: { touches: Array<{ clientX: number; clientY: number }> }) {
      if (e.touches.length === 2) {
        initialDist = dist(e.touches[0], e.touches[1]);
      }
    },
    onTouchMove(e: { touches: Array<{ clientX: number; clientY: number }> }) {
      if (e.touches.length === 2 && initialDist > 0) {
        const curr = dist(e.touches[0], e.touches[1]);
        const scale = Math.max(minScale, Math.min(maxScale, curr / initialDist));
        cfg.onPinch?.(scale);
      }
    },
  };
}

function dist(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Pull-to-refresh primitive — returns 0..1 progress while user pulls down.
export function createPullToRefresh(opts: { onRefresh: () => Promise<void>; thresholdPx?: number }) {
  const threshold = opts.thresholdPx ?? 80;
  let startY = 0;
  let pulling = false;
  let progress = 0;
  let refreshing = false;
  let onProgress: ((p: number) => void) | null = null;

  return {
    setProgressHandler(fn: (p: number) => void) { onProgress = fn; },
    onTouchStart(e: { touches: Array<{ clientY: number }> }, scrollTop: number) {
      if (refreshing || scrollTop > 0) return;
      startY = e.touches[0].clientY;
      pulling = true;
    },
    onTouchMove(e: { touches: Array<{ clientY: number }> }) {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) return;
      progress = Math.min(1, dy / threshold);
      onProgress?.(progress);
    },
    async onTouchEnd() {
      if (!pulling) return;
      pulling = false;
      if (progress >= 1) {
        refreshing = true;
        try { await opts.onRefresh(); } finally {
          refreshing = false;
          progress = 0;
          onProgress?.(0);
        }
      } else {
        progress = 0;
        onProgress?.(0);
      }
    },
  };
}
