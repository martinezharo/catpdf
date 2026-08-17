# CatPDF

CatPDF is a private, browser-based PDF merger. Add multiple PDFs, inspect page
counts, reorder them with drag-and-drop or move buttons, remove files, and
download one combined document.

PDFs are read and merged in the browser with `pdf-lib`; nothing is uploaded and
the project has no backend.

## Development

Requires Node.js 20.19+ or 22.12+ and pnpm 10.33.0.

```bash
pnpm install
pnpm dev          # local development
pnpm build        # production build in dist/
pnpm preview      # preview the production build
```

The [wrangler.jsonc](wrangler.jsonc) file configures `dist/` as Cloudflare
Workers Static Assets. No test script is defined.

See [LICENSE](LICENSE) for the license terms.
