# Attention to Detail Assessment (frontend)

**attention-to-detail-assessment** — Vue 3 + Vite SPA for the Hatters self-assessment: 15 Likert-style questions, progress UI, optional PDF export, and API submission. The main UI lives in `src/components/HelloWorld.vue` using `<script setup>`.

## Stack

- [Vue 3](https://vuejs.org/) with [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) and [`<script setup>`](https://vuejs.org/api/sfc-script-setup.html)
- [Vite](https://vite.dev/)
- [Vue Router](https://router.vuejs.org/) (hash history)
- [Tailwind CSS v4](https://tailwindcss.com/) (PostCSS)
- [axios](https://axios-http.com/), [html2pdf.js](https://github.com/eKoopmans/html2pdf.js), [AOS](https://michalsnik.github.io/aos/) (scroll animations)

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Start Vite dev server          |
| `npm run build`| Production build → `dist/`     |
| `npm run preview` | Serve production build locally |
| `npm run deploy`  | Deploy `dist/` via gh-pages    |

## Environment

Optional Vite env variables (e.g. `.env`, `.env.development`):

| Variable              | Description |
| --------------------- | ----------- |
| `VITE_API_BASE_URL`   | Full API origin (no trailing slash). Overrides host/port logic when set. |
| `VITE_API_PORT`       | Port used with current hostname when `VITE_API_BASE_URL` is unset (default `8000`). |

## Project layout

```
src/
  components/HelloWorld.vue   # Assessment form, results, PDF template hook
  router/index.js             # Single route `/`
  main.js                     # App bootstrap, AOS CSS
  style.css                   # Global tokens / Tailwind entry
```

## Vue + Vite references

- [`<script setup>`](https://vuejs.org/api/sfc-script-setup.html)
- [IDE support & tooling](https://vuejs.org/guide/scaling-up/tooling.html#ide-support)

## License

Private project (`"private": true` in `package.json`).
