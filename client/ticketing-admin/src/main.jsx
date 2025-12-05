import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import PrivateRoute from './routes/PrivateRoutes.jsx'
import Events from './pages/Events.jsx'
import CRM from './pages/CRM.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
        <Route path="/crm" element={<PrivateRoute><CRM /></PrivateRoute>} />
        <Route path='/login'element={<Login />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
)
