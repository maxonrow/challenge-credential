import PlainLayout from '../views/Layouts/PlainLayout';

const MainPage = () => import('@/views/MainPage');

export const routes = [
  {
    path: '/',
    name: 'PlainLayout',
    component: PlainLayout,
    redirect: { name: 'MainPage' },
    children: [
      {
        path: 'main-page',
        name: 'MainPage',
        component: MainPage,
      },
    ],
  },
];
