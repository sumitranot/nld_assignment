import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Package, Check, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import styles from './Auth.module.css';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['USER', 'ADMIN']),
  access: z.enum(['CREATE', 'VIEW']).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      role: 'USER',
      access: 'CREATE',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerAuth({
        email: data.email,
        password: data.password,
        role: data.role,
        access: data.role === 'USER' ? data.access || 'VIEW' : undefined,
      });
      navigate('/products', { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to create account. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <div className={styles.splitLayout}>
      {/* Brand Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandPanelPattern} />

        <div className={styles.brandLogo}>
          <Package size={32} />
          <span>NLD Logistics</span>
        </div>

        <div className={styles.brandPitch}>
          <h1 className={styles.pitchHeading}>Join the Logistics Network</h1>
          <p className={styles.pitchDesc}>
            Configure tailored role-based access for procurement teams, warehouse supervisors, and auditing viewers.
          </p>

          <div className={styles.pitchFeatures}>
            <div className={styles.pitchItem}>
              <Check size={18} color="#86efac" />
              <span>Full inventory catalog access and real-time stock allocation</span>
            </div>
            <div className={styles.pitchItem}>
              <ShieldCheck size={18} color="#86efac" />
              <span>Granular CREATE vs. VIEW permissions out of the box</span>
            </div>
            <div className={styles.pitchItem}>
              <Zap size={18} color="#86efac" />
              <span>Instant order confirmation and shipment tracking</span>
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
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formSubtitle}>Get started with warehouse order fulfillment</p>
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
              htmlFor="reg-email"
              error={errors.email?.message}
              required
            >
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                error={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="reg-password"
              error={errors.password?.message}
              helpText="Must be 8+ characters, with at least one uppercase letter and number"
              required
            >
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
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

            <FormField label="Account Role" htmlFor="reg-role" required>
              <Select id="reg-role" {...register('role')}>
                <option value="USER">User (Standard Ordering & Tracking)</option>
                <option value="ADMIN">Administrator (Full Inventory Management)</option>
              </Select>
            </FormField>

            {selectedRole === 'USER' && (
              <FormField
                label="User Access Level"
                htmlFor="reg-access"
                helpText="CREATE can place and cancel orders; VIEW can only explore catalog and review existing orders"
                required
              >
                <Select id="reg-access" {...register('access')}>
                  <option value="CREATE">CREATE — Full order creation and cancellation</option>
                  <option value="VIEW">VIEW — Read-only catalog inspection</option>
                </Select>
              </FormField>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              style={{ marginTop: 'var(--space-4)' }}
            >
              Create Account
            </Button>
          </form>

          <div
            style={{
              marginTop: 'var(--space-6)',
              textAlign: 'center',
              fontSize: 'var(--font-sm)',
              color: 'var(--text-muted)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
