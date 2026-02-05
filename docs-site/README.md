# x402 Product Docs Site

A Nextra docs site generated from the x402 product markdown repository.

## Quick start

1. Install dependencies with `npm install`.
1. Update content in `docs-src/`.
2. Use numeric prefixes (like `01-`, `02-`) to control sidebar order.
3. Run `npm run sync-docs` to generate the Nextra `app/` routes.
4. Run `npm run dev`.

## Folder rules

- Each file becomes a route.
- `index.md` becomes the section landing page.
- Folders become sidebar sections automatically.

Example:

```
docs-src/
  index.md
  01-getting-started.md
  02-guides/
    index.md
    01-installation.md
```

## Commands

- `npm run sync-docs` generates the `app/` directory from `docs-src/`.
- `npm run dev` syncs docs and starts the dev server.
- `npm run build` syncs docs and builds the site.

## Notes

- `app/` is generated from `docs-src/` on each sync.
- If you need custom pages, put them in `docs-src/` or extend the sync script.
- Search is generated on build via Pagefind (`npm run build` runs `postbuild`).

## Deploy to Vercel

Set the project root to this folder and use the default Next.js settings.
