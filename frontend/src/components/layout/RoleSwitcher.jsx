import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QUICK_SWITCH_ACCOUNTS, getRoleConfig } from '../../utils/rbac';

export function RoleSwitcher() {
  const { user, login } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef(null);

  const currentRole = (user?.role?.name || user?.role || 'admin').toLowerCase();
  const roleConfig = getRoleConfig(currentRole);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchAccount = async (account) => {
    if (user?.email === account.email) {
      setIsOpen(false);
      return;
    }

    setSwitching(true);
    setIsOpen(false);
    try {
      const res = await login(account.email, account.password);
      toast.success(
        `Switched to ${account.name}`,
        `Now operating with ${account.tag} (${account.role.toUpperCase()}) privileges.`
      );
    } catch (err) {
      console.error('Role switch error:', err);
      toast.error('Switch Failed', err.message || 'Unable to authenticate target role.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 11px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--color-surface-subtle)',
          border: `1.5px solid ${roleConfig.color}40`,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Switch active user role & access level"
      >
        <span style={{ fontSize: '13px' }}>{roleConfig.icon}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: roleConfig.color,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {roleConfig.name}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {user?.full_name?.split(' ')[0] || user?.email || 'User'}
          </span>
        </div>
        <ChevronDown size={13} style={{ color: 'var(--color-text-muted)', marginLeft: '2px' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '280px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '8px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '4px',
            }}
          >
            Switch Active Workstation Role
          </div>

          {QUICK_SWITCH_ACCOUNTS.map((acc) => {
            const isCurrent = user?.email === acc.email;
            const config = getRoleConfig(acc.role);

            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSwitchAccount(acc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isCurrent ? 'var(--color-surface-subtle)' : 'transparent',
                  border: isCurrent ? `1px solid ${config.color}50` : '1px solid transparent',
                  cursor: isCurrent ? 'default' : 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background-color 0.1s ease',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {acc.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {acc.name}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: config.color,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Check size={11} strokeWidth={3} /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                    {acc.tag}
                  </div>
                </div>
              </button>
            );
          })}

          <div
            style={{
              marginTop: '4px',
              padding: '6px 10px',
              fontSize: '10.5px',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-canvas)',
              borderRadius: 'var(--radius-sm)',
              lineHeight: 1.35,
            }}
          >
            Role switch instantly updates navigation, actions & API permissions across the console.
          </div>
        </div>
      )}
    </div>
  );
}
