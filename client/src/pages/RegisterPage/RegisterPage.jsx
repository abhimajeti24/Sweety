// Create a patient account. On success the user is logged in and lands on Today.
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { validateRegister } from '@sweety/shared';
import { AuthForm, AuthLayout, AuthSwitch } from '../../components/AuthLayout/AuthLayout.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { ErrorState } from '../../components/ErrorState/ErrorState.jsx';
import { Field, FormErrorAnnouncer, PasswordInput } from '../../components/Field/Field.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { focusFirstError, splitApiError } from '../../lib/forms.js';

const FIELDS = ['name', 'email', 'password'];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pending, setPending] = useState(false);
  const refs = { name: useRef(null), email: useRef(null), password: useRef(null) };

  function update(name) {
    return (event) => setValues((current) => ({ ...current, [name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    const result = validateRegister(values);
    setErrors(result.fields);
    if (!result.ok) {
      focusFirstError(result.fields, FIELDS, refs);
      return;
    }

    setPending(true);
    try {
      await register(result.data);
      navigate('/', { replace: true });
    } catch (error) {
      const { fieldErrors, formError: message } = splitApiError(error, FIELDS);
      setErrors(fieldErrors);
      setFormError(message);
      focusFirstError(fieldErrors, FIELDS, refs);
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      documentTitle="Create account | Sweety"
      intro="It takes a minute. Your readings stay private to you."
    >
      <AuthForm onSubmit={handleSubmit}>
        {formError && <ErrorState message={formError} />}
        <FormErrorAnnouncer errors={errors} />
        <Field id="register-name" label="Name" error={errors.name}>
          {(props) => (
            <input
              {...props}
              ref={refs.name}
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={update('name')}
            />
          )}
        </Field>
        <Field id="register-email" label="Email" error={errors.email}>
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
        <Field
          id="register-password"
          label="Password"
          hint="8 to 72 characters."
          error={errors.password}
        >
          {(props) => (
            <PasswordInput
              {...props}
              ref={refs.password}
              autoComplete="new-password"
              value={values.password}
              onChange={update('password')}
            />
          )}
        </Field>
        <Button type="submit" block pending={pending} pendingLabel="Creating account...">
          Create account
        </Button>
      </AuthForm>
      <AuthSwitch>
        Already have an account? <Link to="/login">Log in</Link>
      </AuthSwitch>
    </AuthLayout>
  );
}
