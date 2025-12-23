import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/Shared/ProtectedRoute";
import Login from "./components/Shared/Login";
import Register from "./components/Shared/Register"; // Import the Register component
import Layout from "./components/Shared/Layout";

// Admin
import UserManagement from "./components/Admin/UserManagement";
import PermissionsDashboard from "./components/Admin/PermissionsDashboard";
import SystemReports from "./components/Admin/SystemReports";

// Doctor
import ScheduleManager from "./components/Doctor/ScheduleManager";
import AppointmentList from "./components/Doctor/AppointmentList";
import PatientRecords from "./components/Doctor/PatientRecords";

// Patient
import BookAppointment from "./components/Patient/BookAppointment";
import MyAppointments from "./components/Patient/MyAppointments";
import ViewBilling from "./components/Patient/ViewBilling";
import DownloadReceipt from "./components/Patient/DownloadReceipt";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* LOGIN & REGISTER PAGES — NO NAVBAR, NO LAYOUT */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* New Register Route */}

        {/* ALL OTHER PAGES USE LAYOUT */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <AdminRoutes />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Routes */}
                <Route
                  path="/doctor/*"
                  element={
                    <ProtectedRoute allowedRoles={["Doctor"]}>
                      <DoctorRoutes />
                    </ProtectedRoute>
                  }
                />

                {/* Patient Routes */}
                <Route
                  path="/patient/*"
                  element={
                    <ProtectedRoute allowedRoles={["Patient"]}>
                      <PatientRoutes />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

/* ---------------- HOME PAGE ---------------- */
function Home() {
  const { user } = useAuth();

  return (
    <div className="text-center mt-12">
      <h1 className="text-3xl font-semibold">Clinic Dashboard</h1>

      {user ? (
        <div className="mt-3 text-gray-600">
          <p>
            Welcome, {user.full_name} ({user.role})!
          </p>
          <p>User ID: {user.user_id}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <>
          <p className="mt-3 text-gray-600">
            Please log in to access the dashboard.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Login
            </a>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- ADMIN ROUTES ---------------- */
function AdminRoutes() {
  return (
    <Routes>
      <Route path="" element={<UserManagement />} />
      <Route path="permissions" element={<PermissionsDashboard />} />
      <Route path="reports" element={<SystemReports />} />
    </Routes>
  );
}

/* ---------------- DOCTOR ROUTES ---------------- */
function DoctorRoutes() {
  return (
    <Routes>
      <Route path="" element={<ScheduleManager />} />
      <Route path="appointments" element={<AppointmentList />} />
      <Route path="records" element={<PatientRecords />} />
    </Routes>
  );
}

/* ---------------- PATIENT ROUTES ---------------- */
function PatientRoutes() {
  return (
    <Routes>
      <Route path="" element={<BookAppointment />} />
      <Route path="my" element={<MyAppointments />} />
      <Route path="billing" element={<ViewBilling />} />
      <Route path="receipt/:id" element={<DownloadReceipt />} />
    </Routes>
  );
}

/* ---------------- NOT FOUND ---------------- */
function NotFound() {
  return (
    <div className="text-center mt-12">
      <h2 className="text-2xl">404 — Page not found</h2>
    </div>
  );
}
