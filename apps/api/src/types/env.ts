/**
 * Cloudflare Workers environment bindings for apps/api.
 *
 * Add new bindings here AND in wrangler.jsonc.
 * The Hono app is typed with: new Hono<{ Bindings: Env }>()
 */
export interface Env {
  /** Cloudflare D1 database binding */
  DB: D1Database;
  /** Cloudflare R2 bucket binding for book assets */
  BUKOO_STORAGE: R2Bucket;
  /** Cloudflare Workers AI binding */
  AI: Ai;
  /** JWT signing secret — set via: wrangler secret put JWT_SECRET */
  JWT_SECRET: string;
  /** Google OAuth client ID for OIDC token verification */
  GOOGLE_CLIENT_ID: string;
  /** Apple client ID for Sign-in with Apple OIDC verification */
  APPLE_CLIENT_ID: string;
  /** MailChannels API key for transactional email */
  MAILCHANNELS_API_KEY: string;
  /** Sender email address for transactional email */
  MAIL_FROM?: string;
}
