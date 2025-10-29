import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { ToastProvider } from "./components/ToastProvider";

// Layouts
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/Dashboard";
import ProfessorDashboard from "./pages/professor/Dashboard";
import RegistrarDashboard from "./pages/registrar/Dashboard";
import AdmissionDashboard from "./pages/admission/Dashboard";
import AdmissionEnrollmentForm from "./pages/admission/EnrollmentForm";
import AdmissionApplicants from "./pages/admission/Applicants";
import AdmissionAnalytics from "./pages/admission/AdmissionAnalytics";
import AdmissionPrograms from "./pages/admission/Programs";
import DeanDashboard from "./pages/dean/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPrograms from "./pages/admin/Programs";
import AdminCurriculum from "./pages/admin/Curriculum";
import AdminSettings from "./pages/admin/Settings";
import AdminAnalytics from "./pages/admin/Analytics";

function ProtectedRoute({ children, role }) {
  const { user, token, initialized } = useAuthStore();
  if (!initialized) return (
    <div className="h-screen grid place-items-center text-gray-300">Loading…</div>
  );
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastProvider>
      <Router>
        <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Student */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Professor */}
        <Route
          path="/professor/dashboard"
          element={
            <ProtectedRoute role="professor">
              <ProfessorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Registrar */}
        <Route
          path="/registrar/dashboard"
          element={
            <ProtectedRoute role="registrar">
              <RegistrarDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admission */}
        <Route
          path="/admission/dashboard"
          element={
            <ProtectedRoute role="admission">
              <AdmissionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/enroll"
          element={
            <ProtectedRoute role="admission">
              <AdmissionEnrollmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/applicants"
          element={
            <ProtectedRoute role="admission">
              <AdmissionApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/analytics"
          element={
            <ProtectedRoute role="admission">
              <AdmissionAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/programs"
          element={
            <ProtectedRoute role="admission">
              <AdmissionPrograms />
            </ProtectedRoute>
          }
        />

        {/* Dean */}
        <Route
          path="/dean/dashboard"
          element={
            <ProtectedRoute role="dean">
              <DeanDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <ProtectedRoute role="admin">
              <AdminPrograms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/curriculum"
          element={
            <ProtectedRoute role="admin">
              <AdminCurriculum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
