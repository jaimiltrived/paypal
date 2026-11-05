import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ExternalLink, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ordersService } from '../../services/ordersService';
import { useToast } from '../../context/ToastContext';

export function PayPalCheckoutModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();

  const [step, setStep] = useState('CREATE'); // 'CREATE' | 'APPROVE' | 'COMPLETED'
  const [amount, setAmount] = useState('49.00');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('PayOps Pro Monthly Subscription');
  const [selectedSku, setSelectedSku] = useState('SKU-PRO-MONTHLY');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [capturedData, setCapturedData] = useState(null);

  if (!isOpen) return null;

  const handleSkuSelect = (skuVal) => {
    setSelectedSku(skuVal);
    if (skuVal === 'SKU-PRO-MONTHLY') {
      setAmount('49.00');
      setDescription('PayOps Pro Monthly Subscription');
    } else if (skuVal === 'SKU-ENTERPRISE-ANNUAL') {
      setAmount('499.00');
      setDescription('PayOps Enterprise Annual License');
    } else {
      setSelectedSku('CUSTOM');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast.error('Invalid Amount', 'Please specify a valid payment amount.');
      return;
    }

    setLoading(true);
    try {
      const amountCents = Math.round(amountFloat * 100);
      const res = await ordersService.createOrder({
        amount_cents: amountCents,
        currency,
        description,
      });

      const orderData = res.data || res;
      setCreatedOrder(orderData);
      setStep('APPROVE');
      toast.success(
        'PayPal Sandbox Order Created',
        `Reference ID: ${orderData.paypal_order_id || orderData.id}`
      );
    } catch (err) {
      toast.error('Order Creation Failed', err.message || 'Could not create PayPal Sandbox order.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureOrder = async () => {
    if (!createdOrder) return;
    setLoading(true);
    try {
      const res = await ordersService.captureOrder(createdOrder.id || createdOrder.paypal_order_id);
      const capData = res.data || res;
      setCapturedData(capData);
      setStep('COMPLETED');
      toast.success(
        'Payment Captured Successfully',
        `Capture ID: ${capData.capture_id}. Ledger balances updated.`
      );
      if (onSuccess) onSuccess(capData);
    } catch (err) {
      toast.error('Capture Failed', err.message || 'Failed to capture PayPal Sandbox order.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('CREATE');
    setCreatedOrder(null);
    setCapturedData(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#003087',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              P
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                PayPal Sandbox Checkout
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                REST v2 Gateway • Automated Ledger Clearing
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px' }}>
          {step === 'CREATE' && (
            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  Quick Catalogue Product / SKU
                </label>
                <Select
                  value={selectedSku}
                  onChange={(e) => handleSkuSelect(e.target.value)}
                  options={[
                    { value: 'SKU-PRO-MONTHLY', label: 'PayOps Pro Monthly ($49.00 USD)' },
                    { value: 'SKU-ENTERPRISE-ANNUAL', label: 'PayOps Enterprise Annual ($499.00 USD)' },
                    { value: 'CUSTOM', label: 'Custom Amount / Transaction' },
                  ]}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                <Input
                  label="Amount (in Dollars)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="49.00"
                  required
                />
                <div>
                  <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Currency
                  </label>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    options={[
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'GBP', label: 'GBP' },
                    ]}
                  />
                </div>
              </div>

              <Input
                label="Order Description / Memo"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Payment for API Services"
                required
              />

              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  fontSize: '11.5px',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CreditCard size={15} color="var(--color-primary)" />
                <span>
                  Generates an authenticated PayPal Sandbox v2 Order (<code>intent=CAPTURE</code>) with dual-entry ledger tracking.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <Button variant="secondary" onClick={handleReset}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={loading}>
                  Generate PayPal Order →
                </Button>
              </div>
            </form>
          )}

          {step === 'APPROVE' && createdOrder && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-info-bg, #eff6ff)',
                  border: '1px solid var(--color-info-border, #bfdbfe)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-info-text, #1e40af)',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>PayPal Sandbox Order Generated</div>
                <div>
                  Order Reference: <strong className="font-mono">{createdOrder.paypal_order_id || createdOrder.id}</strong>
                </div>
                <div>Amount: <strong>${(createdOrder.amount_cents / 100).toFixed(2)} {createdOrder.currency}</strong></div>
              </div>

              {createdOrder.approval_url && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Buyer Approval Options:</span>
                  <a
                    href={createdOrder.approval_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      backgroundColor: '#ffc439',
                      color: '#111',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    Open PayPal Sandbox Checkout Window <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <div
                style={{
                  borderTop: '1px dashed var(--color-border)',
                  paddingTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Once approved by buyer (or for immediate test execution), capture the order to complete settlement:
                </div>
                <Button
                  variant="primary"
                  onClick={handleCaptureOrder}
                  loading={loading}
                  icon={CheckCircle2}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Capture Payment Now
                </Button>
              </div>
            </div>
          )}

          {step === 'COMPLETED' && capturedData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <CheckCircle2 size={26} />
              </div>

              <div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Payment Captured Successfully!
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  The PayPal Sandbox settlement has been completed and recorded to your ledger.
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'left',
                }}
              >
                <div><strong>Status:</strong> <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>COMPLETED</span></div>
                <div><strong>PayPal Capture ID:</strong> <code className="font-mono">{capturedData.capture_id}</code></div>
                <div><strong>PayPal Order Ref:</strong> <code className="font-mono">{capturedData.paypal_order_id}</code></div>
                <div><strong>Amount:</strong> ${(capturedData.amount_cents / 100).toFixed(2)} {capturedData.currency}</div>
              </div>

              <Button variant="primary" onClick={handleReset} style={{ marginTop: '8px' }}>
                Done / Back to Payments
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
