import { defineConfig } from 'vite';

/**
 * Dev-only mock endpoints so the newsletter/contact form states can be
 * exercised locally without a real service. Not included in the production
 * build. Point the env vars at them in `.env.local`:
 *
 *   VITE_NEWSLETTER_ENDPOINT="/__mock/newsletter"
 *   VITE_CONTACT_ENDPOINT="/__mock/contact"
 *
 * POST /__mock/fail always returns 500, for testing the error state.
 */
const mockFormEndpoints = () => ({
  name: 'mock-form-endpoints',
  configureServer(server) {
    server.middlewares.use('/__mock', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end();
        return;
      }
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const fail = req.url.includes('fail');
        res.statusCode = fail ? 500 : 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(fail ? { error: 'Simulated failure' } : { ok: true }));
      });
    });
  },
});

export default defineConfig({
  // Relative base so the built site works from any static host path
  // (Netlify/Vercel root, or a GitHub Pages sub-path) without changes.
  base: './',
  plugins: [mockFormEndpoints()],
  build: {
    target: 'es2018',
  },
});
