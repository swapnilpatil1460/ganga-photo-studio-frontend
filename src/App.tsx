import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route, Outlet, useOutletContext } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import AnalyticsTracker from './components/AnalyticsTracker';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerForm = lazy(() => import('./pages/CustomerForm'));
const CustomerDetails = lazy(() => import('./pages/CustomerDetails'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const BackupPage = lazy(() => import('./pages/BackupPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));

const OwnerLayout = () => {
  const context = useOutletContext();
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <Outlet context={context} />
    </ProtectedRoute>
  );
};

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      <p className="mt-4 text-sm font-medium text-gray-500">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
      <Analytics />
    </Router>
  );
}

export default App;
