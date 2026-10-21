import { useCallback, useEffect, useRef, useState } from 'react'

export type StorageErrorKind = 'unavailable' | 'quota' | 'parse' | 'invalid'

export interface StorageError {
  kind: StorageErrorKind
  message: string
}

export type SetValue<T> = T | ((previous: T) => T)

export interface UseLocalStorageOptions<T> {
  /** Проверка структуры сохранённого значения. При ошибке данные не перезаписываются. */
  validate?: (value: unknown) => value is T
  /** Сообщение об ошибке чтения/записи. */
  onError?: (error: StorageError) => void
}

const ERRORS: Record<StorageErrorKind, string> = {
  unavailable:
    'localStorage недоступен — изменения сохраняются только до перезагрузки страницы.',
  quota: 'Не удалось сохранить данные: превышен лимит localStorage.',
  parse:
    'Сохранённые данные повреждены и не были прочитаны. Показано начальное состояние.',
  invalid: 'Сохранённые данные имеют неверную структуру. Они не были перезаписаны.',
}

function getFallback<T>(initialValue: T | (() => T)): T {
  return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
}

/** Чтение сохранённого значения. При любой ошибке возвращается начальное состояние. */
function readStoredValue<T>(
  key: string,
  initialValue: T | (() => T),
  validate?: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return getFallback(initialValue)
    const parsed = JSON.parse(raw) as unknown
    if (validate && !validate(parsed)) return getFallback(initialValue)
    return parsed as T
  } catch {
    return getFallback(initialValue)
  }
}

/** Диагностика сохранённых данных — вызывается после монтирования. */
function inspectStoredValue<T>(
  key: string,
  validate?: (value: unknown) => value is T,
): StorageError | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    try {
      const parsed = JSON.parse(raw) as unknown
      if (validate && !validate(parsed)) {
        return { kind: 'invalid', message: ERRORS.invalid }
      }
      return null
    } catch {
      return { kind: 'parse', message: ERRORS.parse }
    }
  } catch {
    return { kind: 'unavailable', message: ERRORS.unavailable }
  }
}

/**
 * Состояние, синхронизированное с localStorage.
 * Запись выполняется после каждого изменения значения, чтение — один раз при инициализации.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {},
): [T, (value: SetValue<T>) => void] {
  const { validate, onError } = options

  const onErrorRef = useRef(onError)
  const validateRef = useRef(validate)

  useEffect(() => {
    onErrorRef.current = onError
    validateRef.current = validate
  })

  const [value, setValue] = useState<T>(() =>
    readStoredValue(key, initialValue, validate),
  )

  const isFirstRender = useRef(true)

  useEffect(() => {
    const error = inspectStoredValue(key, validateRef.current)
    if (error) onErrorRef.current?.(error)
  }, [key])

  useEffect(() => {
    if (isFirstRender.current) {
      // Первичное значение не перезаписываем: так повреждённые данные не затираются молча.
      isFirstRender.current = false
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      onErrorRef.current?.({ kind: 'quota', message: ERRORS.quota })
    }
  }, [key, value])

  const set = useCallback((next: SetValue<T>) => {
    setValue((previous) =>
      typeof next === 'function' ? (next as (previous: T) => T)(previous) : next,
    )
  }, [])

  return [value, set]
}
