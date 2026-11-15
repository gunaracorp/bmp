import type { MetadataRoute } from 'next';
import { getPublishedArticleSlugs, getPublishedCatalogSlugs, getPublicCategories } from '@/lib/cms-db';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.berkatmandiripendingin.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, products, categories] = await Promise.all([
    getPublishedArticleSlugs(),
    getPublishedCatalogSlugs(),
    getPublicCategories(),
  ]);
  const lastModified = products.reduce<Date | null>((latest, item) => {
    if (item.updatedAt && (!latest || item.updatedAt > latest)) return item.updatedAt;
    return latest;
  }, null);
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/produk`, changeFrequency: 'daily', priority: 0.9 },
    ...categories.map(({ slug }) => ({
      url: `${SITE_URL}/produk/kategori/${slug}`,
      lastModified: lastModified ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    { url: `${SITE_URL}/ai-katalog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/insights`, changeFrequency: 'daily', priority: 0.8 },
    ...products.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/produk/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...articles.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/insights/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
