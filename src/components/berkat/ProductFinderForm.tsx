'use client';

/**
 * ProductFinderForm — wizard AI Product Finder 5 pertanyaan.
 * Alur: pilih kebutuhan → POST /api/ai-recommend → hasil tersimpan di
 * sessionStorage → redirect ke /ai-katalog/hasil.
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Building2, Factory, Loader2, MapPin,
  Package, RotateCcw, Snowflake, Store, Wind,
} from 'lucide-react';
import {
  APLIKASI_OPTIONS, BUDGET_OPTIONS, KAPASITAS_OPTIONS,
  REFRIGERAN_OPTIONS, TIPE_SISTEM_OPTIONS,
} from '@/lib/finder-options';

const APLIKASI_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  snowflake: Snowflake,
  package: Package,
  store: Store,
  building: Building2,
  wind: Wind,
  factory: Factory,
};

export const FINDER_RESULT_KEY = 'bmp-finder-result';

const STEPS = [
  { key: 'aplikasi', title: 'Aplikasi apa yang Anda bangun?' },
  { key: 'kapasitas', title: 'Berapa kapasitas yang dibutuhkan?' },
  { key: 'refrigeran', title: 'Refrigeran apa yang dipakai?' },
  { key: 'tipeSistem', title: 'Tipe sistem kompresor?' },
  { key: 'budget', title: 'Budget & lokasi proyek?' },
] as const;

type Answers = {
  aplikasi: string;
  kapasitas: string;
  refrigeran: string;
  tipeSistem: string;
  budget: string;
  lokasi: string;
};

const EMPTY_ANSWERS: Answers = { aplikasi: '', kapasitas: '', refrigeran: '', tipeSistem: '', budget: '', lokasi: '' };

export function ProductFinderForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  function setAnswer<K extends keyof Answers>(key: K, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (key !== 'lokasi') {
      setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 180);
    }
  }

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, sessionId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message ?? 'Rekomendasi belum dapat diproses. Coba lagi sebentar.');
        return;
      }
      sessionStorage.setItem(FINDER_RESULT_KEY, JSON.stringify({
        criteria: answers,
        items: data.items ?? [],
        savedAt: Date.now(),
      }));
      router.push('/ai-katalog/hasil');
    } catch {
      setError('Koneksi bermasalah. Pastikan internet aktif lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
    setError('');
  }

  const canSubmit = answers.aplikasi && answers.kapasitas && answers.refrigeran && answers.tipeSistem && answers.budget;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-48px_rgba(4,47,46,0.4)]">
      {/* Progress */}
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
          <span>Pertanyaan {step + 1} dari {STEPS.length}</span>
          <span className="text-teal-700">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-3 hidden gap-1 sm:flex">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Ke pertanyaan ${i + 1}`}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-teal-600' : 'bg-slate-200 hover:bg-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-7 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{STEPS[step].title}</h2>

            {step === 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {APLIKASI_OPTIONS.map((option) => {
                  const Icon = APLIKASI_ICONS[option.icon] ?? Snowflake;
                  const active = answers.aplikasi === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAnswer('aplikasi', option.value)}
                      aria-pressed={active}
                      className={`group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${active ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'}`}
                    >
                      <span className={`flex size-10 items-center justify-center rounded-xl ${active ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-800 group-hover:bg-teal-200'}`}>
                        <Icon className="size-5" />
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                      <span className="text-xs text-slate-600">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {KAPASITAS_OPTIONS.map((option) => {
                  const active = answers.kapasitas === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAnswer('kapasitas', option.value)}
                      aria-pressed={active}
                      className={`rounded-2xl border px-4 py-5 text-sm font-semibold transition ${active ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-600/30' : 'border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/40'}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {REFRIGERAN_OPTIONS.map((option) => {
                  const active = answers.refrigeran === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswer('refrigeran', option)}
                      aria-pressed={active}
                      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${active ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/40'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TIPE_SISTEM_OPTIONS.map((option) => {
                  const active = answers.tipeSistem === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAnswer('tipeSistem', option.value)}
                      aria-pressed={active}
                      className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition ${active ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'}`}
                    >
                      <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                      <span className="text-xs text-slate-600">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="mt-5 flex flex-col gap-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {BUDGET_OPTIONS.map((option) => {
                    const active = answers.budget === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAnswer('budget', option.value)}
                        aria-pressed={active}
                        className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition ${active ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'}`}
                      >
                        <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                        <span className="text-xs text-slate-600">{option.description}</span>
                      </button>
                    );
                  })}
                </div>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  <span className="flex items-center gap-1.5"><MapPin className="size-4 text-teal-700" /> Lokasi instalasi (opsional)</span>
                  <input
                    type="text"
                    value={answers.lokasi}
                    onChange={(event) => setAnswer('lokasi', event.target.value)}
                    placeholder="Contoh: Kawasan Industri MM2100, Bekasi"
                    maxLength={80}
                    className="h-12 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? (
          <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>
        ) : null}

        {/* Actions */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Kembali
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Lanjut <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || loading}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-6 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {loading ? 'Mencari produk terbaik…' : 'Cari Produk Terbaik'}
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            disabled={loading}
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:text-slate-800 disabled:opacity-40"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

/** Session ID anonim untuk analitik rekomendasi (disimpan di localStorage). */
export function getOrCreateSessionId(): string {
  const KEY = 'bmp-session-id';
  let value = localStorage.getItem(KEY);
  if (!value) {
    value = `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, value);
  }
  return value;
}
