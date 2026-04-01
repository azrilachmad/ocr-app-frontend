/**
 * IP Geolocation Service
 * Uses ip-api.com (free, no key required, non-commercial use).
 * Includes in-memory cache (TTL: 1 hour) to avoid repeated lookups.
 *
 * Returns: { city, region, country } or null on failure.
 */

// In-memory cache: ip -> { data, timestamp }
const geoCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const REQUEST_TIMEOUT_MS = 3000; // 3 seconds max

/**
 * Clean expired entries from cache (lazy cleanup on every call)
 */
const cleanExpired = () => {
    const now = Date.now();
    for (const [ip, entry] of geoCache) {
        if (now - entry.timestamp > CACHE_TTL_MS) {
            geoCache.delete(ip);
        }
    }
};

/**
 * Check if an IP is a local/private address
 * @param {string} ip
 * @returns {boolean}
 */
const isLocalIp = (ip) => {
    if (!ip) return true;
    const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];
    if (local.includes(ip)) return true;
    // Private ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
    if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
    if (ip.startsWith('172.')) {
        const second = parseInt(ip.split('.')[1], 10);
        if (second >= 16 && second <= 31) return true;
    }
    return false;
};

/**
 * Lookup geolocation for an IP address.
 * Non-blocking, gracefully returns null on any error.
 *
 * @param {string} ip - IPv4 or IPv6 address
 * @returns {Promise<{city: string, region: string, country: string}|null>}
 */
const lookupIp = async (ip) => {
    try {
        if (!ip) return null;

        // Handle local/private IPs
        if (isLocalIp(ip)) {
            return { city: 'Local', region: 'Local', country: 'LO' };
        }

        // Check cache
        cleanExpired();
        const cached = geoCache.get(ip);
        if (cached) {
            return cached.data;
        }

        // Fetch from ip-api.com (HTTP only — free tier does not support HTTPS)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(
            `http://ip-api.com/json/${ip}?fields=status,city,regionName,countryCode`,
            { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.status !== 'success') return null;

        const result = {
            city: data.city || null,
            region: data.regionName || null,
            country: data.countryCode || null
        };

        // Store in cache
        geoCache.set(ip, { data: result, timestamp: Date.now() });

        return result;
    } catch (error) {
        // Silently fail — geo lookup should never break the main flow
        if (process.env.NODE_ENV === 'development') {
            console.warn(`[GeoService] Lookup failed for IP ${ip}:`, error.message);
        }
        return null;
    }
};

/**
 * Get the real client IP from request (handles reverse proxy / Nginx)
 * @param {import('express').Request} req
 * @returns {string}
 */
const getClientIp = (req) => {
    // x-forwarded-for may contain comma-separated list: client, proxy1, proxy2
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const first = forwarded.split(',')[0].trim();
        return first;
    }
    // x-real-ip from Nginx
    if (req.headers['x-real-ip']) {
        return req.headers['x-real-ip'];
    }
    // Direct connection
    return req.ip || req.connection?.remoteAddress || '0.0.0.0';
};

module.exports = { lookupIp, getClientIp, isLocalIp };
