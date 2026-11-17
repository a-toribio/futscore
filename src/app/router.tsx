import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/AppLayout'
import { RootErrorPage } from '@/components/RootErrorPage'
import { HomePage } from '@/features/matches/HomePage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RootErrorPage />,
    children: [{ index: true, element: <HomePage /> }],
  },
])
