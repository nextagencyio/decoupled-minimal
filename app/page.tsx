export const dynamic = 'force-dynamic'

import Header from './components/Header'
import { checkConfiguration } from '../lib/config-check'
import { getClient } from '@/lib/drupal-client'

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
              Then run <code>npx decoupled-cli schema sync</code> to generate typed client.
            </p>
          </div>
        </main>
      </div>
    )
  }

  try {
    const client = getClient()
    const page = await client.getEntryByPath('/')

    const title = page?.title || 'Welcome'
    const bodyHtml = (page as any)?.body?.processed || ''

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
              Your Drupal backend is connected. Create content to see it here.
            </p>
          </div>
        </main>
      </div>
    )
  }
}
