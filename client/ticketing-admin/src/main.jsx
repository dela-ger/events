import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import PrivateRoute from './routes/PrivateRoutes.jsx'
import Events from './pages/Events.jsx'
import CRM from './pages/CRM.jsx'
import Navbar from './components/Navbar.jsx'
import CreateEvent from './pages/CreateEvent.jsx'
import EditEvent from './pages/EditEvent.jsx'
import CreateTicket from './pages/CreateTicket.jsx'
import EventDetail from './pages/EventDetail.jsx'
import EditTicket from './pages/EditTicket.jsx';
import Sales from './pages/Sales.jsx';
import SalesSummary from './pages/SalesSummary.jsx';
import PaymentCallback from './components/payments/PaymentCallback.jsx'
import TicketsPage from './pages/customer/TicketsPage.jsx'
import TicketDetailPage from './pages/customer/TicketDetailPage.jsx'


createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
        <Route path="/crm" element={<PrivateRoute><CRM /></PrivateRoute>} />
        <Route path='/events/create' element={<CreateEvent />} />
        <Route path='/events/:id/edit' element={<EditEvent />} />
        <Route path='/events/:id/' element={<EventDetail />} />
        <Route path='/events/:id/tickets/create' element={<CreateTicket />} />
        <Route path="/tickets/:id/edit" element={<EditTicket />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/summary" element={<SalesSummary />} />
        <Route path="/payments/callback" element={<PaymentCallback />} />
        <Route path='/tickets' element={<TicketsPage />} />
        <Route path='/tickets/:id' element={<TicketDetailPage />} />
        <Route path='/login'element={<Login />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
)
