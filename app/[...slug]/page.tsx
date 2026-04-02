export const dynamic = 'force-dynamic'

import Header from '../components/Header'
import ErrorBoundary from '../components/ErrorBoundary'
import ResponsiveImage from '../components/ResponsiveImage'
import { Metadata } from 'next'
import { getClient } from '@/lib/drupal-client'

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params
  const path = `/${(resolvedParams.slug || []).join('/')}`
  try {
    const client = getClient()
    const page = await client.getEntryByPath(path)
    return { title: page?.title || 'Page' }
  } catch {
    return { title: 'Page' }
  }
}

function PageNotFound({ path }: { path: string }) {
  return (
    <div className="text-center py-16">
      <div className="bg-white rounded-lg shadow-sm p-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-2">We couldn&#39;t find any content at this path.</p>
        <p className="text-sm text-gray-500">Path: {path}</p>
      </div>
    </div>
  )
}

export default async function GenericPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  const path = `/${(resolvedParams.slug || []).join('/')}`

  try {
    const client = getClient()
    const entity = await client.getEntryByPath(path)

    if (!entity) {
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageNotFound path={path} />
          </main>
        </div>
      )
    }

    const title = entity.title || 'Untitled'
    const bodyHtml = (entity as any)?.body?.processed || ''
    const image = (entity as any)?.image

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <ErrorBoundary>
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {image && (
                <ResponsiveImage
                  image={image}
                  alt={image.alt || title}
                  context="hero"
                  className="rounded-t-lg"
                  maxHeight="60vh"
                  priority={true}
                />
              )}
              <div className="p-6 md:p-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">{title}</h1>
                {bodyHtml && (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                )}
              </div>
            </article>
          </ErrorBoundary>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading page:', error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageNotFound path={path} />
        </main>
      </div>
    )
  }
}
