# CLAUDE.md - End-to-End Content Type Development Guide

This document provides Claude Code with comprehensive instructions for building complete content type implementations from frontend to backend in this Drupal-Next.js project.

## Project Overview

**Architecture**: Headless Drupal backend with Next.js frontend
**Backend**: Drupal 11 with GraphQL Compose and DC Import API
**Frontend**: Next.js 16 with TypeScript, Tailwind CSS, and Apollo GraphQL
**Template**: Minimal starter — no demo mode, no sample components

## Environment Configuration

**Environment Variables (`.env.local`):**
- `NEXT_PUBLIC_DRUPAL_BASE_URL` - Drupal backend URL
- `DRUPAL_CLIENT_ID` - OAuth client ID for API authentication
- `DRUPAL_CLIENT_SECRET` - OAuth client secret for API authentication
- `DRUPAL_REVALIDATE_SECRET` - Secret for on-demand revalidation
- `NODE_TLS_REJECT_UNAUTHORIZED=0` - Allow self-signed certificates (development)

## Project Structure

```
app/
  layout.tsx              # Root layout with ApolloProvider
  page.tsx                # Homepage (fetches / route from Drupal)
  loading.tsx             # Loading skeleton
  [...slug]/page.tsx      # Dynamic pages (any Drupal content)
  api/
    graphql/route.ts      # GraphQL proxy with OAuth token caching
    revalidate/route.ts   # ISR revalidation endpoint
    proxy/sites/          # Drupal asset proxy
  components/
    Header.tsx            # Minimal header (customize this)
    ResponsiveImage.tsx   # Next.js Image wrapper for Drupal
    ErrorBoundary.tsx     # React error boundary
    providers/
      ApolloProvider.tsx  # Apollo GraphQL provider
lib/
  apollo-client.ts        # Apollo client factory (server + client)
  queries.ts              # GraphQL queries (GET_NODE_BY_PATH)
  types.ts                # TypeScript interfaces
  config-check.ts         # Environment variable validation
  image-utils.ts          # Image proxy utilities
```

## MCP Tools for Space Management

This project is designed to work with AI assistants (Claude Code, Cursor) via the Model Context Protocol (MCP). All space and content operations are performed through MCP tools.

### Available MCP Tools

**Space Management:**
- `list_spaces()` - List all Drupal spaces in your organization
- `get_space({ id: SPACE_ID })` - Get detailed space information
- `create_space({ name: "My Space", type: "starter" })` - Create a new space (types: starter, growth)
- `clone_space({ id: SPACE_ID, name: "Clone Name" })` - Clone an existing space
- `delete_space({ id: SPACE_ID })` - Permanently delete a space

**Content Management:**
- `import_content({ spaceId: SPACE_ID, content: {...} })` - Import content types and data
- `get_import_example()` - Get the correct JSON format for content import

**Credentials & Utilities:**
- `get_oauth_credentials({ spaceId: SPACE_ID })` - Get OAuth credentials for `.env.local`
- `get_login_link({ spaceId: SPACE_ID })` - Get one-time admin login URL
- `get_usage()` - Get organization-wide usage statistics
- `get_space_usage({ id: SPACE_ID })` - Get space-specific usage
- `get_organization()` - Get organization details

### Obtaining OAuth Credentials

**Using MCP Tool (Recommended):**
```
get_oauth_credentials({ spaceId: YOUR_SPACE_ID })
```
This returns the complete `.env.local` configuration including `DRUPAL_CLIENT_ID`, `DRUPAL_CLIENT_SECRET`, and `DRUPAL_REVALIDATE_SECRET`.

**Manual from Drupal Admin:**
1. Get a login link: `get_login_link({ spaceId: YOUR_SPACE_ID })`
2. Navigate to Configuration > Simple OAuth > Clients
3. Create a new OAuth client or copy existing credentials

## End-to-End Development Workflow

When asked to create a new content type (e.g., "create a product page"), follow these steps:

### 1. Content Analysis & Planning

**Analyze the request and determine:**
- Content type name and machine name
- Required fields and their types
- Frontend components needed
- URL structure and routing
- Display requirements (listing, detail pages, etc.)

**Create a todo list for tracking progress:**
```markdown
1. Get OAuth credentials via MCP: get_oauth_credentials({ spaceId: SPACE_ID })
2. Create DC Import JSON for [content_type] using get_import_example()
3. Import content type via MCP: import_content({ spaceId: SPACE_ID, content: {...} })
4. Create TypeScript types and GraphQL queries
5. Build frontend components ([ContentCard], [ContentRenderer])
6. Create listing and detail pages
7. Update dynamic routing in [...slug]/page.tsx
8. Update Header.tsx navigation
9. Test build process and fix errors
10. Validate end-to-end functionality
```

### 0. MCP Setup Verification

**Before starting development, verify MCP access:**
1. List available spaces: `list_spaces()`
2. Get your space details: `get_space({ id: SPACE_ID })`
3. Get OAuth credentials: `get_oauth_credentials({ spaceId: SPACE_ID })`
4. Update `.env.local` with the returned credentials

