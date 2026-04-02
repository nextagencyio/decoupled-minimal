# CLAUDE.md - Decoupled Minimal Starter

Minimal headless Drupal + Next.js starter using `decoupled-client` for type-safe Drupal queries.

## Quick Start

```bash
npm install
cp .env.example .env.local     # Fill in Drupal credentials
npm run sync-schema             # Generate typed client from Drupal schema
npm run build && npm start
```

## Architecture

```
app/
  page.tsx                      Homepage (fetches / from Drupal)
  [...slug]/page.tsx            Catch-all (any Drupal path)
  layout.tsx                    Root layout
  loading.tsx                   Loading skeleton
  components/
    Header.tsx                  Minimal header
    ResponsiveImage.tsx         Image wrapper for Drupal assets
    ErrorBoundary.tsx           React error boundary
  api/
    graphql/route.ts            GraphQL proxy with OAuth
    revalidate/route.ts         ISR revalidation webhook
    proxy/sites/[...path]/      Drupal asset proxy

lib/
  drupal-client.ts              getClient() → TypedClient
  config-check.ts               Environment validation
  image-utils.ts                Image URL helpers

schema/
  client.ts                     Auto-generated typed client (run sync-schema)
```

## Typed Client

All data fetching uses `decoupled-client` with auto-generated types.

### After connecting to a Drupal space:

```bash
npm run sync-schema    # Generates schema/client.ts with types + queries
```

### Usage in pages:

```typescript
import { getClient } from '@/lib/drupal-client'

const client = getClient()
const page = await client.getEntryByPath('/about')
const articles = await client.getEntries('NodeArticle', { first: 10 })
```

### Adding a new content type:

1. Create the content type in Drupal (admin UI or `import_content` MCP tool)
2. Run `npm run sync-schema`
3. Use the new typed interface: `client.getEntries('NodeEvent')`

## Environment Variables

```env
NEXT_PUBLIC_DRUPAL_BASE_URL=https://your-space.decoupled.website
DRUPAL_CLIENT_ID=your-client-id
DRUPAL_CLIENT_SECRET=your-client-secret
DRUPAL_REVALIDATE_SECRET=your-revalidate-secret
```

## MCP Tools

Use with Claude Code, Cursor, or any MCP client:

```
create_space({ name: "My Site" })
import_content({ spaceId: 123, content: {...} })
get_oauth_credentials({ spaceId: 123 })
integrate_frontend({ spaceId: 123, framework: "nextjs" })
```

## Key Differences from decoupled-components

- No paragraph/section system — renders individual content types
- No Puck visual editor
- No demo mode
- Bare minimum dependencies
- Meant as a starting point, not a showcase
