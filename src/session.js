/* Short lived browser session. It carries no API key or pilot token. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PactSession = factory();
})(globalThis, function() {
  'use strict';
  class PactSession {
    constructor(options = {}) {
      this.fetcher = options.fetch || (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null);
      this.sessionId = null;
      this.csrf = null;
      this.expiresAt = 0;
      this.contractEnabled = false;
      this.voiceEnabled = false;
      this.pending = null;
      this.generation = 0;
      this.timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Math.max(250, Number(options.timeoutMs)) : 8000;
    }
    async ensure() {
      if (this.sessionId && this.expiresAt > Date.now() + 5000) return this.snapshot();
      if (this.pending) return this.pending;
      if (typeof this.fetcher !== 'function') throw Error('Session service unavailable');
      const generation = this.generation;
      const controller = new AbortController();
      let rejectTimeout;
      const timeoutPromise = new Promise((_, reject) => { rejectTimeout = reject; });
      const timeout = setTimeout(() => { controller.abort(); const error = Error('Session service timeout'); error.name = 'AbortError'; rejectTimeout(error); }, this.timeoutMs);
      const fetchPromise = Promise.resolve().then(() => this.fetcher('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ consent: true }),
        signal: controller.signal
      }));
      const promise = Promise.race([fetchPromise, timeoutPromise]).then(async response => {
        if (!response?.ok) throw Error(`Session unavailable (${response?.status || 0})`);
        const value = await response.json();
        if (generation !== this.generation) throw Error('Session invalidated');
        if (!value || typeof value.sessionId !== 'string' || !value.sessionId ||
            typeof value.csrf !== 'string' || !value.csrf) throw Error('Invalid session response');
        this.sessionId = value.sessionId;
        this.csrf = value.csrf;
        this.expiresAt = Number.isFinite(Number(value.expiresAt)) ? Number(value.expiresAt) : 0;
        this.contractEnabled = value.contractEnabled === true;
        this.voiceEnabled = value.voiceEnabled === true;
        return this.snapshot();
      }).catch(error => {
        if (error?.name === 'AbortError') throw Error('Session service timeout');
        throw error;
      }).finally(() => { clearTimeout(timeout); if (this.pending === promise) this.pending = null; });
      this.pending = promise;
      return promise;
    }
    snapshot() { return { sessionId: this.sessionId, csrf: this.csrf, expiresAt: this.expiresAt, contractEnabled: this.contractEnabled, voiceEnabled: this.voiceEnabled }; }
    async request(path, body, options = {}) {
      if (!this.csrf) await this.ensure();
      if (typeof this.fetcher !== 'function') throw Error('Session service unavailable');
      const headers = { ...(options.headers || {}), 'Content-Type': 'application/json', 'X-Nemesis-CSRF': this.csrf };
      return this.fetcher(path, { ...options, method: options.method || 'POST', headers, credentials: 'same-origin', body: body === undefined ? undefined : JSON.stringify(body) });
    }
    clear() { this.generation++; this.pending = null; this.sessionId = null; this.csrf = null; this.expiresAt = 0; this.contractEnabled = false; this.voiceEnabled = false; }
  }
  return PactSession;
});
