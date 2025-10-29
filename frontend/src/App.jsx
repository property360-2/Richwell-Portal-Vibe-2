import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell.jsx';
import Alert from './components/Alert.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/auth/Login.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentGrades from './pages/student/Grades.jsx';
import RegistrarDashboard from './pages/registrar/Dashboard.jsx';
import RegistrarStudents from './pages/registrar/Students.jsx';
import RegistrarAnalytics from './pages/registrar/Analytics.jsx';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  const fallback = `/${(user?.role || 'student').toLowerCase()}/dashboard`;
  if (!user || (allowedRoles?.length && !allowedRoles.includes(user.role))) {
    return <Navigate to={fallback} replace />;
  }
  return children;
}

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired
};

RoleRoute.defaultProps = {
  allowedRoles: []
};

function Placeholder({ title }) {
  return (
    <div className="space-y-4">
      <AppShell.PageHeader title={title} description="Experience coming soon." breadcrumbs={[{ label: title }]} />
      <Alert variant="info">We are still designing this workflow.</Alert>
    </div>
  );
}

Placeholder.propTypes = {
  title: PropTypes.string.isRequired
};

function PortalRoutes() {
  const { user, logout } = useAuth();
  const defaultPath = `/${(user?.role || 'student').toLowerCase()}/dashboard`;

  return (
    <AppShell user={user} onLogout={logout}>
      <Routes>
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <RoleRoute allowedRoles={["STUDENT"]}>
              <StudentGrades />
            </RoleRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <RoleRoute allowedRoles={["STUDENT"]}>
              <Placeholder title="Student Announcements" />
            </RoleRoute>
          }
        />
        <Route
          path="/registrar/dashboard"
          element={
            <RoleRoute allowedRoles={["REGISTRAR"]}>
              <RegistrarDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/registrar/students"
          element={
            <RoleRoute allowedRoles={["REGISTRAR"]}>
              <RegistrarStudents />
            </RoleRoute>
          }
        />
        <Route
          path="/registrar/analytics"
          element={
            <RoleRoute allowedRoles={["REGISTRAR"]}>
              <RegistrarAnalytics />
            </RoleRoute>
          }
        />
        <Route
          path="/admission/*"
          element={
            <RoleRoute allowedRoles={["ADMISSION"]}>
              <Placeholder title="Admission" />
            </RoleRoute>
          }
        />
        <Route
          path="/professor/*"
          element={
            <RoleRoute allowedRoles={["PROFESSOR"]}>
              <Placeholder title="Professor" />
            </RoleRoute>
          }
        />
        <Route
          path="/dean/*"
          element={
            <RoleRoute allowedRoles={["DEAN"]}>
              <Placeholder title="Dean" />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <Placeholder title="Admin" />
            </RoleRoute>
          }
        />
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  const auth = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={auth.login} loading={auth.loading} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <PortalRoutes />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
