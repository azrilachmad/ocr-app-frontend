/**
 * Shared cookie configuration for authentication tokens.
 * Used by authController and adminController (impersonation).
 */

// Cookie domain for cross-subdomain sharing (e.g., '.synchro.co.id' for *.synchro.co.id)
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

/**
 * Get clear-cookie options (subset of COOKIE_OPTIONS without maxAge)
 */
const getClearCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN })
});

module.exports = { COOKIE_OPTIONS, COOKIE_DOMAIN, getClearCookieOptions };
