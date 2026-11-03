import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * data: FIXTURE_STATUS_DISTRIBUTION -> [{ name, value (pct), count, color }]
 * minAngle keeps tiny segments (pending / failed) visible. It slightly
 * exaggerates them, so the legend below carries the exact numbers.
 */
export function SettlementDonut({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const completed = data.find((d) => /complet|success/i.test(d.name));

  return (
    <>
      <div style={{ position: 'relative', height: 240, width: '100%', marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={88}
              paddingAngle={3}
              minAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name, item) => [
                `${val}% (${item.payload.count.toLocaleString()} orders)`,
                item.payload.name,
              ]}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            className="tabular-nums"
            style={{ fontSize: 28, fontWeight: 650, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}
          >
            {completed ? `${completed.value}%` : total.toLocaleString()}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {completed ? 'settled cleanly' : 'orders'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {data.map((item) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>
                {item.count.toLocaleString()}
              </span>
              <span className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                ({item.value}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

