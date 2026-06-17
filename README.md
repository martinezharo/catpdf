# CatPDF

CatPDF is a private, browser-based tool for concatenating multiple PDF files into one ordered document.

Files are processed locally in the browser with `pdf-lib`. Nothing is uploaded to a server.

## Features

- Add multiple PDF files in one or more batches.
- Reorder files with drag and drop.
- Move files up or down with keyboard-friendly controls.
- Remove files before merging.
- Concatenate valid PDFs into a single downloadable document.
- Runs entirely in the browser.

## Tech Stack

- Vite
- pdf-lib
- SortableJS
- Cloudflare Workers Static Assets for deployment

## Requirements

- Node.js
- pnpm 10.33.0 or compatible

## Development

Install dependencies:

```bash
pnpm install
```

Start the local development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Deployment

This project is configured for Cloudflare deployment with `wrangler.jsonc`.

The production build outputs static files to `dist`, and Wrangler deploys that directory as Cloudflare Workers Static Assets.

Build first:

```bash
pnpm build
```

Then deploy:

```bash
npx wrangler deploy
```

## Privacy

CatPDF does not send PDFs to any backend. PDF reading, page copying, ordering, and final file generation happen locally in the user's browser.

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <strong><a href="https://olivermartinezharo.com">Oli</a></strong>
</p>
