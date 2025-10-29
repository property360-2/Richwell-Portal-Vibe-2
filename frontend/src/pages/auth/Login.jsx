import { useState } from 'react';
import PropTypes from 'prop-types';
import LoginForm from '../../components/LoginForm.jsx';

function LoginPage({ onLogin, loading }) {
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setError('');
    const result = await onLogin(values);
    if (!result.ok) {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-center text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-2 text-center text-sm text-slate-600">Use a seeded account like student@example.com / ChangeMe123!</p>
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

LoginPage.defaultProps = {
  loading: false
};

export default LoginPage;
