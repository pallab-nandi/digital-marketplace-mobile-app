export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function datePlusDaysISO(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Deterministic PRNG in [0, 1) derived from a seed string (FNV-1a hashed). */
export function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const x = (h >>> 0) / 4294967296;
  return x - Math.floor(x);
}

/** Deterministic value in [min, max]. */
export function randRange(min: number, max: number, seed: string): number {
  return min + seededRandom(seed) * (max - min);
}

/** Deterministic rounded integer in [min, max]. */
export function randInt(min: number, max: number, seed: string): number {
  return Math.floor(randRange(min, max + 1, seed));
}

/** Multiply value by a small deterministic "noise" factor in [1-amp, 1+amp]. */
export function noise(value: number, seed: string, amp = 0.15): number {
  return round(value * (1 - amp + seededRandom(seed) * amp * 2));
}