### 2. DC Import JSON Creation

**Get example format via MCP:**
```
get_import_example()
```

**Use this JSON structure:**

```json
{
  "model": [
    {
      "bundle": "content_type_name",
      "description": "Description of the content type",
      "label": "Content Type Label",
      "body": true,
      "fields": [
        {
          "id": "field_name",
          "label": "Field Label",
          "type": "text|string|image|datetime|bool|text[]"
        }
      ]
    }
  ],
  "content": [
    {
      "id": "item1",
      "type": "node.content_type_name",
      "path": "/content-type/item-slug",
      "values": {
        "title": "Item Title",
        "body": "<p>Body content</p>",
        "field_name": "field_value"
      }
    }
  ]
}
```

**Field Type Reference:**
- `text` - Long text with formatting
- `string` - Short plain text (max 255 chars)
- `image` - Image upload
- `datetime` - Date and time
- `bool` - Boolean true/false
- `text[]` - Multiple text values
- `string[]` - Multiple string values

**Important Notes:**
- Field IDs become `field_[id]` in Drupal (e.g., `"id": "price"` > `field_price`)
- **CRITICAL**: In content values, use the field ID directly without "field_" prefix (e.g., `"price": "$299.99"` NOT `"field_price": "$299.99"`)
- Use `"body": true` to include standard body field
- Always include sample content for testing
- Path aliases should follow `/content-type/slug` pattern
- **For image fields**: Use real, externally-hosted image URLs (e.g., Unsplash), NOT Drupal placeholder paths

### 3. Import via MCP

**Import Content Type:**
```
import_content({
  spaceId: YOUR_SPACE_ID,
  content: {
    "model": [...],
    "content": [...]
  }
})
```

**Preview before importing:**
```
import_content({
  spaceId: YOUR_SPACE_ID,
  content: {...},
  preview: true
})
```

**Always check the response for success and note:**
- Content type machine name (may differ from input)
- Field machine names (auto-generated)
- Node IDs created
- GraphQL schema updates
- **Important**: GraphQL field names may differ from DC field IDs (check actual schema)

### 4. Frontend Implementation

#### GraphQL Queries

**Add to `lib/queries.ts`:**
```typescript
// Add a listing query for new content types
export const GET_CONTENT_TYPES = gql`
  query GetContentTypes($first: Int = 10) {
    node[ContentType]s(first: $first, sortKey: CREATED_AT) {
      nodes {
        id
        title
        path
        created { timestamp }
        changed { timestamp }
        ... on Node[ContentType] {
          body { processed }
          // Add all fields
        }
      }
    }
  }
`
```

**Update `GET_NODE_BY_PATH` to include new content type:**
```typescript
... on Node[ContentType] {
  id
  title
  body { processed }
  // Add all fields
}
```

#### TypeScript Types

**Add to `lib/types.ts`:**
```typescript
export interface Drupal[ContentType] extends DrupalNode {
  body?: { processed: string }
  // Add all fields with proper types
}
```

#### Component Templates

**Card Component (`app/components/[ContentType]Card.tsx`):**
```typescript
import Link from 'next/link'
import { Drupal[ContentType] } from '@/lib/types'

export default function [ContentType]Card({ item }: { item: Drupal[ContentType] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
        {/* Add field displays */}
        <Link
          href={item.path || `#`}
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}
```

#### Create Listing Page

**Create `app/[content-type]/page.tsx`:**
```typescript
import Header from '../components/Header'
import [ContentType]Card from '../components/[ContentType]Card'
import { headers } from 'next/headers'
import { GET_CONTENT_TYPES } from '@/lib/queries'
import { getServerApolloClient } from '@/lib/apollo-client'

export const revalidate = 300

export default async function [ContentType]sPage() {
  const apollo = getServerApolloClient(await headers())

  try {
    const { data } = await apollo.query({
      query: GET_CONTENT_TYPES,
      variables: { first: 20 },
      fetchPolicy: 'no-cache'
    })

    const items = data?.node[ContentType]s?.nodes || []

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">[Content Types]</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <[ContentType]Card key={item.id} item={item} />
            ))}
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading [content types]:', error)
    return <div>Error loading content</div>
  }
}
```

#### Update Dynamic Routing

**Update `app/[...slug]/page.tsx`** to handle new content types in the rendering logic.

#### Update Navigation

**Update `app/components/Header.tsx`** to add navigation links for new content types.

### 5. Build and Test

```bash
npm run build    # Validates TypeScript and builds
npm run dev      # Test in development
```

**Common Issue: Changes not appearing in browser**
1. Kill the existing dev server: `pkill -f "next dev"`
2. Clear the cache: `rm -rf .next`
3. Restart: `npm run dev`

## Common Content Type Patterns

### E-commerce Product
```json
{
  "id": "price",
  "label": "Price",
  "type": "string"
},
{
  "id": "product_images",
  "label": "Product Images",
  "type": "image[]"
},
{
  "id": "in_stock",
  "label": "In Stock",
  "type": "bool"
},
{
  "id": "features",
  "label": "Key Features",
  "type": "string[]"
}
```

### Event/Conference
```json
{
  "id": "event_date",
  "label": "Event Date",
  "type": "datetime"
},
{
  "id": "location",
  "label": "Location",
  "type": "string"
},
{
  "id": "speakers",
  "label": "Speakers",
  "type": "string[]"
}
```

### Team Member
```json
{
  "id": "position",
  "label": "Position",
  "type": "string"
},
{
  "id": "profile_image",
  "label": "Profile Image",
  "type": "image"
},
{
  "id": "bio",
  "label": "Biography",
  "type": "text"
}
```

## Key Learnings and Common Mistakes

### DC Import Format Issues

**Problem**: Field values incorrectly formatted with "field_" prefix
```json
// WRONG
"values": { "field_price": "$299.99" }

