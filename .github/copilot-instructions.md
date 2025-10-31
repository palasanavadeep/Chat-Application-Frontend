## Quick context for AI code assistants

This is a Next.js (App Router) TypeScript frontend for a chat application. Key facts you can rely on:

- Framework: Next.js 15 (app router) + React 19
- Dev/build uses Turbopack flags in scripts: `npm run dev` (`next dev --turbopack`) and `npm run build` (`next build --turbopack`).
- Styling: Tailwind CSS (global file `src/app/globals.css`) and utility-first classes throughout components.
- TypeScript: `strict: true` in `tsconfig.json`. Path alias `@/*` -> `src/*`.

## Important file locations and conventions

- Routes & layouts: `src/app/*`. Each folder can have `layout.tsx` and `page.tsx` — layouts are nested (e.g. `src/app/chat/layout.tsx` provides the two-pane chat layout).
- UI primitives: `src/components/ui/*` contains reusable primitives (e.g. `alert-dialog.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`). Prefer using these instead of ad-hoc markup when available.
- Feature components: `src/components/*` and subfolders (e.g. `src/components/chat-components/ChatListItem.tsx`).
- Small utilities: `src/lib/utils.ts` exports `cn()` which wraps `clsx` + `tailwind-merge`. Use `cn(...)` to compose className strings consistently.
- Global styles and fonts: `src/app/layout.tsx` imports `globals.css` and configures google fonts via `next/font`.
- Assets: `public/` is used for static assets (example: `public/defaultImage.png` referenced by chat list items).

## Coding patterns to follow (examples from this repo)

- Use the `app/` router pattern: pages export a default component from `page.tsx`, and `layout.tsx` files wrap children. Example: `src/app/chat/layout.tsx` implements the two-column UI; `src/app/chat/page.tsx` renders `ChatListItem` components.
- Type signatures: components use explicit prop interfaces and `React.FC`/function components with typed props (see `ChatListItem.tsx` and `CustomizableAlertDialog.tsx`). Mirror that style when adding components.
- Compose Tailwind classes using `cn()` from `src/lib/utils.ts` rather than manual string concatenation to benefit from `tailwind-merge`.
- Use UI primitives by importing from `@/components/ui/*` (example in `CustomizableAlertDialog.tsx` which composes `AlertDialog` primitives and `Button`).

## Build / dev / lint commands (from `package.json`)

- Start dev server (fast, with Turbopack): `npm run dev`
- Build for production: `npm run build`
- Run production server (locally): `npm run start`
- Linting: `npm run lint` (runs ESLint configured for the project)

Note: Turbopack flags are present in `package.json` scripts; avoid removing them unless you know the reason.

## Integration and runtime notes

- No tests or explicit API client code were found in the repo root — network/data fetching patterns are implemented at the page/component level or expected to be added.
- When fetching data for pages, prefer Next.js app-router data fetching conventions (server components / client components as appropriate). If adding client-side hooks/components, follow the existing strict TypeScript and prop-typing patterns.

## PR checklist for code changes

1. Run `npm run dev` and load the relevant route (e.g. `/chat`) to smoke-test UI changes.
2. Run `npm run lint` and fix lint issues.
3. Keep TypeScript types strict — add or update types/interfaces for props and exported functions.
4. Prefer reusing `src/components/ui/*` primitives and `cn()` util.

## Quick examples to use in prompts

- Compose class names: `cn('p-2 rounded', isActive && 'bg-blue-500')` (uses `src/lib/utils.ts`).
- Use UI primitive: `import { Button } from '@/components/ui/button'` and prefer its `variant` API as shown in `CustomizableAlertDialog.tsx`.
- Route/layout: To add a new nested route use `src/app/<route>/page.tsx` and optionally `src/app/<route>/layout.tsx` for layout.

If anything here is unclear or you want more detail about a particular area (API patterns, state management choices, or where to add tests), tell me which part and I will expand or adapt this file.
