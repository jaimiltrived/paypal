import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  X,
  CreditCard,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { ordersService } from '../../services/ordersService';
import { formatCurrency, formatDate, truncateId } from '../../utils/formatters';
import { exportTransactionsToCSV } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export function TransactionsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersService.getOrders({
        search: searchTerm,
        status: statusFilter,
      });

      let data = res.data;
      if (methodFilter !== 'ALL') {
        data = data.filter((o) => o.payment_method.toLowerCase().includes(methodFilter.toLowerCase()));
      }
      setOrders(data);
    } catch {
      toast.error('Query Failed', 'Unable to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, methodFilter]);

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      toast.warning('No Records', 'There are no transaction records to export.');
      return;
    }
    exportTransactionsToCSV(orders);
    toast.success('Export Successful', `Exported ${orders.length} transaction records to CSV.`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setMethodFilter('ALL');
    setCurrentPage(1);
  };

  const isFiltered = searchTerm !== '' || statusFilter !== 'ALL' || methodFilter !== 'ALL';

  // Pagination slice
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Internal ID / PayPal Ref',
      key: 'id',
      render: (val, row) => (
        <div>
          <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {truncateId(val, 8, 4)}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Ref: {row.paypal_order_id}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (cust, row) => (
        <div>
          <div style={{ fontWeight: 550, color: 'var(--color-text-primary)' }}>
            {cust?.name || row.payer_email}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {row.payer_email} • <span style={{ fontWeight: 600 }}>{cust?.country || 'US'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      key: 'amount_cents',
      align: 'right',
      render: (cents, row) => (
        <span className="tabular-nums" style={{ fontWeight: 650, color: 'var(--color-text-primary)' }}>
          {formatCurrency(cents, row.currency)}
        </span>
      ),
    },
    {
      header: 'Payment Instrument',
      key: 'payment_method',
      render: (val) => (
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            display: 'inline-block',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      header: 'Created Date',
      key: 'created_at',
      render: (val) => (
        <span className="tabular-nums" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      header: 'Gateway Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Action',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/transactions/${row.id}`);
          }}
        >
          View →
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="Search, inspect, and audit all incoming customer authorizations, captures, and declines."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={fetchOrders}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </>
        }
      />

      {/* Structured Filter Workspace */}
      <Card padding={false} style={{ padding: '14px 18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search box with ample width so placeholder is never cut off */}
          <div style={{ flex: '1 1 320px', maxWidth: '420px' }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              placeholder="Search by ID, email, or order reference..."
              style={{ width: '100%', maxWidth: '100%' }}
            />
          </div>

          {/* Quick Status and Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Quick Status Filter Pills */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--color-surface-subtle)',
                padding: '2px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              {[
                { id: 'ALL', label: 'All' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'FAILED', label: 'Failed' },
              ].map((pill) => {
                const isActive = statusFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(pill.id);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '4px 10px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: isActive ? '0 1px 2px rgba(15, 23, 42, 0.06)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Payment Method Selector */}
            <div style={{ width: '150px' }}>
              <Select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Methods' },
                  { value: 'PayPal', label: 'PayPal Balance' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'SEPA', label: 'SEPA Debit' },
                  { value: 'UPI', label: 'NetBanking / UPI' },
                ]}
              />
            </div>

            {/* Clear filters action */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Transaction Table Workspace */}
      <Card padding={false}>
        <Table
          columns={columns}
          data={paginatedOrders}
          loading={loading}
          emptyTitle="No transactions matched"
          emptyDescription="Try clearing your search query or adjusting status and payment method filters."
          onRowClick={(row) => navigate(`/transactions/${row.id}`)}
        />

        {!loading && orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={orders.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        )}
      </Card>
    </PageContainer>
  );
}
