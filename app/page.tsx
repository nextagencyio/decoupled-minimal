import Header from './components/Header'
import { headers } from 'next/headers'
import { getServerApolloClient } from '../lib/apollo-client'
import { GET_NODE_BY_PATH } from '../lib/queries'
import { checkConfiguration } from '../lib/config-check'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

export default async function Home() {
  const configStatus = checkConfiguration()

  if (!configStatus.isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h1>
            <p className="text-gray-600 mb-6">
              Configure your environment variables to connect to your Drupal backend.
            </p>
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Missing variables:</p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {configStatus.missingVars.map((v) => (
                  <li key={v}><code>{v}</code></li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Copy <code>.env.example</code> to <code>.env.local</code> and fill in your Drupal credentials.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const requestHeaders = await headers()
  const apolloClient = getServerApolloClient(requestHeaders)

  try {
    const { data } = await apolloClient.query({
      query: GET_NODE_BY_PATH,
      variables: { path: '/' },
      fetchPolicy: 'cache-first',
    })

    const entity = data?.route?.entity
    const title = entity?.title || 'Welcome'
    const bodyHtml = entity?.body?.processed || ''

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <article className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{title}</h1>
            {bodyHtml && (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}
          </article>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error fetching homepage:', error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome</h1>
            <p className="text-gray-600">
              Your Drupal backend is connected. Create a homepage node to see content here.
            </p>
          </div>
        </main>
      </div>
    )
  }
}
