import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('alex.vance@payops.ai');
  const [password, setPassword] = useState('PayOpsAdmin#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    // Visual authentication simulation
    setTimeout(() => {
      setLoading(false);
      toast.success('Welcome back, Alex', 'Signed in as Platform Administrator.');
      navigate('/dashboard');
    }, 600);
  };

  const handleQuickFill = (testEmail, testRole) => {
    setEmail(testEmail);
    setPassword('PayOpsAdmin#2026');
    setError('');
    toast.info('Credentials loaded', `Selected test user (${testRole})`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-brand-900)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <ShieldCheck size={28} strokeWidth={2.2} />
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-brand-900)',
              letterSpacing: '-0.02em',
            }}
          >
            Sign in to PayOps AI
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: '6px',
            }}
          >
            Enterprise Payment Operations & Risk Intelligence
          </p>
        </div>

        {/* Login Card */}
        <div
          className="card"
          style={{
            padding: '32px',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger-text)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: '20px',
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Work Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              prefixIcon={Mail}
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              prefixIcon={Lock}
              suffixIcon={showPassword ? EyeOff : Eye}
              onSuffixClick={() => setShowPassword((prev) => !prev)}
              required
              autoComplete="current-password"
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: 'var(--color-primary)',
                    borderRadius: '4px',
                    width: '15px',
                    height: '15px',
                  }}
                />
                <span>Remember this workstation</span>
              </label>

              <button
                type="button"
                onClick={() => toast.info('Password Reset', 'Contact your organization administrator to reset credentials.')}
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              style={{ width: '100%' }}
            >
              {loading ? 'Authenticating...' : 'Sign in to Console'}
            </Button>
          </form>

          {/* Development Quick-Fill helper */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              Development Quick-Fill Roles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('alex.vance@payops.ai', 'Admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-primary)',
                  textAlign: 'left',
                }}
              >
                <span>
                  <strong>Alex Vance</strong> (Admin)
                </span>
                <span style={{ color: 'var(--color-primary)', fontSize: '11px' }}>Load →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sarah.jenkins@payops.ai', 'Operator')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-primary)',
                  textAlign: 'left',
                }}
              >
                <span>
                  <strong>Sarah Jenkins</strong> (Operator)
                </span>
                <span style={{ color: 'var(--color-primary)', fontSize: '11px' }}>Load →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Lock size={12} />
          <span>FIPS 140-2 Compliant • Dual confirmation required for sensitive actions</span>
        </div>
      </div>
    </div>
  );
}

