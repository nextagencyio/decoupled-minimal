/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.decoupled.website',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**.decoupled.website',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'template.localhost',
        port: '8888',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      // Proxy Drupal file assets through API route to handle SSL
      {
        source: '/sites/:path*',
        destination: '/api/proxy/sites/:path*',
      },
    ]
  },
}

module.exports = nextConfig
