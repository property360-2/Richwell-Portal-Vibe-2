import { useState } from 'react';

import Alert from './components/Alert.jsx';
import Button from './components/Button.jsx';
import DashboardCard from './components/DashboardCard.jsx';
import InfoAlert from './components/InfoAlert.jsx';
import LoginForm from './components/LoginForm.jsx';
import {
  login as loginRequest,
  logout as logoutRequest,
  requestPasswordReset
} from './services/authApi.js';

const roleSummaries = {
  STUDENT: {
    title: 'Student Portal',
    description:
      'Review enrollment status, manage subject load, and monitor INC or repeat requirements before confirmation.'
  },
  PROFESSOR: {
    title: 'Professor Workspace',
    description:
      'Encode grades, view assigned sections, and keep students informed of INC resolutions in real time.'
  },
  REGISTRAR: {
    title: 'Registrar Command Center',
    description:
      'Approve enrollment, finalize grades, and coordinate program records with college-wide visibility.'
  },
  ADMISSION: {
    title: 'Admission Pipeline',
    description:
      'Guide applicants through submission, screening, and onboarding with instant enrollment insights.'
  },
  DEAN: {
    title: 'Dean Analytics',
    description:
      'Track faculty assignments, program health, and academic KPIs across the college.'
  }
};

function App() {
  const [authState, setAuthState] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resetToken, setResetToken] = useState('');

  async function handleLogin(credentials) {
    setLoading(true);
    setError('');
    setInfoMessage('');
    setResetToken('');
    try {
      const result = await loginRequest(credentials);
      setAuthState({ token: result.token, user: result.user });
      setInfoMessage(`Welcome back, ${result.user.firstName || result.user.email}!`);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (!authState.token) return;
    setLoading(true);
    setError('');
    setInfoMessage('');
    setResetToken('');
    try {
      await logoutRequest(authState.token);
      setAuthState({ token: null, user: null });
      setInfoMessage('You have been logged out.');
    } catch (logoutError) {
      setError(logoutError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const email = window.prompt('Enter your account email to generate a reset token:');
    if (!email) return;

    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const { resetToken: generatedToken } = await requestPasswordReset(email);
      setResetToken(generatedToken || '');
      setInfoMessage('Reset instructions generated. Use the token in your email client or the sandbox response.');
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setLoading(false);
    }
  }

  const isAuthenticated = Boolean(authState.token && authState.user);
  const roleSummary = authState.user ? roleSummaries[authState.user.role] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">Richwell College Portal</h1>
          <p className="mt-2 text-sm text-slate-600">
            Phase 2 activates secure authentication with role-aware access guards.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {!isAuthenticated ? (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Sign in to continue</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use the seeded role accounts from the backend Prisma seed to preview dashboard access.
            </p>
            <div className="mt-6">
              <LoginForm
                onSubmit={handleLogin}
                loading={loading}
                error={error}
                onForgotPassword={handleForgotPassword}
              />
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Signed in as {authState.user.firstName || authState.user.email}
                </h2>
                <p className="mt-1 text-sm text-slate-600">Role: {authState.user.role}</p>
              </div>
              <Button onClick={handleLogout} disabled={loading} variant="secondary">
                Log out
              </Button>
            </div>

            {roleSummary && (
              <DashboardCard
                title={roleSummary.title}
                description={roleSummary.description}
                footer={
                  <span className="text-xs text-slate-500">
                    Role-guarded endpoints enforce least-privilege access for every workflow.
                  </span>
                }
              />
            )}

            <InfoAlert>
              Use the Postman collection in the repository to test each role-protected endpoint with the JWT returned after
              login. Revoking a token through the logout route removes access immediately.
            </InfoAlert>
          </section>
        )}

        {infoMessage && <Alert variant="success">{infoMessage}</Alert>}
        {resetToken && (
          <Alert variant="warning" title="Development Reset Token">
            Use this temporary token with the `/auth/reset` endpoint to set a new password while email delivery is pending.
            <span className="mt-1 block font-mono text-xs">{resetToken}</span>
          </Alert>
        )}
      </main>
    </div>
  );
}

export default App;
