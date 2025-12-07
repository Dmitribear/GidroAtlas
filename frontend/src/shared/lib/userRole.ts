import { getJson } from '@shared/api/http'
import { supabase } from '@shared/api/supabaseClient'

export type UserRole = 'guest' | 'expert'

export async function resolveUserRole(
  token: string | null,
  loginFromStorage: string | null,
): Promise<{ login: string | null; role: UserRole }> {
  let login = loginFromStorage
  let role: UserRole = 'guest'

  if (token) {
    try {
      const res = await getJson<{ login: string; role?: string }>('/auth/me', token)
      if ('data' in res && res.data) {
        login = res.data.login || login
        if (login) {
          localStorage.setItem('user_login', login)
        }
        const roleFromApi = res.data.role
        if (roleFromApi === 'expert' || roleFromApi === 'guest') {
          role = roleFromApi
        }
      }
    } catch {
      // ignore and fallback to Supabase lookup
    }
  }

  if (role === 'guest' && login) {
    try {
      const { data } = await supabase.from('users').select('role').eq('login', login).single()
      const supabaseRole = (data as { role?: string } | null)?.role
      if (supabaseRole === 'expert') {
        role = 'expert'
      }
    } catch {
      // keep guest by default
    }
  }

  return { login: login ?? null, role }
}
