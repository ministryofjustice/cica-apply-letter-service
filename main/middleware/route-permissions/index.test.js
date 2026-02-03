'use strict';

const permissions = require('./index');

describe('permissions middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('returns 401 if req.auth is missing', () => {
        const mw = permissions('letters:read');

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Unauthenticated: missing auth context'
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('allows when scope is a space-delimited string containing required scopes', () => {
        req.auth = {
            scope: 'letters:read letters:send'
        };
        const mw = permissions('letters:read');

        mw(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('denies when scope string does NOT contain required scope', () => {
        req.auth = {
            scope: 'letters:read'
        };
        const mw = permissions('letters:delete');

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Forbidden: missing required scope(s)',
            missingScopes: ['letters:delete']
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('allows when scope is an array containing required scopes', () => {
        req.auth = {
            scope: ['letters:read', 'letters:send']
        };
        const mw = permissions('letters:send');

        mw(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('falls back to auth.permissions array when scope missing', () => {
        req.auth = {
            permissions: ['letters:read']
        };
        const mw = permissions('letters:read');

        mw(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('403s when required scopes missing from permissions array', () => {
        req.auth = {
            permissions: ['letters:read']
        };
        const mw = permissions('letters:send', 'letters:delete');

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Forbidden: missing required scope(s)',
            missingScopes: ['letters:send', 'letters:delete']
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('allows when multiple required scopes all match', () => {
        req.auth = {
            scope: ['letters:read', 'letters:send', 'letters:delete']
        };
        const mw = permissions('letters:read', 'letters:delete');

        mw(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
