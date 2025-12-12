'use strict';

/**
 * permissions(...scopes)
 *
 * Returns an Express middleware that:
 *  - expects a decoded JWT on req.auth (from express-jwt)
 *  - checks that the token contains all required scopes
 *
 * We support:
 *  - auth.scope: "letters:read letters:send"
 *  - auth.scope: ["letters:read", "letters:send"]
 *  - auth.permissions: ["letters:read", "letters:send"]
 */
function permissions(...requiredScopes) {
    return (req, res, next) => {
        const auth = req.auth;

        if (!auth) {
            return res.status(401).json({ error: 'Unauthenticated: missing auth context' });
        }

        let tokenScopes = [];

        if (Array.isArray(auth.scope)) {
            tokenScopes = auth.scope;
        } else if (typeof auth.scope === 'string') {
            tokenScopes = auth.scope.split(' ').filter(Boolean);
        } else if (Array.isArray(auth.permissions)) {
            tokenScopes = auth.permissions;
        }

        // Check all required scopes are present
        const missing = requiredScopes.filter((scope) => !tokenScopes.includes(scope));

        if (missing.length > 0) {
            return res.status(403).json({
                error: 'Forbidden: missing required scope(s)',
                missingScopes: missing
            });
        }

        return next();
    };
}

module.exports = permissions;
