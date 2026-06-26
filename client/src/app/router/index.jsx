import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/auth.provider.jsx';
import PrivateRoute from './private.routes.jsx';
import PublicRoute from './public.routes.jsx';

// Layouts
import AuthLayout from '../../layouts/auth.layout.jsx';
import DashboardLayout from '../../layouts/dashboard.layout.jsx';

// Auth Pages
import Login from '../../pages/auth/login.jsx';
import Register from '../../pages/auth/register.jsx';

// Dashboard Pages
import Dashboard from '../../pages/dashboard/index.jsx';
import ClientsList from '../../pages/clients/list.jsx';
import ClientDetail from '../../pages/clients/detail.jsx';
import ClientCreate from '../../pages/clients/create.jsx';
import ClientEdit from '../../pages/clients/edit.jsx';
import CasesList from '../../pages/cases/list.jsx';
import CaseDetail from '../../pages/cases/detail.jsx';
import CaseCreate from '../../pages/cases/create.jsx';
import CaseEdit from '../../pages/cases/edit.jsx';
import DocumentsList from '../../pages/documents/list.jsx';
import DocumentUpload from '../../pages/documents/upload.jsx';
import DocumentEdit from '../../pages/documents/edit.jsx';
import DocumentDetail from '../../pages/documents/detail.jsx';
import TasksList from '../../pages/tasks/list.jsx';
import TaskDetail from '../../pages/tasks/detail.jsx';
import TaskCreate from '../../pages/tasks/create.jsx';  // ← BUNU EKLE!
import TaskEdit from '../../pages/tasks/edit.jsx';
import MeetingsList from '../../pages/meetings/list.jsx';
import MeetingCreate from '../../pages/meetings/create.jsx';
import MeetingDetail from '../../pages/meetings/detail.jsx';
import MeetingEdit from '../../pages/meetings/edit.jsx';
import Calendar from '../../pages/calendar/index.jsx';
import Finance from '../../pages/finance/index.jsx';
import FinanceCreate from '../../pages/finance/create.jsx';
import AIAssistant from '../../pages/ai/index.jsx';
import Search from '../../pages/search/index.jsx';
import Settings from '../../pages/settings/index.jsx';
import EventCreate from '../../pages/events/create.jsx';
import EventDetail from '../../pages/events/detail.jsx';
import EventEdit from '../../pages/events/edit.jsx';

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/create" element={<ClientCreate />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientEdit />} />
          
          <Route path="/cases" element={<CasesList />} />
          <Route path="/cases/create" element={<CaseCreate />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/cases/:id/edit" element={<CaseEdit />} />
          
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/upload" element={<DocumentUpload />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
<Route path="/documents/:id/edit" element={<DocumentEdit />} />
           
          <Route path="/meetings" element={<MeetingsList />} />
<Route path="/meetings/create" element={<MeetingCreate />} />
<Route path="/meetings/:id" element={<MeetingDetail />} />
<Route path="/meetings/:id/edit" element={<MeetingEdit />} />
          <Route path="/tasks" element={<TasksList />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/create" element={<TaskCreate />} />  // ← BUNU EKLE!
          <Route path="/tasks/:id/edit" element={<TaskEdit />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/events/create" element={<EventCreate />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EventEdit />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/finance/create" element={<FinanceCreate />} />  // ← BUNU EKLE!
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRouter;