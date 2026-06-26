import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";
import { DEV_PREVIEW_USER } from "@/lib/dev/preview";

/**
 * Typ zwracany przez realny `createServerClient<Database>` — używamy go, by
 * mock zachowywał ten sam interfejs typów co produkcyjny klient. Dzięki temu
 * konsumenci (`.from(...).select<...>()`) nie tracą typowania.
 */
type TypedSupabaseClient = ReturnType<typeof createServerClient<Database>>;

/**
 * Lekki mock klienta Supabase dla DEV-PREVIEW.
 *
 * Naśladuje tylko ten fragment API @supabase/supabase-js, którego używają
 * panele: `auth.getUser()`, łańcuchowy query-builder `from(...).select()...`
 * (eq/neq/is/in/order/limit/range/gte/lte/gt/lt/like/ilike/or/match/contains/
 * filter/not), terminatory `single()/maybeSingle()` oraz mutacje
 * `insert/update/upsert/delete`. Każde zapytanie kończy się BEZBŁĘDNIE,
 * zwracając pusty zbiór — dzięki czemu strony renderują swoje empty-state
 * zamiast się wywracać.
 *
 * To celowo NIE jest pełna implementacja PostgREST — wyłącznie tyle, by
 * podejrzeć UI bez żywej bazy.
 */

type PgResult<T> = { data: T; error: null };

const EMPTY_LIST: PgResult<unknown[]> = { data: [], error: null };
const EMPTY_ROW: PgResult<null> = { data: null, error: null };

/**
 * Query-builder, który jest jednocześnie „thenable" (jak builder PostgREST):
 *  - łańcuchowe filtry zwracają `this`,
 *  - `await builder` → { data: [], error: null },
 *  - `single()/maybeSingle()` → { data: null, error: null }.
 */
function makeQueryBuilder() {
  const listPromise = Promise.resolve(EMPTY_LIST);

  const builder: Record<string, unknown> = {
    // terminatory zwracające pojedynczy rekord
    single: () => Promise.resolve(EMPTY_ROW),
    maybeSingle: () => Promise.resolve(EMPTY_ROW),
    csv: () => Promise.resolve({ data: "", error: null }),
    throwOnError: () => builder,

    // thenable — pozwala `await supabase.from(...).select(...)`
    then: (
      onFulfilled?: (v: PgResult<unknown[]>) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => listPromise.then(onFulfilled, onRejected),
    catch: (onRejected?: (e: unknown) => unknown) =>
      listPromise.catch(onRejected),
    finally: (onFinally?: () => void) => listPromise.finally(onFinally),
  };

  // wszystkie filtry / modyfikatory zwracają ten sam builder (łańcuchowanie)
  const chainMethods = [
    "select",
    "insert",
    "update",
    "upsert",
    "delete",
    "eq",
    "neq",
    "is",
    "in",
    "order",
    "limit",
    "range",
    "gte",
    "lte",
    "gt",
    "lt",
    "like",
    "ilike",
    "or",
    "match",
    "contains",
    "filter",
    "not",
    "overlaps",
    "textSearch",
    "returns",
    "abortSignal",
  ];
  for (const m of chainMethods) {
    builder[m] = () => builder;
  }

  return builder;
}

/**
 * Zwraca obiekt udający `SupabaseClient` na potrzeby podglądu paneli.
 * Implementujemy świadomie tylko podzbiór API, ale rzutujemy na pełny typ
 * klienta, aby konsumenci nie tracili typowania (zero implicit-any u nich).
 */
export function createMockSupabaseClient(): TypedSupabaseClient {
  const mockUser = {
    id: DEV_PREVIEW_USER.id,
    email: DEV_PREVIEW_USER.email,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: { provider: "dev-preview" },
    user_metadata: { full_name: DEV_PREVIEW_USER.fullName },
    created_at: new Date(0).toISOString(),
  };

  const client = {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({
        data: {
          session: {
            user: mockUser,
            access_token: "dev-preview",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "dev-preview",
          },
        },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
    from: () => makeQueryBuilder(),
    rpc: async () => EMPTY_LIST,
    storage: {
      from: () => ({
        list: async () => EMPTY_LIST,
        createSignedUrl: async () => ({
          data: { signedUrl: "#" },
          error: null,
        }),
        getPublicUrl: () => ({ data: { publicUrl: "#" } }),
        upload: async () => ({ data: { path: "" }, error: null }),
        download: async () => ({ data: null, error: null }),
        remove: async () => ({ data: [], error: null }),
      }),
    },
  };

  // Świadomy podzbiór API — rzutujemy przez `unknown` na pełny typ klienta,
  // by konsumenci zachowali typowanie (mock nie implementuje całego SDK).
  return client as unknown as TypedSupabaseClient;
}
