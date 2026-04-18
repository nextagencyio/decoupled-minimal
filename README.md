# Decoupled Minimal

A barebones Next.js starter for headless Drupal with GraphQL. No demo mode, no sample components — just the core infrastructure you need to start building.

## What's Included

- **Type-safe Drupal client** via [`decoupled-client`](https://www.npmjs.com/package/decoupled-client) — full autocomplete on content types + fields, generated from your GraphQL schema.
- **GraphQL proxy** (`/api/graphql`) with OAuth token caching.
- **On-demand revalidation** (`/api/revalidate`) with `revalidateTag` + `revalidatePath`.
- **Asset proxy** (`/api/proxy/sites/...`) for Drupal file assets.
- **Dynamic routing** (`/[...slug]`) — renders any Drupal page or article.
- **Tailwind CSS** with typography plugin.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template and fill in your Drupal credentials
cp .env.example .env.local

# Generate the typed client from your Drupal GraphQL schema
npm run sync-schema

# Start development server
npm run dev
```

> The fastest way to get `.env.local` populated is:
> `npx decoupled-cli@latest spaces env <space-id> --write .env.local`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_DRUPAL_BASE_URL` | Yes | Your Drupal site URL |
| `DRUPAL_CLIENT_ID` | Yes | OAuth client ID |
| `DRUPAL_CLIENT_SECRET` | Yes | OAuth client secret |
| `DRUPAL_REVALIDATE_SECRET` | Yes | Secret for revalidation endpoint |
| `NEXT_PUBLIC_SITE_URL` | No | Explicit site URL for metadata |

## Project Structure

```
app/
  layout.tsx              # Root layout
  page.tsx                # Homepage (fetches / route from Drupal)
  loading.tsx             # Loading skeleton
  [...slug]/page.tsx      # Dynamic pages (any Drupal content)
  api/
    graphql/route.ts      # GraphQL proxy with OAuth
    revalidate/route.ts   # ISR revalidation endpoint
    proxy/sites/          # Drupal asset proxy
  components/
    Header.tsx            # Minimal header (customize this)
    ResponsiveImage.tsx   # Next.js Image wrapper for Drupal
    ErrorBoundary.tsx     # React error boundary
lib/
  drupal-client.ts        # Typed client singleton (decoupled-client)
  config-check.ts         # Environment variable validation
  image-utils.ts          # Image proxy utilities
schema/
  client.ts               # Auto-generated typed client — re-run
                          # `npm run sync-schema` after Drupal model changes.
```

## Adding Pages

All Drupal pages are automatically available via the `[...slug]` catch-all route. Create content in Drupal and it will be rendered at its path.

## Adding Content Types or Fields

1. Add the content type / field in Drupal (use `decoupled-cli spaces content-import` or the dashboard).
2. Re-run `npm run sync-schema` — this regenerates `schema/client.ts`.
3. The new type + its fields are immediately available with full autocomplete via `getClient().getEntries('NodeXxx', ...)` / `getEntryByPath('/path')`.
