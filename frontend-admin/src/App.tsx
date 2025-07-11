import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import SignInPage from './pages/SignInPage';
import UserListPage from './pages/UserListPage';
import UserEditPage from './pages/UserEditPage';
import ForgeListPage from './pages/ForgeListPage';
import ForgeCreatePage from './pages/ForgeCreatePage';
import ForgeEditPage from './pages/ForgeEditPage';
import CrucibleListPage from './pages/CrucibleListPage';
import CrucibleCreatePage from './pages/CrucibleCreatePage';
import CrucibleEditPage from './pages/CrucibleEditPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<SignInPage />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UserListPage />} />
            <Route path="users/edit/:id" element={<UserEditPage />} />
            <Route path="forge" element={<ForgeListPage />} />
            <Route path="forge/create" element={<ForgeCreatePage />} />
            <Route path="forge/edit/:id" element={<ForgeEditPage />} />
            <Route path="crucible" element={<CrucibleListPage />} />
            <Route path="crucible/create" element={<CrucibleCreatePage />} />
            <Route path="crucible/edit/:id" element={<CrucibleEditPage />} />
            <Route path="knowledge-base" element={<KnowledgeBasePage />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
