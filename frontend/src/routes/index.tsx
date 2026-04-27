import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

import { PatientDashboard } from '../pages/patient/Dashboard';
import { BookAppointment } from '../pages/patient/BookAppointment';
import { PatientAppointments } from '../pages/patient/Appointments';

import { DoctorDashboard } from '../pages/doctor/Dashboard';
import { DoctorSlots } from '../pages/doctor/MySlots';
import { DoctorAppointments } from '../pages/doctor/Appointments';
import { DoctorProfile } from '../pages/doctor/Profile';

import { AdminDashboard } from '../pages/admin/Dashboard';
import { ManageDoctors } from '../pages/admin/ManageDoctors';
import { ManageAdmins } from '../pages/admin/ManageAdmins';
import { AllAppointments } from '../pages/admin/AllAppointments';


export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  // Patient Routes
  {
    path: '/patient',
    element: <ProtectedRoute allowedRoles={['Patient']} />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { path: '', element: <PatientDashboard /> },
          { path: 'book', element: <BookAppointment /> },
          { path: 'appointments', element: <PatientAppointments /> }
        ]
      }
    ]
  },
  // Doctor Routes
  {
    path: '/doctor',
    element: <ProtectedRoute allowedRoles={['Doctor']} />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { path: '', element: <DoctorDashboard /> },
          { path: 'schedule', element: <DoctorSlots /> },
          { path: 'appointments', element: <DoctorAppointments /> },
          { path: 'profile', element: <DoctorProfile /> }
        ]
      }
    ]
  },
  // Admin Routes
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { path: '', element: <AdminDashboard /> },
          { path: 'doctors', element: <ManageDoctors /> },
          { path: 'admins', element: <ManageAdmins /> },
          { path: 'appointments', element: <AllAppointments /> }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <div>404 Not Found</div>
  }
]);
