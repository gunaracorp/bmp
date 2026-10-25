'use client';

/**
 * AiFinderSection — section CTA AI Product Finder + Quote di homepage.
 * Mengarahkan pengunjung B2B ke funnel: finder → quote → WhatsApp.
 */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, ClipboardList, GitCompareArrows, Sparkles } from 'lucide-react';

export function AiFinderSection() {
  return (
    <section aria-labelledby="ai-finder-heading" className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-800 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14"
      >
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-10 size-72 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-200 backdrop-blur">
              <Sparkles aria-hidden="true" className="size-3.5" /> Baru · AI Product Finder
            </span>
            <h2 id="ai-finder-heading" className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Jangan browsing ribuan produk.
              <span className="block text-emerald-300">Biarkan AI mencocokkannya.</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-teal-100 sm:text-base">
              Jawab 5 pertanyaan tentang aplikasi, kapasitas, dan refrigeran — dapatkan 3–5 rekomendasi
              kompresor paling cocok lengkap dengan estimasi harga distributor, lalu kirim quote langsung
              ke WhatsApp sales.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/ai-katalog"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-teal-900 shadow-lg transition hover:bg-emerald-50"
                >
                  <BrainCircuit aria-hidden="true" className="size-5" /> Coba AI Product Finder
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/quote"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <ClipboardList aria-hidden="true" className="size-5" /> Buat Quote
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/compare"
                  className="inline-flex h-12 items-center gap-2 rounded-xl px-4 font-semibold text-emerald-200 transition hover:text-white"
                >
                  <GitCompareArrows aria-hidden="true" className="size-5" /> Bandingkan produk <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Ilustrasi flow */}
          <div className="relative">
            <ol className="flex flex-col gap-3">
              {[
                { step: '1', title: 'Cari produk yang cocok', desc: '5 pertanyaan singkat, hasil dalam hitungan detik', href: '/ai-katalog', icon: BrainCircuit },
                { step: '2', title: 'Buat quote Anda', desc: 'Atur jumlah unit & instalasi, estimasi real-time', href: '/quote', icon: ClipboardList },
                { step: '3', title: 'Kirim ke WhatsApp', desc: 'Sales menindaklanjuti dengan penawaran resmi', href: '/quote', icon: ArrowRight },
              ].map((item) => (
                <li key={item.step}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-emerald-300/40 hover:bg-white/10"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 font-extrabold text-emerald-200">
                      {item.step}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-white">{item.title}</span>
                      <span className="block truncate text-xs text-teal-200">{item.desc}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-emerald-300 transition group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
