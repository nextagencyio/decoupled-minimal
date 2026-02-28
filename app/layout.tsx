import './globals.css'
import ApolloProvider from './components/providers/ApolloProvider'
import { Viewport, type Metadata } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  const port = process.env.PORT || '3000'
  const host = process.env.HOST || 'localhost'
  return `http://${host}:${port}`
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Decoupled Drupal',
    template: '%s | Decoupled Drupal'
  },
  description: 'A minimal headless Drupal starter with Next.js and GraphQL.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ApolloProvider>
          {children}
        </ApolloProvider>
      </body>
    </html>
  )
}
