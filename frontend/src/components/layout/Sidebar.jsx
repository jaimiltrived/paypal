import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  Sparkles,
  ShieldAlert,
  ChartNoAxesCombined,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { FIXTURE_USER } from '../../data/fixtures';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'Workspace',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
      { name: 'Payments', path: '/payments', icon: CreditCard },
      { name: 'Payouts', path: '/payouts', icon: Wallet, isPlanned: true },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'AI Insights', path: '/ai-insights', icon: Sparkles, badge: 'Live', isAI: true },
      { name: 'Risk & Alerts', path: '/risk', icon: ShieldAlert, alertCount: 2 },
      { name: 'Reports', path: '/reports', icon: ChartNoAxesCombined },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Activity Log', path: '/activity', icon: Clock },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const location = useLocation();
  const { user } = useAuth();
  const currentUser = user || FIXTURE_USER;
  const userInitials = (currentUser.full_name || currentUser.email || 'AV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const roleName = currentUser.role?.name || currentUser.role || 'Admin';

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 900,
          }}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''} ${
          isCollapsed ? 'sidebar-collapsed' : ''
        }`}
        style={{
          width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 950,
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          flexShrink: 0,
        }}
      >
        {/* Brand Area */}
        <div
          style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0 12px' : '0 18px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-900)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(20, 43, 74, 0.2)',
              }}
            >
              <ShieldCheck size={19} strokeWidth={2.4} />
            </div>

            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-brand-900)',
                    lineHeight: 1.15,
                  }}
                >
                  PayOps AI
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--color-text-muted)',
                    fontWeight: 550,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Financial Intelligence
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          {isMobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="btn-icon btn-icon-sm btn-ghost"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isCollapsed ? '16px 8px' : '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <div
                  style={{
                    padding: '0 10px 6px 10px',
                    fontSize: '10.5px',
                    fontWeight: 650,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {group.title}
                </div>
              )}

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.name : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        padding: isCollapsed ? '9px 0' : '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'background-color var(--transition-fast), color var(--transition-fast)',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <Icon
                          size={17}
                          strokeWidth={isActive ? 2.2 : 1.8}
                          style={{
                            color: isActive
                              ? 'var(--color-primary)'
                              : item.isAI
                              ? 'var(--color-ai)'
                              : 'var(--color-text-muted)',
                            flexShrink: 0,
                          }}
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>

                      {!isCollapsed && item.isPlanned && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'var(--color-surface-subtle)',
                            border: '1px solid var(--color-border)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          Planned
                        </span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 650,
                            color: 'var(--color-ai)',
                            backgroundColor: 'var(--color-ai-bg)',
                            border: '1px solid var(--color-ai-border)',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-ai)' }} />
                          {item.badge}
                        </span>
                      )}

                      {!isCollapsed && item.alertCount && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: 'var(--color-danger)',
                            backgroundColor: 'var(--color-danger-bg)',
                            border: '1px solid var(--color-danger-border)',
                            padding: '1px 6px',
                            borderRadius: '999px',
                          }}
                        >
                          {item.alertCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Profile & Collapse Bar */}
        <div
          style={{
            padding: isCollapsed ? '12px 6px' : '12px 14px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '8px',
          }}
        >
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-800)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {userInitials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentUser.full_name || currentUser.email}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 650,
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-100)',
                      padding: '0 4px',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {roleName}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentUser.email}
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-800)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
              }}
              title={`${currentUser.full_name || currentUser.email} (${roleName})`}
            >
              {userInitials}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="btn-icon btn-icon-sm btn-ghost"
            style={{
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </aside>
    </>
  );
}
