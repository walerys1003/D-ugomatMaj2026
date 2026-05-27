"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Array<{ title: string; source: string; url?: string }>;
}

interface ChatStreamProps {
  endpoint?: string;
  initialMessages?: ChatMessage[];
  placeholder?: string;
  contextId?: string;
}

export function ChatStream({
  endpoint = "/api/ai/chat",
  initialMessages = [],
  placeholder = "Zadaj pytanie prawne...",
  contextId,
}: ChatStreamProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context_id: contextId,
        }),
      });

      if (!res.ok || !res.body) throw new Error("stream_failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const data = JSON.parse(payload);
            if (data.delta) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + data.delta,
                  };
                }
                return updated;
              });
            }
            if (data.citations) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, citations: data.citations };
                }
                return updated;
              });
            }
          } catch {
            // ignore invalid JSON chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant" && last.content === "") {
          updated[updated.length - 1] = {
            ...last,
            content: "Wystąpił błąd. Spróbuj ponownie za chwilę.",
          };
        }
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-ink-800 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ minHeight: "400px", maxHeight: "60vh" }}
      >
        {messages.length === 0 && (
          <div className="text-center text-sm text-ink-500 py-12">
            Zacznij rozmowę — asystent odpowie z cytowaniami z bazy orzeczniczej.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-ink-900 text-ink-50 dark:bg-ink-50 dark:text-ink-900"
                  : "bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-ink-50 border border-ink-200 dark:border-ink-700"
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? "▍" : "")}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-ink-200 dark:border-ink-700 space-y-1">
                  <div className="text-xs uppercase tracking-wider text-ink-500">
                    Źródła
                  </div>
                  {m.citations.map((c, ci) => (
                    <div key={ci} className="text-xs">
                      {c.url ? (
                        <a
                          href={c.url}
                          className="text-accent-700 hover:text-accent-800"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          [{ci + 1}] {c.title}
                        </a>
                      ) : (
                        <span>
                          [{ci + 1}] {c.title}
                        </span>
                      )}
                      <span className="text-ink-500"> · {c.source}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-ink-200 dark:border-ink-800 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={streaming}
          className="flex-1 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus:outline-none focus-visible:shadow-shield-focus disabled:opacity-60"
        />
        <Button type="submit" variant="primary" disabled={streaming || !input.trim()}>
          {streaming ? "..." : "Wyślij"}
        </Button>
      </form>
    </div>
  );
}
