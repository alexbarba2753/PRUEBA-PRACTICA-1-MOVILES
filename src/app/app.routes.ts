import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'incidencias',
        loadComponent: () => import('./pages/incidencias-list/incidencias-list.page').then(m => m.IncidenciasListPage)
      },
      {
        path: 'nueva',
        loadComponent: () => import('./pages/incidencia-form/incidencia-form.page').then(m => m.IncidenciaFormPage)
      },
      {
        path: 'seguimiento',
        loadComponent: () => import('./pages/seguimiento-list/seguimiento-list.page').then(m => m.SeguimientoListPage)
      }
    ]
  },
  {
    path: 'incidencias/nueva',
    redirectTo: 'tabs/nueva',
    pathMatch: 'full'
  },
  {
    path: 'incidencias/:id',
    loadComponent: () => import('./pages/incidencia-detail/incidencia-detail.page').then(m => m.IncidenciaDetailPage)
  },
  {
    path: '**',
    redirectTo: 'tabs'
  }
];
