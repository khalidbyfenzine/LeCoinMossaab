function fieldStyle() {
  return {
    padding: '7px 10px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 12.5,
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text)',
    background: '#fff',
  };
}

export default function OrdersAdmin({ orders, ordersFrom, ordersTo, statusFilter, onFromChange, onToChange, onStatusFilterChange }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Commandes</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Historique des commandes, filtrable par période et par statut.
      </div>

      <div
        className="admin-form-flex"
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}
      >
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Du</span>
        <input type="date" value={ordersFrom} onChange={(e) => onFromChange(e.target.value)} style={fieldStyle()} />
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>au</span>
        <input type="date" value={ordersTo} onChange={(e) => onToChange(e.target.value)} style={fieldStyle()} />
        <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} style={fieldStyle()}>
          <option value="all">Toutes</option>
          <option value="open">Ouverte</option>
          <option value="paid">Payée</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border-strong)' }}>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Date</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Table</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Serveur</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Articles</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Total</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '18px 10px', color: 'var(--color-muted-2)', textAlign: 'center' }}>
                  Aucune commande sur cette période.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>{o.dateDisplay}</td>
                <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)' }}>{o.table}</td>
                <td style={{ padding: '9px 10px' }}>{o.server}</td>
                <td style={{ padding: '9px 10px', color: 'var(--color-muted)' }}>{o.itemsLabel}</td>
                <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{o.totalDisplay}</td>
                <td style={{ padding: '9px 10px' }}>
                  {o.paid ? (
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-success-text)', background: 'var(--color-success-bg)', padding: '3px 9px', borderRadius: 20 }}>
                      Payée
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
    </div>
  );
}
