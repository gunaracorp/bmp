/**
 * Test product matcher — beberapa skenario kriteria B2B HVAC.
 */
import { findMatchingProducts, criteriaSummaryLabel, type FinderCriteria } from '../src/lib/product-matcher';

async function main() {
  const scenarios: FinderCriteria[] = [
    { aplikasi: 'cold-room', kapasitas: '2', refrigeran: 'R404A', tipeSistem: 'semi-hermetic', budget: 'mid', lokasi: 'Bekasi' },
    { aplikasi: 'office-ac', kapasitas: '1', refrigeran: 'R32', tipeSistem: 'rotary', budget: 'low', lokasi: 'Jakarta' },
    { aplikasi: 'chiller', kapasitas: '50', refrigeran: 'R134a', tipeSistem: 'screw', budget: 'premium', lokasi: 'Surabaya' },
    { aplikasi: 'freezer', kapasitas: '10', refrigeran: 'R404A', tipeSistem: 'scroll', budget: 'mid' },
  ];

  for (const criteria of scenarios) {
    console.log(`\n=== ${criteriaSummaryLabel(criteria)} ===`);
    const items = await findMatchingProducts(criteria, 5);
    for (const item of items) {
      console.log(` [${item.compatibilityScore}] ${item.name} — ${item.priceEstimate} (${item.brand})`);
      console.log(`    ${item.reason}`);
      console.log(`    badges: ${item.badges.join(', ') || '-'} | refr: ${item.specs.refrigerant} | ${item.specs.kapasitasHp} HP`);
    }
    if (items.length === 0) console.log(' (tidak ada hasil)');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
