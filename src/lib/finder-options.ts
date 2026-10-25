/**
 * Opsi finder — data murni tanpa dependensi server, aman diimpor komponen
 * client maupun product-matcher di sisi server.
 */

export const APLIKASI_OPTIONS = [
  { value: 'cold-room', label: 'Cold Room', description: 'Penyimpanan dingin 15–100 m³', icon: 'snowflake' },
  { value: 'freezer', label: 'Freezer', description: 'Beku -18°C ke bawah', icon: 'package' },
  { value: 'supermarket', label: 'Supermarket / Retail', description: 'Showcase, island freezer', icon: 'store' },
  { value: 'chiller', label: 'Chiller / Gedung', description: 'Chiller gedung, hotel, mall', icon: 'building' },
  { value: 'office-ac', label: 'AC Kantor / Komersial', description: 'Split, cassette, duct', icon: 'wind' },
  { value: 'industrial-plant', label: 'Pabrik / Industri', description: 'Proses industri skala besar', icon: 'factory' },
] as const;

export const REFRIGERAN_OPTIONS = [
  'R22', 'R32', 'R134a', 'R290', 'R404A', 'R407C', 'R410A', 'R507', 'R600a', 'R717',
] as const;

export const TIPE_SISTEM_OPTIONS = [
  { value: 'rotary', label: 'Rotary', description: 'AC split residensial' },
  { value: 'twin-rotary', label: 'Twin Rotary', description: 'Kapasitas lebih besar' },
  { value: 'dc-inverter', label: 'DC Inverter', description: 'Hemat energi' },
  { value: 'scroll', label: 'Scroll', description: 'Halus & andal' },
  { value: 'scroll-komersial', label: 'Scroll Komersial', description: 'Rooftop, duct, chiller mini' },
  { value: 'piston-hermetik', label: 'Piston Hermetik', description: 'Sealed, hemat biaya' },
  { value: 'semi-hermetic', label: 'Semi-Hermetic', description: 'Bisa di-overhaul' },
  { value: 'screw', label: 'Screw Industri', description: 'Kapasitas besar 24/7' },
] as const;

export const KAPASITAS_OPTIONS = [
  { value: '1', label: '±1 HP' },
  { value: '2', label: '±2 HP' },
  { value: '3', label: '±3 HP' },
  { value: '5', label: '±5 HP' },
  { value: '10', label: '±10 HP' },
  { value: '20', label: '±20 HP' },
  { value: '50', label: '±50 HP' },
  { value: '100', label: '100+ HP' },
] as const;

export const BUDGET_OPTIONS = [
  { value: 'low', label: 'Ekonomis', description: 'Prioritas harga termurah' },
  { value: 'mid', label: 'Kelas Menengah', description: 'Keseimbangan harga & brand' },
  { value: 'premium', label: 'Premium', description: 'Proyek besar, brand kelas atas' },
] as const;

export type FinderCriteriaPayload = {
  aplikasi: string;
  kapasitas: string;
  refrigeran: string;
  tipeSistem: string;
  budget: string;
  lokasi?: string;
};
