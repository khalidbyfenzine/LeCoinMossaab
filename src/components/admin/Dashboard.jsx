import { useState } from 'react';

function dateFieldStyle() {
  return {
    padding: '5px 8px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 12.5,
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text)',
    background: '#fff',
  };
}

export default function Dashboard({
  todayLabel,
  stats,
  dailyBars,
  dashboardFrom,
  dashboardTo,
  onDashboardFromChange,
  onDashboardToChange,
  recentOrders,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Tableau de bord</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>{todayLabel}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 26 }}>
        {[
          { label: 'Ventes du jour', value: stats.salesDisplay, mono: true },
          { label: 'Commandes', value: stats.ordersCount, mono: true },
          {
            label: 'Article le plus vendu',
            value: stats.topItemName,
            subtitle: stats.topItemQty > 0 ? `${stats.topItemQty} vendu${stats.topItemQty === 1 ? '' : 's'}` : null,
            mono: false,
          },
        ].map((tile) => (
          <div
            key={tile.label}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 16 }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              {tile.label}
            </div>
            <div
              style={{
                fontFamily: tile.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                fontSize: tile.mono ? 24 : 18,
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {tile.value}
            </div>
            {tile.subtitle && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                {tile.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '18px 20px', marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Ventes par jour</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Du</span>
            <input
              type="date"
              value={dashboardFrom}
              onChange={(e) => onDashboardFromChange(e.target.value)}
              style={dateFieldStyle()}
            />
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>au</span>
            <input
              type="date"
              value={dashboardTo}
              onChange={(e) => onDashboardToChange(e.target.value)}
              style={dateFieldStyle()}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 150, overflowX: 'auto', overflowY: 'hidden' }}>
          {dailyBars.map((d, i) => (
            <div
              key={d.label + i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx((cur) => (cur === i ? null : cur))}
              style={{ flex: '1 0 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}
            >
              {hoveredIdx === i && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 6,
                    background: 'var(--color-dark)',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 11.5,
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{d.dateDisplay}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', marginTop: 1 }}>{d.totalDisplay}</div>
                </div>
              )}
              <div style={{ width: '100%', background: 'var(--color-accent)', borderRadius: '3px 3px 0 0', height: d.heightPx, opacity: hoveredIdx === i ? 1 : 0.85 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted-3)' }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Commandes récentes</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border-strong)' }}>
            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Table</th>
            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Serveur</th>
            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Articles</th>
            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Total</th>
            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)' }}>{o.table}</td>
              <td style={{ padding: '9px 10px' }}>{o.server}</td>
              <td style={{ padding: '9px 10px', color: 'var(--color-muted)' }}>{o.itemsLabel}</td>
              <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{o.totalDisplay}</td>
              <td style={{ padding: '9px 10px' }}>
                {o.paid ? (
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-success-text)', background: 'var(--color-success-bg)', padding: '3px 9px', borderRadius: 20 }}>
                    Payé
                  </span>
                ) : (
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-accent)', background: 'var(--color-open-bg)', padding: '3px 9px', borderRadius: 20 }}>
                    Ouverte
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
