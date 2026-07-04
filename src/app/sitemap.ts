import type { MetadataRoute } from 'next';

const baseUrl = 'https://ahorcado.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/pt`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
  ];
}
