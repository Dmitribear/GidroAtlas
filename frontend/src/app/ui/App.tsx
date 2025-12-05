import { HomePage } from '@pages/home'
import { ProfilePage } from '@pages/profile'

export const App = () => {
  const path = window.location.pathname
  if (path.startsWith('/profile')) {
    return <ProfilePage />
  }
  return <HomePage />
}
