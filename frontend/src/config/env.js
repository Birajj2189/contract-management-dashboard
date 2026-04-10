/**
 * Centralised environment configuration.
 *
 * All access to import.meta.env goes through this file.
 * Components and services import from here — never from import.meta.env directly.
 *
 * Vite only exposes variables prefixed with VITE_ to the browser bundle.
 * Non-prefixed variables (DEV, PROD, MODE) are injected by Vite itself.
 */
const env = {
  // ── API ────────────────────────────────────────────────────────────────────
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',

  // ── App meta ───────────────────────────────────────────────────────────────
  appName: import.meta.env.VITE_APP_NAME || 'Contract Management',

  // ── Vite built-ins ─────────────────────────────────────────────────────────
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,

  // ── React Query ────────────────────────────────────────────────────────────
  // How long (ms) cached data is considered fresh before a background refetch.
  queryStaleTime: Number(import.meta.env.VITE_QUERY_STALE_TIME) || 5 * 60 * 1000,

  // Retry count for failed queries.
  queryRetry: Number(import.meta.env.VITE_QUERY_RETRY ?? 1),

  // ── UI / UX ────────────────────────────────────────────────────────────────
  // Toast notification visible duration (ms).
  toastDuration: Number(import.meta.env.VITE_TOAST_DURATION) || 4000,

  // Debounce delay (ms) for search inputs.
  debounceDelay: Number(import.meta.env.VITE_DEBOUNCE_DELAY) || 400,

  // ── Pagination ─────────────────────────────────────────────────────────────
  // Rows per page in paginated tables.
  pageSize: Number(import.meta.env.VITE_PAGE_SIZE) || 10,

  // Max rows fetched for client-side filtered pages (parties, reports, dashboard).
  maxListLimit: Number(import.meta.env.VITE_MAX_LIST_LIMIT) || 500,
}

export default env
