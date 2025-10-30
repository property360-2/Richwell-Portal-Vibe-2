import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import ProfessorDashboard from "./pages/professor/Dashboard.jsx";
import RegistrarDashboard from "./pages/registrar/Dashboard.jsx";
import AdmissionDashboard from "./pages/admission/Dashboard.jsx";
import AdmissionEnrollmentForm from "./pages/admission/EnrollmentForm.jsx";
import EnrollmentPage from "./pages/admission/EnrollmentPage.jsx";
import AdmissionApplicants from "./pages/admission/Applicants.jsx";
import AdmissionAnalytics from "./pages/admission/AdmissionAnalytics.jsx";
import AdmissionPrograms from "./pages/admission/Programs.jsx";
import DeanDashboard from "./pages/dean/Dashboard.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminPrograms from "./pages/admin/Programs.jsx";
import AdminCurriculum from "./pages/admin/Curriculum.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";
import AdminAnalytics from "./pages/admin/Analytics.jsx";
import AdminDepartments from "./pages/admin/Departments.jsx";
import AdminSectors from "./pages/admin/Sectors.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import SidebarLayout from "./layouts/SidebarLayout.jsx";

function ProtectedRoute({ children, role }) {
  const { user, token, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="h-screen grid place-items-center bg-slate-950 text-slate-300">
        Initializing portal…
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />}
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <SidebarLayout>
                <StudentDashboard />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/dashboard"
          element={
            <ProtectedRoute role="professor">
              <SidebarLayout>
                <ProfessorDashboard />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/registrar/dashboard"
          element={
            <ProtectedRoute role="registrar">
              <SidebarLayout>
                <RegistrarDashboard />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admission/dashboard"
          element={
            <ProtectedRoute role="admission">
              <SidebarLayout>
                <AdmissionDashboard />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/enroll"
          element={
            <ProtectedRoute role="admission">
              <SidebarLayout>
                <AdmissionEnrollmentForm />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/enrollment"
          element={
            <ProtectedRoute role="admission">
              <SidebarLayout>
                <EnrollmentPage />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/applicants"
          element={
            <ProtectedRoute role="admission">
              <SidebarLayout>
                <AdmissionApplicants />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/analytics"
          element={
            <ProtectedRoute role="admission">
              <SidebarLayout>
                <AdmissionAnalytics />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission/programs"
          element={
            <ProtectedRoute role="admission">
              <SidebarLayout>
                <AdmissionPrograms />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dean/dashboard"
          element={
            <ProtectedRoute role="dean">
              <SidebarLayout>
                <DeanDashboard />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout>
                <AdminDashboard />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout>
                <AdminPrograms />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/curriculum"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout>
                <AdminCurriculum />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout>
                <AdminDepartments />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sectors"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout>
                <AdminSectors />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout>
                <AdminSettings />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout>
                <AdminAnalytics />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
