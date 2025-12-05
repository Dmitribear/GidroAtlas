import { HomePage } from '@pages/home'
import { ProfilePage } from '@pages/profile'
import { MapsPage } from '@pages/maps'
import { ReportsPage } from '@pages/reports'

export const App = () => {
  const path = window.location.pathname
  if (path.startsWith('/maps')) {
    return <MapsPage />
  }
  if (path.startsWith('/profile')) {
    return <ProfilePage />
  }
  if (path.startsWith('/reports')) {
    return <ReportsPage />
  }
  return <HomePage />
}
