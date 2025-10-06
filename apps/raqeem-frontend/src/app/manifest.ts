import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'raqeem',
    short_name: 'raqeem',
    description: 'my pwa app',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/raqeem-icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/raqeem-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
