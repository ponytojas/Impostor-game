# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router entry points (e.g., `app/layout.tsx`, `app/page.tsx`) and global styles in `app/globals.css`.
- `components/` contains shared React components; `components/ui/` hosts shadcn-style UI primitives.
- `lib/` houses utilities and domain data (e.g., `lib/utils.ts`, `lib/words.ts`).
- `public/` stores static assets like icons and images served at the site root.
- `styles/` contains additional global CSS; prefer `app/globals.css` for theme tokens and Tailwind setup.

## Build, Test, and Development Commands
Use `pnpm` (lockfile is `pnpm-lock.yaml`):
- `pnpm install` — install dependencies.
- `pnpm dev` — start the local Next.js dev server.
- `pnpm build` — build the production bundle.
- `pnpm start` — serve the production build.
- `pnpm lint` — run ESLint across the repository.

## Coding Style & Naming Conventions
- TypeScript + React (`.ts`/`.tsx`), no semicolons; follow existing formatting in the file you’re touching.
- Indentation is 2 spaces; quotes vary by file (match the local style).
- Component names are PascalCase; file names are lowercase or kebab-case (e.g., `theme-provider.tsx`, `button.tsx`).
- Tailwind CSS is the primary styling approach; design tokens live in `app/globals.css`.
- Use path aliases from `tsconfig.json` (e.g., `@/components`, `@/lib`).

## Testing Guidelines
- No automated test framework or scripts are configured yet.
- If you add tests, include a `test` script in `package.json` and use clear file names like `*.test.tsx`.

## Commit & Pull Request Guidelines
- Git history contains a single seed commit (“Initialized repository for chat Impostor game app”); no formal commit convention yet.
- Prefer short, imperative summaries (e.g., “Add lobby screen”).
- PRs should include: a concise description, screenshots for UI changes, and linked issues if applicable.

## Sync & Deployment Notes
- This repo is synced with v0.app and deployed via Vercel (see `README.md`); coordinate changes to avoid overwrites.
