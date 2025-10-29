// API caching utilities for better performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const apiCache = new APICache();

// Cache key generators
export const cacheKeys = {
  translation: (text: string, inputLang: string, outputLangs: string[]) =>
    `translation:${inputLang}:${outputLangs.sort().join(',')}:${text.slice(0, 100)}`,

  grammarCorrection: (text: string) =>
    `grammar:${text.slice(0, 100)}`,

  dictionary: (word: string, language: string) =>
    `dictionary:${language}:${word}`,

  imageAnalysis: (imageId: string) =>
    `image:${imageId}`,
};

// Cached API wrapper
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  ttl?: number
): Promise<T> {
  // Check cache first
  if (cacheKey && apiCache.has(cacheKey)) {
    return apiCache.get<T>(cacheKey)!;
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    if (cacheKey) {
      apiCache.set(cacheKey, data, ttl);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Translation API with caching
export async function cachedTranslate(
  text: string,
  inputLang: string,
  outputLangs: string[],
  stream: boolean = false
) {
  const cacheKey = cacheKeys.translation(text, inputLang, outputLangs);

  return cachedFetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, inputLang, outputLangs, stream }),
  }, cacheKey, 10 * 60 * 1000); // 10 minutes TTL
}

// Grammar correction API with caching
export async function cachedCorrectGrammar(text: string) {
  const cacheKey = cacheKeys.grammarCorrection(text);

  return cachedFetch('/api/correct-grammar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }, cacheKey, 30 * 60 * 1000); // 30 minutes TTL
}

// Dictionary API with caching
export async function cachedDictionaryLookup(word: string, language: string) {
  const cacheKey = cacheKeys.dictionary(word, language);

  return cachedFetch('/api/dictionary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, language }),
  }, cacheKey, 60 * 60 * 1000); // 1 hour TTL
}

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}