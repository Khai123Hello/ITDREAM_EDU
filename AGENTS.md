# AGENTS.md

React frontend (Create React App via craco) for a nail services marketplace. Environment-based builds with Redux/Redux-Saga for state management.

## Quick Reference

**Project**: nail-fe | **Type**: React SPA | **Build Tool**: craco | **State**: Redux/Redux-Saga | **CSS**: SCSS with CSS Modules

### Essential Commands

```bash
npm start                    # Dev server (uses .beta env)
npm run build:dev          # Build with .dev env
npm run build:beta         # Build with .beta env (default)
npm run build:staging      # Build with .staging env
npm run build:production   # Build with .production env (final build)

npm run lint               # Fix ESLint issues in src/**/*.js
npm run format             # Format code with Prettier
npm run i18n               # Extract react-intl messages to src/locales/en
npm test                   # Run tests (React Scripts)
```

## Build & Environment

**Environments**: Four distinct env configs loaded via `env-cmd`:
- `.beta` → **start** & **build:beta** (default dev)
- `.dev` → **build:dev**
- `.staging` → **build:staging**
- `.production` → **build:production** (missing in repo; agent must handle gracefully)

Craco aliases all `src/*` dirs as `@componentName` (e.g. `@components`, `@store`, `@utils`). Module resolution is automatic via craco.config.js.

CSS Modules: auto-enabled with camelCase export convention. Class names are hashed in production (`REACT_APP_ENV !== 'dev'`).

## Code Style & Validation

**Pre-commit Hook** (.husky/pre-commit): 
- Runs `npx cross-env ESLINT_ENV=commit lint-staged` 
- Only lints changed `*.js` files via lint-staged config
- **Important**: Hook runs `cd source` before linting; runs from parent repo directory

**ESLint Config** (.eslintrc.js):
- 4-space indentation (SwitchCase: 4)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: off
- `simple-import-sort`: organized groups (react, imports, internals, relative, css)
- `no-console`: error during commits (`ESLINT_ENV=commit`), warn otherwise
- `.husky/appServer.js` is ignored

**Prettier** (.prettierrc):
- Tab width: 4 | Print width: 120 | Trailing commas: always
- Single quotes | Semicolons always | Bracket spacing

**Babel** (.babelrc):
- Presets: @babel/preset-react, @babel/preset-env
- Plugin: react-intl-auto with options: removePrefix "src/", useKey true, filebase true, includeExportName true

## Architecture & Modules

**Root folders in src/**:
- `assets/` - SCSS, images, static resources
- `components/` - Reusable React components
- `constants/` - App constants
- `hooks/` - Custom React hooks
- `locales/` - i18n message catalogs (LanguageProvider wraps app)
- `modules/` - Feature modules (containers, layout)
  - `modules/containers/` - Page containers (dashboard, landing, login, profile, register)
  - `modules/layout/` - Layout components
- `routes/` - Routing config
- `selectors/` - Redux selectors
- `services/` - API services (axios)
- `store/` - Redux setup
  - `actions/`, `reducers/`, `sagas/`, `utils.js`, `index.js`
- `utils/` - Utility functions

**Entry Point**: `src/index.js` → `src/App.js` | Redux Provider → LanguageProvider wraps routes

**Internationalization**: react-intl with auto-extraction. Run `npm run i18n` to generate/update src/locales/en. Plugin auto-keys messages based on file path and export name.

## Testing

`npm test` spawns React Scripts test runner (no custom Jest config, inherits ESLint rules from .eslintrc.js jest env). Tests should follow `__tests__/` directories or `*.test.js` naming convention. Minimal test coverage currently in repo (verify with `npm test -- --coverage`).

## Build Output

Craco produces `build/` folder. appServer.js (at project root, ignored by ESLint) is an Express server for SSR/meta-tag injection on detail routes (course, news, expert pages). Maps routes to fetch data and inject og:meta tags.

## Important Gotchas

1. **Env file must exist** for chosen build target. `.production` is referenced in package.json but does not exist in repo—create before running that build.
2. **Husky hook context**: Pre-commit hook changes `cd source` before linting; runs from parent directory.
3. **ESLINT_ENV=commit** is set only in pre-commit hook; `no-console` is soft warn in dev, hard error at commit time.
4. **Craco alias resolution is automatic**—use `@moduleName` in imports; no manual path config needed.
5. **Redux-Saga for async**: store uses sagas; check `src/store/sagas/` for async logic, not thunks.
6. **Minimal test coverage**: only 1 test file exists (App.test.js). Add new tests in `__tests__/` or as `*.test.js` files.

## Notable Dependencies

- React 18.3, React Router 6.5, Redux/Redux-Saga
- TanStack React Query 5.59 & React Table 8.20 (data fetching & tables)
- Ant Design components (rc-* packages for low-level UI)
- Radix UI (collapsible, dialog, dropdown, tooltip)
- react-intl (i18n)
- axios (HTTP client)
- dayjs, lodash, yup (utilities)
