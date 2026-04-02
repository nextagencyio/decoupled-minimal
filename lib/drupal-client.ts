/**
 * Drupal client singleton using decoupled-client.
 *
 * Usage:
 *   import { getClient } from '@/lib/drupal-client'
 *   const client = getClient()
 *   const page = await client.getEntryByPath('/about')
 */

import { createClient } from 'decoupled-client'
import type { TypedClient } from '@/schema/client'

let _client: TypedClient | null = null

export function getClient(): TypedClient {
  if (_client) return _client

  // Try loading the generated typed client
  let createTypedClient: ((base: any) => TypedClient) | null = null
  try {
    createTypedClient = require('@/schema/client').createTypedClient
  } catch {
    // schema/client.ts not generated yet — fall back to raw client
  }

  const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL
  const clientId = process.env.DRUPAL_CLIENT_ID
  const clientSecret = process.env.DRUPAL_CLIENT_SECRET

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error('Missing Drupal credentials. Set NEXT_PUBLIC_DRUPAL_BASE_URL, DRUPAL_CLIENT_ID, DRUPAL_CLIENT_SECRET.')
  }

  const base = createClient({
    baseUrl,
    clientId,
    clientSecret,
    fetch: ((input: RequestInfo | URL, init?: RequestInit) =>
      globalThis.fetch(input, {
        ...init,
        next: { tags: ['drupal'] },
      } as RequestInit)) as typeof globalThis.fetch,
  })

  if (createTypedClient) {
    _client = createTypedClient(base)
  } else {
    // Minimal fallback — raw queries only
    _client = {
      async getEntries() { return [] },
      async getEntry() { return null },
      async getEntryByPath(path) {
        return base.queryByPath(path, `
          query ($path: String!) {
            route(path: $path) {
              ... on RouteInternal {
                entity {
                  ... on NodePage { __typename id title path body { processed } }
                }
              }
            }
          }
        `)
      },
      async raw(query, variables) { return base.query(query, variables) },
    } as TypedClient
  }

  return _client
}
