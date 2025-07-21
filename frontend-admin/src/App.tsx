import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import UserListPage from './pages/UserListPage';
import UserEditPage from './pages/UserEditPage';
import ForgeListPage from './pages/ForgeListPage';
import ForgeCreatePage from './pages/ForgeCreatePage';
import ForgeEditPage from './pages/ForgeEditPage';
import CrucibleListPage from './pages/CrucibleListPage';
import CrucibleCreatePage from './pages/CrucibleCreatePage';
import CrucibleEditPage from './pages/CrucibleEditPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import KnowledgeBaseNewPage from './pages/KnowledgeBaseNewPage';
import KnowledgeBaseEditPage from './pages/KnowledgeBaseEditPage';
import ChannelsPage from './pages/ChannelsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/sign-in/*"
          element={<SignIn routing="path" path="/sign-in" />}
        />
        <Route
          path="/*"
          element={
            <>
              <SignedIn>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/admin/dashboard" element={<DashboardPage />} />
                    <Route path="/admin/users" element={<UserListPage />} />
                    <Route path="/admin/users/edit/:id" element={<UserEditPage />} />
                    <Route path="/admin/forge" element={<ForgeListPage />} />
                    <Route path="/admin/forge/create" element={<ForgeCreatePage />} />
                    <Route path="/admin/forge/edit/:id" element={<ForgeEditPage />} />
                    <Route path="/admin/crucible" element={<CrucibleListPage />} />
                    <Route path="/admin/crucible/create" element={<CrucibleCreatePage />} />
                    <Route path="/admin/crucible/edit/:id" element={<CrucibleEditPage />} />
                    <Route path="/admin/knowledge-base" element={<KnowledgeBasePage />} />
                    <Route path="/admin/knowledge-base/new" element={<KnowledgeBaseNewPage />} />
                    <Route path="/admin/knowledge-base/edit/:id" element={<KnowledgeBaseEditPage />} />
                    <Route path="/admin/channels" element={<ChannelsPage />} />
                    <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                  </Route>
                </Routes>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
