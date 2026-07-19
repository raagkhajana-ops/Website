# Raag Khajana — Website

Single-page marketing site for **Raag Khajana**, a project digitally preserving *gurmat sangeet* while
building new tools — games and machine learning — to engage a new generation, alongside (never instead
of) the traditional teacher–student system.

Built as a lightweight static site: semantic HTML + modern CSS + a little vanilla JS, bundled with
[Vite](https://vite.dev). No framework, no server code — the production build is plain static files.

## Run & build locally

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Deploy

The `dist/` folder is a fully static site — drop it on any static host.

- **Netlify** — config is included ([netlify.toml](netlify.toml)): connect the repo, and Netlify runs
  `npm run build` and publishes `dist/` automatically. Set the two env vars (below) in
  *Site settings → Environment variables*.
- **Vercel / Cloudflare Pages** — framework preset "Vite", build command `npm run build`, output
  directory `dist`, plus the same env vars.
- **GitHub Pages** — a workflow is included ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):
  push to `main`, then in the repo go to *Settings → Pages* and set **Source: GitHub Actions**.
  Every push builds and deploys automatically. Set the two env vars as **repository variables**
  (*Settings → Secrets and variables → Actions → Variables*). The build uses relative asset
  paths, so the `https://<user>.github.io/<repo>/` sub-path works without configuration.

## Form endpoints (environment variables)

Both forms POST JSON to endpoints configured at **build time** via env vars — no secrets live in the
repo. Copy [.env.example](.env.example) to `.env` locally, or set the vars in your host's dashboard:

| Variable | Used by | Payload |
| --- | --- | --- |
| `VITE_NEWSLETTER_ENDPOINT` | Newsletter form | `{"email": "..."}` |
| `VITE_CONTACT_ENDPOINT` | Contact form | `{"name": "...", "email": "...", "message": "..."}` |

Any service that accepts a JSON POST works (Formspree works out of the box; Mailchimp/ConvertKit need
either their form-action URL on a service that accepts JSON, or a tiny serverless proxy). While an
endpoint is unset, the form shows a friendly "not live yet, email us" notice instead of failing.

For local testing without a real service, the dev server ships mock endpoints — see the bottom of
`.env.example` (`/__mock/newsletter`, `/__mock/contact`, and `/__mock/fail` for the error state).

## Image slots (drop in real artwork)

Two placeholder images live in [public/images/](public/images/). To swap in real artwork:

1. **Hero band** (full-width, 420px tall, cropped to cover) — replace
   `public/images/hero-placeholder.svg` and update the `src` of the hero `<img>` in
   [index.html](index.html) (search for `hero-placeholder`). Recommended: ≥ 2000px wide.
2. **About portrait** (340px tall, rounded) — same, with `about-placeholder.svg`. Recommended:
   ≥ 1000px wide.

Keep the `alt` text (or improve it to describe the real image). The layout crops with
`object-fit: cover`, so any reasonably-sized image works without touching CSS.

## Wordmark

The logo is a mixed-script lockup — `Raag ਖjana` — where the single Gurmukhi letter `ਖ` ("Kha") is set
in Noto Serif Gurmukhi (subset to just that glyph) inside Instrument Serif Latin text. It's used in the
nav and footer only; running copy uses the English "Raag Khajana". The `ਖ` is wrapped in `lang="pa"`.

## TODO before launch (placeholder content — please confirm)

- [ ] **Stats** in the Progress section: `120+` raags, `8` teachers, `2026` launch year
- [ ] **Contact email**: `hello@raagkhajana.org` (also used in form fallback messages in `src/main.js`)
- [ ] **Instagram handle**: `@raagkhajana`
- [ ] **Production domain**: `https://raagkhajana.org/` is assumed in `index.html` (canonical + OG tags),
      `public/robots.txt`, and `public/sitemap.xml` — update if different
- [ ] **Social/OG image**: `public/og-image.png` — replace with real artwork when available
- [ ] **Contrast note**: three brand-mandated combinations sit below WCAG AA for their text size —
      gold `#c9a13b` eyebrows on ivory, blue-on-gold "Subscribe" button (4.4:1, borderline), and the
      13px `#8a8571` footer text. Kept as designed per the high-fidelity spec; revisit if an
      accessibility audit requires AA everywhere.

## Project structure

```
index.html          the whole page (semantic, one h1, anchor sections)
src/style.css       design tokens + all styles (flat, no shadows)
src/main.js         sticky-nav border, mobile menu, form validation/submission
public/             favicon, robots.txt, sitemap.xml, og-image, image slots
netlify.toml        Netlify build + header config
vite.config.js      relative base path + dev-only mock form endpoints
```
