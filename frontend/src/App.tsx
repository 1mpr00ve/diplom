import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EventPage from './pages/EventPage'
import LoginPage from './pages/LoginPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProfilePage from './pages/ProfilePage'
import OrganizerDashboard from './pages/OrganizerDashboard'
import CreateEventPage from './pages/CreateEventPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events/:id" element={<EventPage />} />
      <Route path="/events/new" element={<CreateEventPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders/:id" element={<OrderSuccessPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/dashboard" element={<OrganizerDashboard />} />
    </Routes>
  )
}

export default App
