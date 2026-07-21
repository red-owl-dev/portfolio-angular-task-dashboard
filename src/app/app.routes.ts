import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'tasks',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/tasks/tasks').then((m) => m.Tasks),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/tasks/pages/task-create/task-create').then((m) => m.TaskCreate),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/tasks/pages/task-edit/task-edit').then((m) => m.TaskEdit),
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
