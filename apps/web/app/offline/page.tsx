// Fallback page shown by the service worker when navigation fails offline.
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "1rem" }}>Brak połączenia</h1>
        <p style={{ color: "#52525b", marginBottom: "1.5rem" }}>
          Nie udało się załadować strony. Twoje robocze zmiany są zapisywane lokalnie
          i zostaną zsynchronizowane gdy wrócisz online.
        </p>
        <p style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>
          Działa wyłącznie wcześniej odwiedzona część aplikacji.
        </p>
      </div>
    </main>
  );
}
