import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare adapter config for apps/web.
 *
 * Defaults are used: the Next build output is adapted to a Cloudflare Worker
 * (`.open-next/worker.js`) with static assets in `.open-next/assets` — both
 * referenced by `wrangler.jsonc`.
 */
export default defineCloudflareConfig();
