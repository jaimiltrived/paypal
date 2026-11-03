import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Sliders,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { FIXTURE_USER } from '../../data/fixtures';
import { useToast } from '../../context/ToastContext';

export function Topbar({ onOpenMobile }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [unreadCount] = useState(2);

  const handleSignOut = () => {
    toast.info('Session Terminated', 'Signed out from PayOps AI console.');
    navigate('/login');
  };

  const userMenuItems = [
    {
      label: 'Signed in as alex.vance@payops.ai',
      disabled: true,
    },
    { divider: true },
    {
      label: 'Operator Profile',
      icon: User,
      onClick: () => navigate('/settings/profile'),
    },
    {
      label: 'Gateway & Integrations',
      icon: Sliders,
      onClick: () => navigate('/settings/integrations'),
    },
    {
      label: 'Immutable Audit Log',
      icon: Activity,
      onClick: () => navigate('/activity'),
    },
    { divider: true },
    {
      label: 'Sign out',
      icon: LogOut,
      destructive: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 800,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="btn-icon btn-ghost mobile-menu-btn"
          aria-label="Open navigation menu"
          style={{ display: 'none' }}
        >
          <Menu size={19} />
        </button>

        {/* Global Search Bar */}
        <div
          onClick={() => navigate('/transactions')}
          role="button"
          tabIndex={0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-canvas)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 12px',
            width: '320px',
            maxWidth: '100%',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-strong)';
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.backgroundColor = 'var(--color-canvas)';
          }}
        >
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', flex: 1 }}>
            Search order ID, capture, customer email...
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontFamily: 'monospace',
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Environment Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            fontSize: '11px',
            fontWeight: 550,
            color: 'var(--color-text-secondary)',
          }}
          className="desktop-only"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
            }}
          />
          <span>Dev Fixture Mode</span>
        </div>

        {/* PayPal Sandbox Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-success-text)',
          }}
          className="desktop-only"
        >
          <CheckCircle2 size={13} />
          <span>PayPal Sandbox (REST v2)</span>
        </div>

        {/* Risk Alerts Notification Trigger */}
        <div style={{ position: 'relative' }}>
          <IconButton
            icon={Bell}
            label="Risk Alerts & Pending Actions"
            size="md"
            onClick={() => navigate('/risk')}
          />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger)',
                border: '1.5px solid var(--color-surface)',
              }}
            />
          )}
        </div>

        {/* User Menu Trigger */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 7px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-800)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                AV
              </div>
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
                className="desktop-only"
              >
                {FIXTURE_USER.full_name}
              </span>
            </button>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
