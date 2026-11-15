import type { BrandArticleSeed } from './brand-article-types';
import { groupA } from './group-a';
import { groupB } from './group-b';
import { groupC } from './group-c';
import { groupD } from './group-d';
import { groupE } from './group-e';
import { groupF } from './group-f';
import { groupG } from './group-g';
import { groupH } from './group-h';

export type { BrandArticleSeed } from './brand-article-types';

/**
 * Artikel blog SEO — di-upsert otomatis ke tabel cms_articles oleh
 * ensureBrandArticlesSeeded() di src/lib/cms-db.ts (insert-if-missing, idempoten).
 *
 * Topik yang tersedia (field `topic`, default 'brand'):
 * - brand    : panduan per merek (Bitzer, Copeland, Danfoss, dst.)
 * - kategori : panduan per tipe kompresor (rotary, scroll, screw, dst.)
 * - edukasi  : panduan teknis transversal (cara memilih, perawatan, refrigeran)
 */
export const brandArticles: BrandArticleSeed[] = [
  ...groupA,
  ...groupB,
  ...groupC,
  ...groupD,
  ...groupE,
  ...groupF,
  ...groupG,
  ...groupH,
];
