# inv

Simple Invoice Generator for Simple People.

A fully client-side invoice generator built with React + Vite + TypeScript. Create a
clean, single-A4-page invoice (From/To, numbered & dated, an editable items table with
auto-calculated total and amount in words, logo, payment details, footer) and export it
as **PDF** or **PNG**. Everything runs in the browser — no backend. Your data autosaves
to `localStorage`.

See [PRD.md](./PRD.md) for the full product spec.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## Test

```bash
npm run test                       # unit + component tests (Vitest)
npm run test:e2e                   # end-to-end tests (Playwright)
npx playwright install             # one-time: install e2e browsers
```

By default the e2e suite runs Chromium, Firefox and WebKit. Restrict it with
`E2E_BROWSERS=chromium npm run test:e2e`.

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the app and
publishes `dist/` to GitHub Pages. The site is served under `/inv/` (configured via
`base` in `vite.config.ts`). If your organisation blocks automatic Pages enablement,
enable it once under **Settings → Pages → Source: GitHub Actions**.
