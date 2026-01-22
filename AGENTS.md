# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains application code.
  - `app/routes/` holds route modules; `app/routes.ts` declares the route config.
  - `app/components/` and `app/components/ui/` contain shared UI primitives and composite components (shadcn/ui-based).
  - `app/services/` is where data-access helpers live (e.g., API calls).
  - `app/sessions-list/` includes session-specific UI modules.
- `public/` is for static assets served directly.
- `app/app.css` is the global Tailwind entrypoint and theme definitions.

## Build, Test, and Development Commands
- `npm run dev`: Start the React Router dev server with HMR at `http://localhost:5173`.
- `npm run build`: Build the production client/server bundle into `build/`.
- `npm run start`: Serve the production build via `react-router-serve`.
- `npm run typecheck`: Generate route types (`react-router typegen`) and run `tsc`.
- `npm run lint:check`: Run ESLint with the project’s flat config.

## Coding Style & Naming Conventions
- TypeScript + React components live in `.ts`/`.tsx` files under `app/`.
- Indentation is 2 spaces; keep formatting aligned with Prettier defaults.
- File naming follows kebab-case (e.g., `empty-state.tsx`, `practice-session.tsx`).
- Components are PascalCase exports; hooks and utilities are camelCase.
- Use the `~/*` alias for app imports (mapped to `app/*`).
- Tailwind CSS is the primary styling approach; keep styles in class names and `app/app.css` for globals.
- shadcn/ui components live in `app/components/ui/`; prefer extending or composing them for new UI.
- Add new shadcn/ui components via the shadcn CLI (e.g., `bunx shadcn@latest add <component>`).

## Testing Guidelines
- No automated test framework is configured yet.
- For changes, rely on manual verification via `npm run dev` and consider adding a test runner if you introduce complex logic.

## Commit & Pull Request Guidelines
- Current git history uses short, descriptive messages without a strict convention (e.g., “updates ui”).
- Use concise, imperative summaries; add scope when helpful (e.g., “refine session form UX”).
- PRs should include a short summary, testing notes (commands run), and screenshots/GIFs for UI changes.

## Configuration Notes
- ESLint rules are defined in `eslint.config.js`; generated files under `.react-router/` are ignored.
- Deployment expects the `build/` output (see `npm run build`).
