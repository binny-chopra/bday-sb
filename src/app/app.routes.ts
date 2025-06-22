import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/homepage/homepage.component').then(
        (m) => m.HomepageComponent
      ),
    title: 'Homepage',
  },
  {
    path: 'birthday',
    loadComponent: () =>
      import('./components/birthday/birthday.component').then(
        (m) => m.BirthdayComponent
      ),
    title: 'Birthday',
  },
  {
    path: 'cake',
    loadComponent: () =>
      import('./components/cake/cake.component').then((m) => m.CakeComponent),
    title: 'Cake',
  },
  {
    path: 'card',
    loadComponent: () =>
      import('./components/card/card.component').then((m) => m.CardComponent),
    title: 'Card',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
