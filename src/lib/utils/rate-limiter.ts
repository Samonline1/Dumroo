interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, limit = 30, windowMs = 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Sliding window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (activeTimestamps.length >= limit) {
    rateLimitStore.set(key, { timestamps: activeTimestamps });
    return { allowed: false, remaining: 0 };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: limit - activeTimestamps.length,
  };
}
