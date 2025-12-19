import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import PrivateRoute from './features/auth/PrivateRoute';
import RoleRoute from './features/auth/RoleRoute';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import DoctorListPage from './features/doctors/DoctorListPage';
import AdminListPage from './features/admins/AdminListPage';
import MySchedulePage from './pages/MySchedulePage';
import ChatsPage from './pages/ChatsPage';
import ArticlesPage from './pages/ArticlesPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/doctors" element={<DoctorListPage />} />
            <Route path="/schedule" element={<MySchedulePage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/articles" element={<ArticlesPage />} />



            <Route element={<RoleRoute allowedRoles={['ROOT']} />}>
              <Route path="/admins" element={<AdminListPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
