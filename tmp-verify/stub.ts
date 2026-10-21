// Временная проверка рендера приложения в Node (SSR) — удаляется после проверки.
const store = new Map<string, string>()

const storage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
}

const globalAny = globalThis as unknown as Record<string, unknown>
globalAny.window = globalAny.window ?? {}
;(globalAny.window as Record<string, unknown>).localStorage = storage
globalAny.localStorage = storage

export {}
