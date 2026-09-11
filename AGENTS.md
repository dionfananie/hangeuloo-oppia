# Repository Development Guidelines

Before changing code, read [`plan/clean-code-repository.md`](plan/clean-code-repository.md). It is the source of truth for repository structure, naming, responsibilities, UI boundaries, error handling, types, testing, and review standards.

## Readable Code

- Keep JSX and JavaScript/TypeScript easy to scan. Do not put large elements, conditionals, event handlers, object literals, or multiple statements on one line.
- Extract complex event handlers, derived values, and repeated UI into named functions or components when doing so clarifies intent.
- Keep presentational components focused on rendering and interaction; move data loading and business logic into hooks, helpers, or server modules.
- Use descriptive names and early returns instead of deeply nested expressions or clever one-liners.
- Run `npm run format` on changed source files before submitting a change.
- Run `npm run format:check` to verify that tracked source files are formatted.

Formatting is automated with Prettier. Do not make broad formatting-only changes together with behavioral changes.
