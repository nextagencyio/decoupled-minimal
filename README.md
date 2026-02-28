# Decoupled Minimal

A barebones Next.js starter for headless Drupal with GraphQL. No demo mode, no sample components — just the core infrastructure you need to start building.

## What's Included

- **GraphQL proxy** (`/api/graphql`) with OAuth token caching
- **On-demand revalidation** (`/api/revalidate`) with `revalidateTag` + `revalidatePath`
- **Asset proxy** (`/api/proxy/sites/...`) for Drupal file assets
- **Apollo Client** configured for both server (ISR) and client usage
- **Dynamic routing** (`/[...slug]`) — renders any Drupal page or article
- **Tailwind CSS** with typography plugin

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template and fill in your Drupal credentials
cp .env.example .env.local

# Start development server
npm run dev
```

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
  layout.tsx              # Root layout with ApolloProvider
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
    providers/
      ApolloProvider.tsx  # Apollo GraphQL provider
lib/
  apollo-client.ts        # Apollo client factory
  queries.ts              # GraphQL queries
  types.ts                # TypeScript interfaces
  config-check.ts         # Environment variable validation
  image-utils.ts          # Image proxy utilities
```

## Adding Pages

All Drupal pages are automatically available via the `[...slug]` catch-all route. Create content in Drupal and it will be rendered at its path.

To add custom queries or content types, edit `lib/queries.ts` and `lib/types.ts`.
