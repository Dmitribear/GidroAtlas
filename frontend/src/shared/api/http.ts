type ApiResult<T> = { data: T } | { error: string }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH ?? '/api/v1'
const API_ROOT = `${API_BASE_URL}${API_BASE_PATH}`

export async function postJson<T>(path: string, body: unknown, token?: string): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${API_ROOT}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message =
        res.status === 401
          ? 'Неверный логин или пароль'
          : json?.detail || json?.message || res.statusText
      return { error: String(message || 'Request failed') }
    }

    return { data: json as T }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' }
  }
}

export async function getJson<T>(path: string, token?: string): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${API_ROOT}${path}`, { headers })
    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message = json?.detail || json?.message || res.statusText
      return { error: String(message || 'Request failed') }
    }

    return { data: json as T }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' }
  }
}
