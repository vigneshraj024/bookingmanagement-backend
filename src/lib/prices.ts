import { apiFetch } from './api';

export type Sport = 'Cricket' | 'Football' | 'Pickleball' | 'Gaming';

// Fallback hourly defaults in case PriceMaster is empty
const DEFAULT_RATES: Record<Sport, number> = {
  Cricket: 600,
  Football: 600,
  Pickleball: 400,
  Gaming: 100,
};

const cache = new Map<Sport, number>();

export const priceService = {
  async getRatePerHour(sport: Sport): Promise<number> {
    // cache first
    if (cache.has(sport)) return cache.get(sport)!;
    try {
      const res = await apiFetch(`/api/prices/sport/${encodeURIComponent(sport)}`);
      const price = Number(res?.Price);
      if (!Number.isFinite(price)) throw new Error('Invalid price');
      cache.set(sport, price);
      return price;
    } catch {
      // fallback to default
      const price = DEFAULT_RATES[sport];
      cache.set(sport, price);
      return price;
    }
  },

  // Helper to clear cache (e.g., after updates)
  clearCache() {
    cache.clear();
  },
};
