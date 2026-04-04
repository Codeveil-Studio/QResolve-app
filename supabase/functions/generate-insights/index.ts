import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Insight {
  id: string
  type: 'preventive' | 'warning' | 'optimization'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  score: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY secret is not configured')
    }

    // Use the service role key for server-side DB access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify the calling user's JWT and get their org
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the user's org
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const orgId = membership.org_id

    // Fetch assets
    const { data: assets } = await supabase
      .from('assets')
      .select('name, type, location, status, purchase_date, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Fetch issues from the last 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: issues } = await supabase
      .from('issues')
      .select(`
        title,
        description,
        priority,
        status,
        created_at,
        resolved_at,
        asset:assets(name)
      `)
      .eq('org_id', orgId)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    // Build a concise summary for the prompt to minimise token usage
    const assetSummary = (assets ?? []).map(a =>
      `- ${a.name} (${a.type ?? 'Unknown type'}) at ${a.location ?? 'Unknown location'} — status: ${a.status}`
    ).join('\n')

    const issueSummary = (issues ?? []).map(i => {
      const assetName = (i.asset as { name: string } | null)?.name ?? 'Unknown asset'
      const resolved = i.resolved_at ? `resolved ${i.resolved_at.slice(0, 10)}` : 'unresolved'
      return `- [${i.priority}] ${i.title} on ${assetName} (${i.status}, ${resolved})`
    }).join('\n')

    const openCount = (issues ?? []).filter(i => i.status === 'open').length
    const totalAssets = (assets ?? []).length

    const prompt = `You are an AI operations analyst for a facility/asset management SaaS platform called QResolve.

Analyse the following real operational data and return EXACTLY 3 actionable insights as a valid JSON array.

ASSETS (${totalAssets} total):
${assetSummary || 'No assets found.'}

ISSUES — last 90 days (${(issues ?? []).length} total, ${openCount} open):
${issueSummary || 'No issues found.'}

Return ONLY a JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "id": "1",
    "type": "preventive" | "warning" | "optimization",
    "title": "Short title (max 60 chars)",
    "description": "Actionable insight based on the data above (max 160 chars)",
    "impact": "high" | "medium" | "low",
    "score": <integer 60-99 representing confidence>
  }
]

Rules:
- Base insights strictly on the data provided above, not generic advice.
- If data is sparse, infer reasonable patterns but keep descriptions honest.
- Each insight must have a different "type".
- "score" must be a number (no quotes).`

    // Call Gemini Flash (cheapest, fastest)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini API error ${geminiRes.status}: ${errText}`)
    }

    const geminiData = await geminiRes.json()
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Strip any markdown code fences Gemini might add, then extract just the JSON array
    const stripped = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
    const arrayStart = stripped.indexOf('[')
    const arrayEnd = stripped.lastIndexOf(']')
    const jsonText = arrayStart !== -1 && arrayEnd !== -1 ? stripped.slice(arrayStart, arrayEnd + 1) : stripped

    let insights: Insight[]
    try {
      insights = JSON.parse(jsonText)
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${rawText}`)
    }

    // Validate shape
    if (!Array.isArray(insights) || insights.length === 0) {
      throw new Error('Gemini returned unexpected format')
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('generate-insights error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
