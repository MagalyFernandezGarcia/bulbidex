@AGENTS.md

# Bulbidex

Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4.

## Working rules

- Never guess — if a requirement, behavior or design choice is unclear, ask before implementing

## Commands

- Package manager: **pnpm** (never npm/yarn)
- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm lint` — run ESLint
- Add shadcn components with `pnpm dlx shadcn@latest add <component>`

## Project structure

- `src/app/` — routes, layouts and pages (App Router)
- `src/components/ui/` — shadcn components
- `src/components/` — app components
- Import alias: `@/*` → `./src/*`

## Next.js & React

- Read the relevant guide in `node_modules/next/dist/docs/` before using a Next.js API — this version differs from older training data
- Default to Server Components; add `'use client'` only when the component needs state, event handlers or browser APIs, and keep client components as small and low in the tree as possible
- Fetch data in Server Components or Server Actions, not in client-side effects
- Avoid `useEffect`, `useMemo`, `useCallback`, `useLayoutEffect` and `memo` unless absolutely needed:
  - Derive values during render instead of syncing them into state with an effect
  - Handle user-triggered logic in event handlers, not in effects
  - Reset component state with a `key` instead of an effect
  - Do not memoize by default — only when a measured performance problem requires it
- Use a TypeScript string enum for hook/component state machine phases — never raw string literals (e.g. `enum Phase { Loading = 'loading', Ready = 'ready' }`, not `'loading' | 'ready'`)

## UI & styling

- Always reuse existing components first (`src/components/`, `src/components/ui/`) — search the codebase before creating a new one
- If no existing component fits, use a shadcn component before building a custom one
- Style with Tailwind `className` — no inline `style` objects or CSS-in-JS
- Never use `!important` modifiers (e.g. `!text-red-500`) — refactor the style hierarchy instead

## TypeScript

- Always use arrow functions (`const foo = () => {}`) — never the `function` keyword
- Prefer named exports (`export const Foo = ...`) over default exports — except where Next.js requires a default export (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `next.config.ts`, etc.)
- Prefer `type` over `interface`; use `interface` only for declaration merging or class `implements`
- Never use `as any`
- Avoid type assertions (`as SomeType`) — use typed variable declarations or type narrowing instead
- Avoid the non-null assertion operator (`value!`) — use conditional checks or type narrowing instead
- Do not add explicit return type annotations on controller methods, route handlers or server actions — let TypeScript infer them
- Import only the specific members you need — never the whole library (e.g. `import { ReactNode } from 'react'` and use `ReactNode`, not `import React from 'react'` and `React.ReactNode`)
- Use full descriptive names for variables, parameters and functions — no single or double-letter abbreviations (e.g. `startDate` not `sd`, `getStatistics` not `getStats`)

## Zod

- Use `.min(1, 'key')` instead of the deprecated `.nonempty('key')`
- Use `z.email()` instead of the deprecated `z.string().email()`

## Database (Prisma)

- Never write raw SQL — no `$queryRaw`, `$executeRaw`, or Prisma TypedSQL `.sql` files
- Every query goes through the Prisma client API. If a filter seems to need SQL, express it as a `where` clause (relation filters `some` / `none` / `every`, and an `OR` of the distinct cases can model conditions that look computed). Do not propose raw SQL as an option

## Git

- Do NOT add `Co-Authored-By` lines (or any AI attribution) to commit messages
- Never commit AI-generated comments — remove all assistant-produced inline comments before committing or opening a PR
- Run `pnpm lint` and `pnpm build` before committing
