import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from './Button.jsx';
import InputField from './InputField.jsx';
import Alert from './Alert.jsx';

function LoginForm({ onSubmit, loading, error, onForgotPassword }) {
  const [formState, setFormState] = useState({ email: '', password: '' });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(formState);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <InputField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formState.email}
          onChange={handleChange}
          required
        />
        <InputField
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={formState.password}
          onChange={handleChange}
          required
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex items-center justify-between gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onForgotPassword: PropTypes.func
};

export default LoginForm;
