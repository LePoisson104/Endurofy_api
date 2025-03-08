export interface LimiterConfig {
  windowMs: number; // The time window for rate limiting (in milliseconds)
  max: number; // The max number of requests allowed within the window
  duration: string; // The message describing the duration of the rate limiting
}
