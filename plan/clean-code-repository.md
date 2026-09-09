# Clean Code Repository

## Status

- Document type: Technical guideline
- Intended future use: Reusable engineering skill
- Audience: Developers, reviewers, and coding agents
- Scope: Application repositories, especially TypeScript/JavaScript projects

## 1. Purpose

This document defines a practical standard for keeping a software repository clean, understandable, maintainable, and safe to change.

Clean code is not code with the fewest lines. It is code whose intent is easy to understand, whose responsibilities are clear, and whose changes can be verified with confidence.

## 2. Core Principles

1. **Make intent obvious.** Prefer names and structures that explain why code exists.
2. **Keep responsibilities small.** A module, function, or component should have one primary reason to change.
3. **Prefer simple solutions.** Do not introduce abstractions before they solve a real repeated problem.
4. **Make invalid states difficult to represent.** Validate inputs and model states explicitly.
5. **Keep boundaries clear.** Separate UI, business logic, data access, infrastructure, and configuration.
6. **Remove duplication carefully.** Abstract only when the duplicated logic has the same meaning and change pattern.
7. **Leave the repository better than you found it.** Every change should avoid adding unnecessary complexity.

## 3. Repository Structure

Use a structure that communicates ownership and dependency direction. A typical frontend repository may use:

```text
app/                # if structure using app then app/, if src then use src/
  routes/           # routing pages
  components/       # broadly reusable UI components in general, contains dumb component
  hooks/            # reusable logic in custom hooks
  helpers/          # rsmall generic utilities
  pages/            # pages that matching the routes
  repositories/     # API clients and external integrations
  contexts/         # shared client-side state
  styles/           # global styles and design tokens
  types/            # shared type declarations when needed
tests/
  integration/
  e2e/
docs/
scripts/
```

details repository inside pages
```text
pages/
  pages-name/
    index.ts # index of pages
    styles.css # spesific styles only for this pages
    View.tsx # main view of pages, this only contains UI, all logic code import from hook.ts
    hook.ts  # custom hooks that specified only in this pages
    helpers.ts # repeatable and reusable logic utilities
    types.ts #specified type only for this page
    components/ #component spesific only used by this pages
      name-component/
        index.ts # index of pages
        styles.css # spesific styles only for this component
        View.tsx # main view of pages, this only contains UI, all logic code import from hook.ts
        hook.ts  # custom hooks that specified only in this pages
        helpers.ts # repeatable and reusable logic utilities
        types.ts #specified type only for this page
```

Below are specification each of file inside pages.

```text
# index.ts 
export {default} from './View.tsx'

```

```text
# View.tsx 
const home = () => {
  import {/* all code logic variable */} = useView();
    return (<div></div>);
}

export default home;

```


```text
# hook.ts
const useView = () => {

    // all code logic spesific for View.tsx here
    return {
        // export all variables 
    }
}
 
export default useView;

```

Prefer feature ownership over placing all files of the same technical type in global folders. A feature should be easy to locate, understand, test, and remove.

### Backend structure (Cloudflare Workers)

The worker layer owns the HTTP boundary that must run before SSR: auth endpoints, session cookies, and direct D1 access. Keep it separate from React Router page logic.

```text
workers/
  app.ts          # worker entry: dispatch /api/* to worker handlers, otherwise SSR
  api/            # worker-layer endpoint handlers (auth, future integrations)
  lib/            # worker helpers shared by handlers (session cookie, D1 access)
  env.d.ts        # generated Env types (wrangler types), never hand-edited
migrations/       # D1 SQL migrations, one file per schema change
```

Rules for the worker layer:

- `workers/app.ts` stays a thin dispatcher: route `/api/*` to handlers, everything else to the SSR request handler. No business logic in the entry file.
- Each endpoint handler owns exactly one concern (sign-in, callback, me, logout) and returns early for invalid input.
- Shared helpers (cookie parsing, session CRUD) live in `workers/lib/` and are the only place that knows cookie names, token formats, and session TTLs.
- Worker handlers and page server modules (`*.server.ts`) both go through D1 directly; keep each table's queries in one module so a schema change touches one file.
- Validate and upsert external data (OAuth user info) at the worker boundary before it reaches the database or the session.
- Keep secrets (`GOOGLE_CLIENT_SECRET`, etc.) in `.dev.vars` / worker secrets, never in source; `env.d.ts` and generated type files are checked in but regenerated with `wrangler types`.
- Migration files are immutable history: add a new migration instead of editing an applied one.

## 4. Naming Rules

