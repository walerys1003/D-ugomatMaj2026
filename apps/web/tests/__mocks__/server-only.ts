// Vitest stub for 'server-only' (Next.js runtime guard, no-op in tests).
//
// Next.js wprowadza 'server-only' jako import-time throw, gdy moduł trafi do
// client bundle. W testach Vitest (jsdom) nie ma rozróżnienia server/client,
// więc tę zależność stub'ujemy do pustego modułu via alias w vitest.config.ts.
export {};
