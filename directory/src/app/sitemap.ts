import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { categories, citySlugMap } from '@/data/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  
  // Fetch all providers for individual provider pages
  const { data: providers = [] } = await supabase
    .from('providers')
    .select('slug, updated_at, created_at');

  const baseUrl = 'https://qresolve.com';
  
  // Build sitemap entries
  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Category + City combinations
    ...categories.flatMap(category =>
      [
        'india',
        ...Object.values(citySlugMap),
      ].map(city => ({
        url: `${baseUrl}/${category.slug}/${city}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
    ),
    // Individual provider pages
    ...(providers || []).map(provider => ({
      url: `${baseUrl}/provider/${provider.slug}`,
      lastModified: new Date(provider.updated_at || provider.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  return entries;
}
