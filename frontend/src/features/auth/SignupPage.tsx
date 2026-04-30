import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getApiError } from '../../api/client';
import { authApi } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { saveAuth } from './auth-storage';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type SignupForm = z.infer<typeof schema>;

export function SignupPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      saveAuth(data.accessToken, data.user);
      navigate('/dashboard');
    },
  });

  return (
    <div className="auth-page">
      <section className="auth-panel compact">
        <form className="auth-form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div>
            <h2>Create account</h2>
            <p>The first account becomes admin automatically.</p>
          </div>

          <Field label="Name" error={errors.name?.message} {...register('name')} />
          <Field label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Field label="Password" type="password" error={errors.password?.message} {...register('password')} />

          {mutation.isError ? <div className="form-error">{getApiError(mutation.error)}</div> : null}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create account'}
          </Button>

          <p className="auth-link">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
