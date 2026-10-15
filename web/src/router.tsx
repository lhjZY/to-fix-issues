import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { mockProject } from './mocks/projects.ts'
import { IssueListPage } from './pages/IssueListPage.tsx'
import { IssueDetailPage } from './pages/IssueDetailPage.tsx'
import { PlaceholderPage } from './pages/PlaceholderPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to={`/projects/${mockProject.key}/issues`} replace /> },
      { path: '/projects/:projectKey/issues', element: <IssueListPage /> },
      { path: '/inbox', element: <PlaceholderPage title="Inbox" /> },
      { path: '/my-issues', element: <PlaceholderPage title="My issues" /> },
      { path: '/issue/:identifier', element: <IssueDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
