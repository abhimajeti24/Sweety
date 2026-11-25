// Log in with email and password. Every failed attempt shows the same message on purpose.
import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { validateLogin } from '@sweety/shared';
import { AuthForm, AuthLayout, AuthSwitch } from '../../components/AuthLayout/AuthLayout.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { DemoAccounts, SHOW_DEMO_ACCOUNTS } from '../../components/DemoAccounts/DemoAccounts.jsx';
import { ErrorState } from '../../components/ErrorState/ErrorState.jsx';
import { Field, FormErrorAnnouncer, PasswordInput } from '../../components/Field/Field.jsx';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';
import { focusFirstError, splitApiError } from '../../lib/forms.js';

const FIELDS = ['email', 'password'];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pending, setPending] = useState(false);
  const refs = { email: useRef(null), password: useRef(null) };
  const submitRef = useRef(null);

  function update(name) {
    return (event) => setValues((current) => ({ ...current, [name]: event.target.value }));
  }

  // A demo account fills both fields and moves focus to "Log in", so Enter logs straight in.
  function fillDemoAccount(credentials) {
    setValues(credentials);
    setErrors({});
    setFormError(null);
    submitRef.current?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    const result = validateLogin(values);
    setErrors(result.fields);
    if (!result.ok) {
      focusFirstError(result.fields, FIELDS, refs);
      return;
    }

    setPending(true);
    try {
      const user = await login(result.data);
      const from = location.state?.from?.pathname;
      navigate(from && from !== '/login' ? from : homePathFor(user), { replace: true });
    } catch (error) {
      const { fieldErrors, formError: message } = splitApiError(error, FIELDS);
      setErrors(fieldErrors);
      setFormError(message);
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Log in"
      documentTitle="Log in | Sweety"
      intro="Welcome back. Pick up where you left off today."
    >
      <AuthForm onSubmit={handleSubmit}>
        {formError && <ErrorState message={formError} />}
        <FormErrorAnnouncer errors={errors} />
        <Field id="login-email" label="Email" error={errors.email}>
          {(props) => (
            <input
              {...props}
              ref={refs.email}
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update('email')}
            />
          )}
        </Field>
        <Field id="login-password" label="Password" error={errors.password}>
          {(props) => (
            <PasswordInput
              {...props}
              ref={refs.password}
              autoComplete="current-password"
              value={values.password}
              onChange={update('password')}
            />
          )}
        </Field>
        <Button ref={submitRef} type="submit" block pending={pending} pendingLabel="Logging in...">
          Log in
        </Button>
      </AuthForm>
      <AuthSwitch>
        New to Sweety? <Link to="/register">Create an account</Link>
      </AuthSwitch>
      {SHOW_DEMO_ACCOUNTS && <DemoAccounts onUse={fillDemoAccount} />}
    </AuthLayout>
  );
}
