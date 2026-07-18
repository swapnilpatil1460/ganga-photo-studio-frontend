
import { BrowserRouter as Router, Routes, Route, Outlet, useOutletContext } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import CustomerDetails from './pages/CustomerDetails';
import InvoicePage from './pages/InvoicePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetails from './pages/OrderDetails';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetails from './pages/EmployeeDetails';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import BackupPage from './pages/BackupPage';
import SettingsPage from './pages/SettingsPage';
import SchedulePage from './pages/SchedulePage';
import PricingPage from './pages/PricingPage';
import BillingPage from './pages/BillingPage';
import ProtectedRoute from './components/ProtectedRoute';

const OwnerLayout = () => {
  const context = useOutletContext();
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <Outlet context={context} />
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="backup" element={<BackupPage />} />
          
          {/* Restricted Owner Routes */}
          <Route element={<OwnerLayout />}>
            <Route path="pricing" element={<PricingPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="invoices/:orderId" element={<InvoicePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
