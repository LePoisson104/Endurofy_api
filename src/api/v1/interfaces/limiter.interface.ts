/**
 * Configuration for rate limiting middleware
 */
export interface LimiterConfig {
  /** The time window for rate limiting (in milliseconds) */
  windowMs: number;

  /** The maximum number of requests allowed within the window */
  max: number;

  /** Human-readable description of the rate limit duration (e.g., "15 minutes") */
  duration: string;

  /** Optional message to show when rate limit is exceeded */
  message?: string;

  /** Optional key generator function to identify requests */
  keyGenerator?: (req: Request) => string;

  /** Whether to skip failed requests (default: false) */
  skipFailedRequests?: boolean;

  /** Whether to skip successful requests (default: false) */
  skipSuccessfulRequests?: boolean;
}
