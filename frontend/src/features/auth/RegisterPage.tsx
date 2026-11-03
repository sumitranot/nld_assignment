import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../api/client';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be minimum 6 characters'),
  role: z.enum(['USER', 'ADMIN']),
  access: z.enum(['VIEW', 'CREATE']).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'USER',
      access: 'VIEW',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setServerError(null);
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        role: data.role,
        access: data.role === 'ADMIN' ? undefined : data.access,
      });
      navigate('/products', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Registration failed. Please check your details.'));
    }
  };

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6) var(--space-4)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 'var(--space-1)' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Get started with logistics order access
            </p>
          </div>

          {serverError && (
            <div className="alert alert--danger" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="name@company.com"
                {...register('email')}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="form-input"
                placeholder="At least 6 characters"
                {...register('password')}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Account Role
              </label>
              <select id="role" className="form-select" {...register('role')}>
                <option value="USER">Standard User (USER)</option>
                <option value="ADMIN">Administrator (ADMIN)</option>
              </select>
              {errors.role && <p className="form-error">{errors.role.message}</p>}
            </div>

            {selectedRole === 'USER' && (
              <div className="form-group">
                <label className="form-label" htmlFor="access">
                  Permission Access Level
                </label>
                <select id="access" className="form-select" {...register('access')}>
                  <option value="VIEW">VIEW — Browse products and inspect orders</option>
                  <option value="CREATE">CREATE — Full shopping cart, ordering & cancellation</option>
                </select>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                  CREATE permission automatically implies VIEW rights.
                </p>
                {errors.access && <p className="form-error">{errors.access.message}</p>}
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

