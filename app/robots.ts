import { MetadataRoute } from 'next'

const BASE_URL = 'https://upswipe.capsops.fr'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/candidat/',
          '/onboarding/',
          '/recruteur/',
          '/swipe/',
          '/matches/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
