import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RTVT - Real-Time Voice Translator',
    short_name: 'RTVT',
    description: 'A comprehensive multilingual voice translation application with real-time speech recognition, text-to-speech, image analysis, and dictionary functionality.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3182ce',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ],
    categories: ['productivity', 'education', 'utilities']
  }
}
