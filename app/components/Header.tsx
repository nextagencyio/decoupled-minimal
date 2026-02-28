'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">
            Decoupled Minimal
          </Link>
          {/* Add your navigation links here */}
        </div>
      </div>
    </header>
  )
}
