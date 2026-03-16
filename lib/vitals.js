/**
 * JoyJump Web Vitals — Phase 1 baseline
 *
 * Captures Core Web Vitals and logs them to console in development,
 * and to Supabase analytics table in production.
 *
 * Metrics tracked:
 *   LCP  — Largest Contentful Paint    (loading)
 *   FID  — First Input Delay           (interactivity)
 *   CLS  — Cumulative Layout Shift     (visual stability)
 *   FCP  — First Contentful Paint      (loading)
 *   TTFB — Time to First Byte          (server)
 *
 * To enable, call reportWebVitals(onVitals) from pages/_app.js.
 * Next.js calls this automatically when exported from _app.js.
 */

export function onVitals(metric) {
  const { name, value, rating, id } = metric

  // Always log in development
  if (process.env.NODE_ENV === 'development') {
    const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴'
    console.log(`[Vitals] ${color} ${name}: ${Math.round(value)}ms (${rating})`)
  }

  // In production, send to Supabase (fire-and-forget, non-blocking)
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const payload = {
      metric_name: name,
      value: Math.round(value),
      rating,
      metric_id: id,
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
      recorded_at: new Date().toISOString(),
    }

    // Use sendBeacon for reliability (won't block page unload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/web_vitals`
      const headers = {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        'Prefer': 'return=minimal',
      }
      const blob = new Blob(
        [JSON.stringify(payload)],
        { type: 'application/json' }
      )
      // sendBeacon doesn't support custom headers — use fetch instead
      fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
        .catch(() => {}) // silent failure
    }
  }
}

/**
 * Exported for Next.js automatic collection.
 * Add to pages/_app.js:
 *   export { onVitals as reportWebVitals } from '../lib/vitals'
 */
export { onVitals as reportWebVitals }
