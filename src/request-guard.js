function requestKey(request) {
  if (request?.headers?.get && process.env.TRUST_PROXY) {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',').at(-1).trim();
    return request.headers.get('x-real-ip') || 'unknown';
  }
  return request?.ip || request?.socket?.remoteAddress || 'unknown';
}

export function createRateLimiter({ enabled, name, windowMs, max }) {
  if (!enabled) {
    return {
      check() {
        return { allowed: true, headers: {} };
      },
    };
  }

  const buckets = new Map();

  return {
    check(request) {
      const now = Date.now();
      const key = requestKey(request);
      const current = buckets.get(key);
      const bucket =
        !current || current.resetAt <= now
          ? { count: 0, resetAt: now + windowMs }
          : current;

      bucket.count += 1;
      buckets.set(key, bucket);

      if (buckets.size > 500) {
        for (const [candidate, value] of buckets) {
          if (value.resetAt <= now) buckets.delete(candidate);
        }
      }

      const headers = {
        'RateLimit-Limit': String(max),
        'RateLimit-Remaining': String(Math.max(0, max - bucket.count)),
        'RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
      };

      if (bucket.count > max) {
        headers['Retry-After'] = String(
          Math.ceil((bucket.resetAt - now) / 1000),
        );
        return {
          allowed: false,
          headers,
          error: `Слишком много запросов к ${name}. Повторите позже.`,
        };
      }

      return { allowed: true, headers };
    },
  };
}

export function createRateLimit({ enabled, name, windowMs, max }) {
  const limiter = createRateLimiter({ enabled, name, windowMs, max });
  return (request, response, next) => {
    const result = limiter.check(request);
    for (const [header, value] of Object.entries(result.headers)) {
      response.set(header, value);
    }
    if (!result.allowed) {
      response.status(429).json({ error: result.error });
      return;
    }
    next();
  };
}

export function createDemoConcurrencyGuard(profile) {
  let active = 0;
  const activeByIp = new Map();

  return {
    enter(request) {
      if (!profile.isPublic) return { allowed: true, release() {} };

      const key = requestKey(request);
      const perIp = activeByIp.get(key) ?? 0;
      if (
        active >= profile.api.maxConcurrentDemos ||
        perIp >= profile.api.maxConcurrentDemosPerIp
      ) {
        return { allowed: false, release() {} };
      }

      active += 1;
      activeByIp.set(key, perIp + 1);
      let released = false;

      return {
        allowed: true,
        release() {
          if (released) return;
          released = true;
          active = Math.max(0, active - 1);
          const remaining = (activeByIp.get(key) ?? 1) - 1;
          if (remaining > 0) activeByIp.set(key, remaining);
          else activeByIp.delete(key);
        },
      };
    },
  };
}
