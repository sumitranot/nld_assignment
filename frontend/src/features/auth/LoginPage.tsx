import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Package, Check, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import styles from './Auth.module.css';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login({ email: data.email, password: data.password });
      // Redirect-back after login
      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/products';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Invalid email or password.';
      setServerError(msg);
    }
  };

  const setDemoLogin = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className={styles.splitLayout}>
      {/* Brand Panel (Hidden on mobile) */}
      <div className={styles.brandPanel}>
        <div className={styles.brandPanelPattern} />

        <div className={styles.brandLogo}>
          <Package size={32} />
          <span>NLD Logistics</span>
        </div>

        <div className={styles.brandPitch}>
          <h1 className={styles.pitchHeading}>Real-Time Order & Inventory Engine</h1>
          <p className={styles.pitchDesc}>
            Industrial warehouse fulfillment platform with optimistic concurrency, granular RBAC access controls, and sub-millisecond stock allocation.
          </p>

          <div className={styles.pitchFeatures}>
            <div className={styles.pitchItem}>
              <Check size={18} color="#86efac" />
              <span>ACID-compliant concurrency with row-level pessimistic locking</span>
            </div>
            <div className={styles.pitchItem}>
              <ShieldCheck size={18} color="#86efac" />
              <span>Role-Based Access Control (Admin, Creator, Viewer)</span>
            </div>
            <div className={styles.pitchItem}>
              <Zap size={18} color="#86efac" />
              <span>Integer-cents monetary arithmetic with 0 floating-point error</span>
            </div>
          </div>
        </div>

        <div className={styles.brandFooter}>
          &copy; {new Date().getFullYear()} NLD Logistics Platform. Enterprise assessment grade.
        </div>
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Sign In</h2>
            <p className={styles.formSubtitle}>Access your logistics ordering portal</p>
          </div>

          {serverError && (
            <div
              role="alert"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                marginBottom: 'var(--space-4)',
                border: '1px solid var(--color-danger-border)',
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField
              label="Email Address"
              htmlFor="email"
              error={errors.email?.message}
              required
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                error={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              required
            >
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                error={Boolean(errors.password)}
                rightIcon={
                  <IconButton
                    icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    ariaLabel={showPassword ? 'Hide password' : 'Show password'}
                    size="sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                }
                {...register('password')}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins per Assessment */}
          <div className={styles.demoLogins}>
            <div className={styles.demoTitle}>Quick Demo Logins:</div>
            <div className={styles.demoButtons}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDemoLogin('admin@example.com', 'Admin@123')}
              >
                Admin
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDemoLogin('create@example.com', 'Create@123')}
              >
                Creator
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDemoLogin('view@example.com', 'View@123')}
              >
                Viewer
              </Button>
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--space-6)',
              textAlign: 'center',
              fontSize: 'var(--font-sm)',
              color: 'var(--text-muted)',
            }}
          >
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
