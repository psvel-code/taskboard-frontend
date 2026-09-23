import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { KanbanComponent } from './features/kanban/kanban.component';
import { TaskListComponent } from './features/task-list/task-list.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'kanban',
        component: KanbanComponent
      },
      {
        path: 'task-list',
        component: TaskListComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