- Use names that describe the domain, not the implementation detail.
- Use verbs for actions: `fetchUserProfile`, `validateBooking`, `calculateTotal`.
- Use nouns for data and components: `BookingSummary`, `userProfile`.
- Avoid vague names such as `data`, `item`, `manager`, `helper`, and `utils` unless their scope makes the meaning precise.
- Boolean names should read like a question: `isLoading`, `hasPermission`, `canSubmit`.
- Keep one concept mapped to one term. Do not use `load`, `fetch`, and `retrieve` interchangeably for the same operation.
- Use consistent file naming and casing throughout the repository.

## 5. Functions and Modules

- Keep functions short enough to understand without jumping across the file.
- Prefer early returns for invalid or exceptional cases.
- Avoid functions with many parameters; use a named options object when appropriate.
- Keep side effects at the boundary of a function or module.
- Do not mix data fetching, transformation, validation, and rendering when they can be separated clearly.
- Export the smallest public API possible.
- Avoid circular dependencies.

## 6. Components and UI Code

- Components should primarily describe UI and user interaction.
- Move business rules into domain functions or feature logic.
- Keep data-fetching concerns separate from presentational components when practical.
- Define explicit loading, empty, success, and error states.
- Avoid prop drilling across unrelated boundaries; use context or a state store only when ownership justifies it.
- Keep accessibility behavior close to the component that owns the interaction.
- Do not hide important behavior inside overly generic components.

## 7. State and Data

Classify state before choosing a tool:

| State type | Recommended owner |
|---|---|
| Temporary input or UI state | Component state |
| URL-shareable filters and pagination | URL state |
| Remote API data | Server-state cache |
| Shared client-only workflow state | Focused store |
| Derived values | Computation from source state |

Avoid duplicating server data in multiple client stores. Prefer derived state over manually synchronized copies.

## 8. Error Handling

Every asynchronous flow should explicitly handle:

- loading;
- success;
- empty result;
- expected failure;
- unexpected failure;
- retry or recovery behavior where appropriate.

Use typed errors or error categories when they improve recovery. Do not silently swallow errors. Error messages shown to users should be understandable, while logs should contain enough context to diagnose the issue without exposing secrets or personal data.

## 9. Types and Contracts

- Enable strict type checking where possible.
- Prefer discriminated unions for finite states.
- Validate data received from outside the application at the boundary.
- Do not use `any` to bypass uncertainty; use `unknown` and narrow it safely.
- Keep API contracts close to the client or domain boundary that uses them.
- Treat type assertions as exceptions that require a clear reason.

## 10. Dependencies and Configuration

- Add a dependency only when its value exceeds its maintenance and bundle cost.
- Prefer one established library over multiple overlapping libraries.
- Pin or lock dependency versions through the package manager lockfile.
- Remove unused dependencies and configuration.
- Keep secrets out of source control; document required environment variables with safe examples.
- Separate development, test, and production configuration.

## 11. Code Review Checklist

Before opening a pull request, verify:

- the change has a clear purpose;
- naming and folder ownership are consistent;
- business logic is not unnecessarily coupled to UI code;
- loading, empty, and error states are handled;
- tests cover the important behavior and regression risk;
- no debug logs, dead code, secrets, or generated artifacts were added;
- public APIs and types are intentionally designed;
- performance and accessibility impact were considered;
- documentation is updated when behavior or setup changes.

## 13. Automation

Run these checks locally and in CI:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The exact commands may differ by repository. The minimum CI gate should include formatting/linting, type checking, tests, and a production build when applicable.

## 14. Refactoring Rules

1. Establish or preserve tests before a risky refactor.
2. Change one concern at a time.
3. Keep commits small and explain the intent in commit messages.
4. Measure performance before and after optimization.
5. Do not combine broad formatting changes with behavioral changes.
6. Remove obsolete code and compatibility layers once migration is complete.

## 15. Anti-Patterns

Avoid:

- giant components or modules;
- generic `utils` folders that become dumping grounds;
- duplicated server state;
- deep nesting and clever one-liners;
- premature abstractions;
- comments that repeat the code;
- commented-out code;
- catch blocks that ignore failures;
- broad type assertions;
- unrelated changes in one pull request.

## 16. Definition of Done

A repository change is clean enough to merge when:

- its intent and ownership are obvious;
- dependencies and boundaries remain understandable;
- expected UI and API states are handled;
- relevant automated checks pass;
- the change has appropriate tests;
- no avoidable cleanup debt is introduced;
- another developer can maintain it without relying on the original author.

## 17. Future Skill Interface

When converted into an agent skill, the skill should accept a repository path and return:

1. a structural assessment;
2. the highest-risk cleanliness issues;
3. concrete recommended changes;
4. files that should be inspected or modified;
5. validation commands;
6. a concise definition of done.

The skill must inspect before modifying, preserve unrelated user changes, avoid destructive operations, and ask for confirmation before broad refactors or behavior changes.