// CORRECT
"values": { "price": "$299.99" }
```

### GraphQL Field Name Mapping

**Problem**: Assuming GraphQL field names match DC field IDs
```
DC field: in_stock     -> GraphQL: inStock (camelCase)
DC field: product_images -> GraphQL: productImages (camelCase)
```

**Solution**: Always verify GraphQL field names by testing a query against the Drupal GraphQL endpoint or checking the API response.

### GraphQL Field Value Structure

DC imports create simple value fields, not objects:
```typescript
// WRONG
fieldPrice?: { processed: string }

// CORRECT
price?: string
features?: string[]
```

### HTML Content Rendering

```jsx
// WRONG - Shows raw HTML tags
<span>{field.processed}</span>

// CORRECT - Renders HTML properly
<span dangerouslySetInnerHTML={{ __html: field.processed }} />
```

**Better**: Use `string[]` instead of `text[]` for simple lists to avoid HTML rendering complexity.

### Field Type Selection Best Practices

- `string[]` for bullet points, features, tags (clean plain text)
- `text[]` only when you need rich formatting within each item (rare)
- `text` for rich content descriptions that need HTML formatting
- `string` for simple values like price, SKU, names (max 255 chars)

### NEVER Use "status" as a Field ID

`"status"` conflicts with Drupal's built-in publication status field. All imported content will be unpublished. Use alternatives like `judge_status`, `employment_status`, etc.

**Other Reserved Field Names to Avoid:**
- `status` - Publication status
- `title` - Node title (handled automatically)
- `created` - Creation timestamp
- `changed` - Last modified timestamp
- `uid` - Author user ID
- `langcode` - Language code

### NEVER Use Drupal Placeholder for Image Fields

Always use real, externally-hosted image URLs (e.g., Unsplash). Verify each URL returns HTTP 200:
```bash
curl -s -o /dev/null -w "%{http_code}" "https://images.unsplash.com/photo-XXXX?w=800&q=80"
```

### Parallelize Space Provisioning with Frontend Work

Newly created spaces take 90-100 seconds to provision. Use that time to:
- Write the import JSON
- Create TypeScript types and interfaces
- Scaffold components and pages
- Prepare GraphQL queries

Wait until after provisioning for:
- `.env.local` credential updates
- Content import
- Build and runtime testing

## Troubleshooting

### Common Issues

**1. DC Import Fails**
- Use `get_import_example()` to verify correct JSON format
- Ensure field IDs don't start with `field_`
- Check space status with `get_space({ id: SPACE_ID })`

**2. GraphQL Errors**
- Check if content type was created successfully in Drupal
- Verify GraphQL Compose configuration via admin
- Clear GraphQL cache in Drupal admin

**3. Build Errors**
- Check TypeScript type definitions match actual GraphQL schema
- Ensure all imports are correct
- Verify GraphQL query syntax

**4. Content Not Displaying**
- Check GraphQL query field names match Drupal fields (may not match DC field IDs)
- Verify content was created and published
- For HTML content showing raw tags, use `dangerouslySetInnerHTML`

### Debug Commands

**MCP Tools for Debugging:**
```
list_spaces()
get_space({ id: SPACE_ID })
get_login_link({ spaceId: SPACE_ID })
import_content({ spaceId: SPACE_ID, content: {...}, preview: true })
```

**Local Development Commands:**
```bash
npm run build    # Validate TypeScript
npm run dev      # Start dev server
```

## Best Practices

1. **Always create sample content** during import for immediate testing
2. **Use descriptive field names** that are clear and consistent
3. **Follow existing naming conventions** in the codebase
4. **Test responsive design** on different screen sizes
5. **Handle empty/missing data gracefully** in components
6. **Use semantic HTML** for accessibility
7. **Include proper TypeScript types** for all data structures
8. **Use `dangerouslySetInnerHTML`** for processed HTML content from Drupal
9. **Verify GraphQL field names** match actual schema, not DC field IDs
10. **Verify all external image URLs** return HTTP 200 before completing

## Success Criteria

A successful end-to-end implementation should:
- [ ] Build without errors (`npm run build`)
- [ ] Display content correctly on listing and detail pages
- [ ] Handle navigation between pages
- [ ] Render responsively on all device sizes
- [ ] Show appropriate fallbacks for missing data
- [ ] Follow the established design patterns
- [ ] Work with the existing authentication and routing system
