import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProjectsPage } from '../features/projects/ProjectsPage';
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage';
import { MyTasksPage } from '../features/tasks/MyTasksPage';
import { UsersPage } from '../features/users/UsersPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:projectId', element: <ProjectDetailPage /> },
          { path: '/tasks/my', element: <MyTasksPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['ADMIN']} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: '/admin/users', element: <UsersPage /> }],
      },
    ],
  },
]);
