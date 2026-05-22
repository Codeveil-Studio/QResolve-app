// Shared helpers for authenticating callers in Edge Functions.
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface AuthContext {
  userId: string
  email: string | null
  /**
   * The user's organization ID. Null if the user has no org membership
   * (true for platform admins who aren't members of any org).
   * Per-function: check explicitly with `requireOrg(auth)` if your function
   * needs an org context.
   */
  orgId: string | null
  isAdmin: boolean
  serviceClient: SupabaseClient
}

/**
 * Resolves the user from the Authorization header, fetches their org membership
 * (if any), and indicates whether they are a platform admin.
 *
 * Throws if the request is unauthenticated. Does NOT throw on missing org
 * membership — that's a per-function decision (platform admin functions don't
 * need an org). Use `requireOrg()` in functions that operate on org data.
 */
export async function getAuthContext(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new AuthError('Missing authorization header', 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userData.user) {
    throw new AuthError('Unauthorized', 401)
  }

  const serviceClient = createClient(supabaseUrl, serviceKey)

  const [membershipRes, adminRes] = await Promise.all([
    serviceClient
      .from('organization_memberships')
      .select('org_id')
      .eq('user_id', userData.user.id)
      .maybeSingle(),
    serviceClient
      .from('admins')
      .select('id')
      .eq('id', userData.user.id)
      .maybeSingle(),
  ])

  return {
    userId: userData.user.id,
    email: userData.user.email ?? null,
    orgId: membershipRes.data?.org_id ?? null,
    isAdmin: !!adminRes.data,
    serviceClient,
  }
}

/**
 * Asserts the caller has an organization. Use in functions that operate on
 * org-scoped data (create/cancel subscriptions, etc.). Returns the orgId
 * narrowed to non-null.
 */
export function requireOrg(auth: AuthContext): string {
  if (!auth.orgId) {
    throw new AuthError('User has no organization membership', 403)
  }
  return auth.orgId
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}
