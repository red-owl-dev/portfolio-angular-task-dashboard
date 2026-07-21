# Angular Task Dashboard

[![CI](https://github.com/red-owl-dev/portfolio-angular-task-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/red-owl-dev/portfolio-angular-task-dashboard/actions/workflows/ci.yml)
[![Angular 21](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

An Angular application built to demonstrate modern frontend development practices, with shared state, REST integration, automated tests, CI/CD, and containerized production builds.

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
- Docker Compose
- Nginx Alpine
- GitHub Pages workflow

## Engineering Highlights

- Standalone components throughout the application
- Lazy-loaded route components
- Feature-based organization for dashboard and task flows
- Non-nullable Reactive Forms with field validation
- Dependency Injection for services and shared state
- Separation between container and presentational components
- Signal-based shared state with read-only and computed signals
- Functional HTTP interceptor for centralized error mapping
- Task state updates only after successful API operations
- Environment-based REST API configuration
- Responsive layouts implemented with SCSS
- Unit and component tests focused on observable behavior
- Multi-stage Docker build with an Nginx runtime and SPA fallback
- Docker Compose orchestration for the frontend and mock API

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

## Architecture

- Signals provide shared and computed state without an additional state library.
- Features group related pages, components, and state.
- `TaskService` handles HTTP communication and `TaskStore` manages application state.
- Reusable components remain presentational and business rules stay in the appropriate layer.
- Abstractions are kept proportional to the project's scope.

## Continuous Integration

Pushes and pull requests trigger a GitHub Actions workflow with Node.js 24 that performs:

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

## Scope

The project is intentionally focused on core Angular frontend practices. The included mock API is dependency-free and stores data in memory; persistent backend storage and authentication are outside the current scope.

## Future Improvements

- Authentication and authorization
- API pagination
- End-to-end tests
- Broader accessibility coverage
- A deployed backend with persistent storage
