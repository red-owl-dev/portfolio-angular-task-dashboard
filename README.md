# Angular Task Dashboard

[![CI](https://github.com/red-owl-dev/portfolio-angular-task-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/red-owl-dev/portfolio-angular-task-dashboard/actions/workflows/ci.yml)
[![Angular 21](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

An Angular application built to demonstrate modern frontend development practices. The project focuses on feature organization, component composition, shared state, forms, HTTP integration, testing, continuous integration, and containerized production builds.

## Live Demo

Deployment configuration is included and will be enabled after GitHub Pages is available for the repository.

## Project Goals

This project provides a compact example of:

- Modern Angular with standalone components
- A simple, feature-based architecture
- Reusable presentational components
- Shared and derived state with Angular Signals
- Reactive Forms and validation
- REST API integration with RxJS
- Unit and component testing
- CI and deployment automation with GitHub Actions
- A multi-stage Docker production build

## Main Features

- Dashboard with total, pending, in-progress, completed, and overdue task indicators
- Upcoming task summary ordered by due date
- Task listing with loading, error, and empty states
- Search by title or description
- Combined status and priority filters
- Sorting by due date, title, or priority
- Task creation, editing, and deletion
- REST API integration for all task operations
- Friendly, centralized HTTP error messages

## Technologies

### Frontend

- Angular 21
- TypeScript 5.9
- SCSS
- RxJS
- Angular Router
- Reactive Forms
- Angular Signals

### Quality

- ESLint with angular-eslint
- Vitest
- Angular TestBed
- GitHub Actions

### Infrastructure

- Docker
- Nginx Alpine
- GitHub Pages workflow

## Technical Practices

- Standalone components throughout the application
- Lazy-loaded route components
- Feature-based organization for dashboard and task flows
- Non-nullable Reactive Forms with field validation
- Dependency Injection for services and shared state
- Separation between container and presentational components
- Signal-based shared state with read-only and computed signals
- Functional HTTP interceptor for centralized error mapping
- Task state updates only after successful API operations
- Responsive layouts implemented with SCSS
- Unit and component tests focused on observable behavior

## Project Structure

```text
src/app
|-- core
|   |-- interceptors
|   |-- models
|   `-- services
|-- features
|   |-- dashboard
|   `-- tasks
|-- layout
|   |-- header
|   |-- shell
|   `-- sidebar
|-- app.config.ts
`-- app.routes.ts
```

## Architecture Decisions

**Signals instead of NgRx:** the application has a small state surface, so a signal-based store provides shared and computed state without introducing an additional state-management dependency.

**Feature-based organization:** dashboard and task code are grouped by user-facing feature, keeping related pages, components, and state close together.

**No design system:** the interface has a limited set of UI elements. Small reusable components, such as task and summary cards, cover the current needs without adding a broader abstraction.

**Separate HTTP and state responsibilities:** `TaskService` owns REST communication, while `TaskStore` owns loading, errors, task state, and derived values. Components consume the store and remain focused on interaction and presentation.

**Purposeful abstractions:** the project avoids generic HTTP layers and other abstractions that would add indirection without solving a current requirement.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the included mock REST API:

```bash
npm run api:mock
```

In another terminal, start the Angular development server:

```bash
npm start
```

Open `http://localhost:4200`.

The application expects a task API to be available at the URL configured in the active environment. For local development, the default is `http://localhost:5000/api`. The dependency-free mock API stores data in memory and resets its sample tasks whenever it restarts. An external API can be used instead, provided it supports the documented endpoints and allows CORS requests from `http://localhost:4200`.

## Environment Configuration

API URLs are configured in:

```text
src/environments/environment.ts
src/environments/environment.development.ts
```

Configuration format:

```typescript
export const environment = {
  apiUrl: 'http://localhost:5000/api',
};
```

The task service uses the following endpoints:

```text
GET    /tasks
GET    /tasks/{id}
POST   /tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
```

For a hosted build, `apiUrl` must point to an API reachable by the browser, and that API must allow the deployed origin.

## Available Scripts

```bash
npm start
npm run build
npm run lint
npm run test
npm run test:ci
npm run api:mock
```

`npm run test:ci` executes the test suite once without watch mode.

`npm run api:mock` starts the local in-memory REST API on port `5000`.

## Running with Docker

Build and run the production image:

```bash
npm run api:mock
docker build -t angular-task-dashboard .
docker run --name angular-dashboard --rm -p 8080:80 angular-task-dashboard
```

Open `http://localhost:8080`.

The mock API remains a separate host process and is not included in the runtime image. The multi-stage image builds the Angular application with Node.js 24 and serves only the generated static files from Nginx. Nginx also provides the fallback required for Angular routes.

## Continuous Integration

The CI workflow runs for pushes and pull requests. It uses Node.js 24 and performs:

- Dependency installation with `npm ci`
- ESLint checks
- Tests in non-interactive mode
- Production build

## Testing

The test suite covers the behavior of:

- `TaskStore`, including computed state and success and error paths
- `TaskService` URLs, HTTP methods, and payloads
- Reactive task form validation and events
- Task search, combined filters, sorting, navigation, and deletion
- Dashboard summaries and upcoming task selection
- Centralized HTTP error handling
- Task creation and editing flows

Run the non-interactive suite with:

```bash
npm run test:ci
```

## Deployment

GitHub Pages deployment is defined in a workflow separate from CI. A push to `main` triggers a production build, creates an SPA fallback page, uploads the static files, and deploys them with the official GitHub Pages actions.

The workflow uses `/portfolio-angular-task-dashboard/`, matching the repository name, as its base href. GitHub Pages must be enabled under `Settings -> Pages -> Build and deployment -> Source: GitHub Actions` before the first deployment.

## Screenshots

<!-- Add dashboard screenshot -->
<!-- Add task list screenshot -->
<!-- Add task form screenshot -->

## Scope

The project is intentionally small and focused on core Angular frontend practices. It does not use NgRx, Micro Frontends, server-side rendering, a heavy UI library, full authentication, or generic HTTP abstractions. These choices keep the implementation proportional to its current requirements and make the state and data flow easier to inspect.

## Future Improvements

- Authentication and authorization
- API pagination
- End-to-end tests
- Broader accessibility coverage
- A deployed backend with persistent storage
