import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import NewProject from './pages/NewProject'
import Viewer from './pages/Viewer'
import Settings from './pages/Settings'
import EditProject from './pages/EditProject'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/new', element: <NewProject /> },
  { path: '/viewer/:slug', element: <Viewer /> },
  { path: '/settings', element: <Settings /> },
  { path: '/edit/:slug', element: <EditProject /> },
])
