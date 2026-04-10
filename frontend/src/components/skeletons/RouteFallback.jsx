import AppLoadingScreen from '@/components/common/AppLoadingScreen'

/**
 * Lazy-route Suspense fallback — branded loader instead of layout skeletons.
 */
const RouteFallback = () => <AppLoadingScreen variant="embedded" />

export default RouteFallback
