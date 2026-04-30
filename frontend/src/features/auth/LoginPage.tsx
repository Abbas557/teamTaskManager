import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { authApi } from '../../api/endpoints';
import { getApiError } from '../../api/client';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { saveAuth } from './auth-storage';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin1234',
    },
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      saveAuth(data.accessToken, data.user);
      navigate('/dashboard');
    },
  });

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand-block">
            <div className="brand-mark">TT</div>
            <div>
              <strong>Team Tasks</strong>
              <span>Project delivery control</span>
            </div>
          </div>
          <h1>Run projects without losing the thread.</h1>
          <p>Sign in to manage teams, assign work, and keep progress visible across every project.</p>
          <div className="auth-proof">
            <CheckCircle2 size={18} />
            Seed login: admin@example.com / Admin1234
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <h2>Login</h2>
            <p>Use your team account to continue.</p>
          </div>

          <Field label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Field label="Password" type="password" error={errors.password?.message} {...register('password')} />

          {mutation.isError ? <div className="form-error">{getApiError(mutation.error)}</div> : null}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>

          <p className="auth-link">
            New workspace? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
