import posthog from 'posthog-js'
import { PostHogEvent } from '@/types'

// PostHog service for analytics tracking
export class PostHogService {
  private static instance: PostHogService
  private isInitialized = false

  private constructor() {}

  static getInstance(): PostHogService {
    if (!PostHogService.instance) {
      PostHogService.instance = new PostHogService()
    }
    return PostHogService.instance
  }

  // Initialize PostHog
  init(apiKey: string, options?: any): void {
    if (this.isInitialized) return

    posthog.init(apiKey, {
      api_host: 'https://app.posthog.com',
      loaded: (posthog) => {
        if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) posthog.debug()
      },
      capture_pageview: false, // Disable automatic pageview capture
      ...options,
    })

    this.isInitialized = true
  }

  // Track custom events
  track(event: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('PostHog not initialized')
      return
    }

    posthog.capture(event, {
      timestamp: new Date().toISOString(),
      ...properties,
    })
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      page,
      title: document.title,
      url: window.location.href,
      ...properties,
    })
  }

  // Track user actions
  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...properties,
    })
  }

  // Track e-commerce events
  trackEcommerceEvent(event: string, properties?: Record<string, any>): void {
    this.track(`ecommerce_${event}`, {
      ...properties,
    })
  }

  // Track product views
  trackProductView(productId: string, productName: string, price?: number): void {
    this.trackEcommerceEvent('product_view', {
      product_id: productId,
      product_name: productName,
      price,
    })
  }

  // Track add to cart
  trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1): void {
    this.trackEcommerceEvent('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      total_value: price * quantity,
    })
  }

  // Track purchase
  trackPurchase(orderId: string, total: number, products: Array<{ id: string; name: string; price: number; quantity: number }>): void {
    this.trackEcommerceEvent('purchase', {
      order_id: orderId,
      total_value: total,
      products,
      product_count: products.length,
    })
  }

  // Track customer registration
  trackCustomerRegistration(customerId: string, source?: string): void {
    this.track('customer_registration', {
      customer_id: customerId,
      source,
    })
  }

  // Track customer login
  trackCustomerLogin(customerId: string): void {
    this.track('customer_login', {
      customer_id: customerId,
    })
  }

  // Track search
  trackSearch(query: string, resultsCount: number): void {
    this.track('search', {
      query,
      results_count: resultsCount,
    })
  }

  // Track filter usage
  trackFilterUsage(filterType: string, filterValue: string): void {
    this.track('filter_used', {
      filter_type: filterType,
      filter_value: filterValue,
    })
  }

  // Track export actions
  trackExport(type: string, format: string, recordCount: number): void {
    this.track('data_export', {
      export_type: type,
      format,
      record_count: recordCount,
    })
  }

  // Track dashboard interactions
  trackDashboardInteraction(component: string, action: string, properties?: Record<string, any>): void {
    this.track('dashboard_interaction', {
      component,
      action,
      ...properties,
    })
  }

  // Track error events
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    })
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track('performance', {
      metric,
      value,
      unit,
    })
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) return

    posthog.people.set(properties)
  }

  // Set user identity
  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return

    posthog.identify(userId, properties)
  }

  // Reset user identity
  reset(): void {
    if (!this.isInitialized) return

    posthog.reset()
  }

  // Get user ID
  getUserId(): string | null {
    if (!this.isInitialized) return null

    return posthog.get_distinct_id()
  }

  // Check if user is opted out
  isOptedOut(): boolean {
    if (!this.isInitialized) return false

    return posthog.has_opted_out_capturing()
  }

  // Opt out of tracking
  optOut(): void {
    if (!this.isInitialized) return

    posthog.opt_out_capturing()
  }

  // Opt in to tracking
  optIn(): void {
    if (!this.isInitialized) return

    posthog.opt_in_capturing()
  }

  // Get feature flag value
  getFeatureFlag(flagKey: string): any {
    if (!this.isInitialized) return null

    return posthog.getFeatureFlag(flagKey)
  }

  // Check if feature flag is enabled
  isFeatureEnabled(flagKey: string): boolean {
    if (!this.isInitialized) return false

    return posthog.isFeatureEnabled(flagKey) || false
  }

  // Track feature flag exposure
  trackFeatureFlag(flagKey: string, value: any): void {
    this.track('feature_flag_exposure', {
      flag_key: flagKey,
      flag_value: value,
    })
  }

  // Track A/B test exposure
  trackExperiment(experimentKey: string, variant: string): void {
    this.track('experiment_exposure', {
      experiment_key: experimentKey,
      variant,
    })
  }

  // Track funnel step
  trackFunnelStep(funnelName: string, step: string, stepNumber: number): void {
    this.track('funnel_step', {
      funnel_name: funnelName,
      step,
      step_number: stepNumber,
    })
  }

  // Track cohort analysis
  trackCohortAnalysis(cohortName: string, cohortSize: number, retentionRate: number): void {
    this.track('cohort_analysis', {
      cohort_name: cohortName,
      cohort_size: cohortSize,
      retention_rate: retentionRate,
    })
  }

  // Track revenue events
  trackRevenue(amount: number, currency: string = 'USD', properties?: Record<string, any>): void {
    this.track('revenue', {
      amount,
      currency,
      ...properties,
    })
  }

  // Track customer lifetime value
  trackCustomerLTV(customerId: string, ltv: number): void {
    this.track('customer_ltv', {
      customer_id: customerId,
      lifetime_value: ltv,
    })
  }

  // Track churn events
  trackChurn(customerId: string, reason?: string): void {
    this.track('customer_churn', {
      customer_id: customerId,
      reason,
    })
  }

  // Track inventory events
  trackInventoryEvent(event: string, productId: string, quantity: number, properties?: Record<string, any>): void {
    this.track('inventory_event', {
      event,
      product_id: productId,
      quantity,
      ...properties,
    })
  }

  // Track order events
  trackOrderEvent(event: string, orderId: string, properties?: Record<string, any>): void {
    this.track('order_event', {
      event,
      order_id: orderId,
      ...properties,
    })
  }

  // Track marketing campaign events
  trackCampaignEvent(campaignId: string, campaignName: string, event: string, properties?: Record<string, any>): void {
    this.track('campaign_event', {
      campaign_id: campaignId,
      campaign_name: campaignName,
      event,
      ...properties,
    })
  }

  // Batch track events
  batchTrack(events: PostHogEvent[]): void {
    if (!this.isInitialized) return

    events.forEach(event => {
      this.track(event.event, event.properties)
    })
  }

  // Get session recording status
  isSessionRecordingEnabled(): boolean {
    if (!this.isInitialized) return false

    return posthog.sessionRecordingStarted()
  }

  // Start session recording
  startSessionRecording(): void {
    if (!this.isInitialized) return

    posthog.startSessionRecording()
  }

  // Stop session recording
  stopSessionRecording(): void {
    if (!this.isInitialized) return

    posthog.stopSessionRecording()
  }
}

// Export singleton instance
export const posthogService = PostHogService.getInstance()

// Export convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  posthogService.track(event, properties)
}

export const trackPageView = (page: string, properties?: Record<string, any>) => {
  posthogService.trackPageView(page, properties)
}

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  posthogService.trackUserAction(action, properties)
}

export const trackEcommerceEvent = (event: string, properties?: Record<string, any>) => {
  posthogService.trackEcommerceEvent(event, properties)
}

export const trackDashboardInteraction = (component: string, action: string, properties?: Record<string, any>) => {
  posthogService.trackDashboardInteraction(component, action, properties)
}

export default posthogService 