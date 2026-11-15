import type { BrandArticleSeed } from './brand-article-types';
import { groupA } from './group-a';
import { groupB } from './group-b';
import { groupC } from './group-c';
import { groupD } from './group-d';

export type { BrandArticleSeed };

/**
 * Artikel blog SEO per brand kompresor — di-upsert otomatis ke tabel cms_articles
 * oleh ensureBrandArticlesSeeded() di src/lib/cms-db.ts (insert-if-missing, idempoten).
 */
export const brandArticles: BrandArticleSeed[] = [...groupA, ...groupB, ...groupC, ...groupD];
