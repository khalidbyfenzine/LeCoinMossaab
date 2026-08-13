import { money, timeLabel } from '../../lib/format.js';

export default function OrderTicket({
  selectedTable,
  cart,
  onInc,
  onDec,
  subtotal,
  tax,
  total,
  onSendToKitchen,
  tableOrders,
  onEditOrder,
  onMarkPaid,
}) {
  return (
    <div
      style={{
        width: 360,
        flex: '0 0 auto',
        background: 'var(--color-surface)',
        borderLeft: '1px dashed var(--color-border-dashed)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-muted)',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {selectedTable}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Ticket de commande</div>

      <div style={{ flex: '1 1 140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 60 }}>
        {cart.length === 0 && (
          <div style={{ color: 'var(--color-muted-2)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
            Aucun article pour l'instant — touchez un article du menu pour l'ajouter.
          </div>
        )}
        {cart.map((ln) => (
          <div key={ln.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--color-accent)', minWidth: 20 }}>
              {ln.qty}×
            </div>
            <div style={{ fontSize: 13.5, flex: '0 1 auto' }}>{ln.name}</div>
            <div style={{ flex: 1, borderBottom: '1px dotted oklch(75% 0.015 60)', height: 1, transform: 'translateY(-3px)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600 }}>{money(ln.price * ln.qty)}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                onClick={() => onDec(ln.id)}
                style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid oklch(80% 0.015 60)', background: '#fff', fontSize: 12, lineHeight: 1, cursor: 'pointer' }}
              >
                −
              </button>
              <button
                onClick={() => onInc(ln.id)}
                style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid oklch(80% 0.015 60)', background: '#fff', fontSize: 12, lineHeight: 1, cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed var(--color-border-dashed)', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
          <span>Sous-total</span>
          <span>{money(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
          <span>Taxe</span>
          <span>{money(tax)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: 'var(--color-text)', marginTop: 4 }}>
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={onSendToKitchen}
          style={{ flex: 1, padding: 13, borderRadius: 7, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Envoyer en cuisine
        </button>
      </div>

      <div style={{ borderTop: '1px dashed var(--color-border-dashed)', marginTop: 14, paddingTop: 12, display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 130px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Commandes envoyées — {selectedTable}</div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tableOrders.length === 0 && (
            <div style={{ color: 'var(--color-muted-2)', fontSize: 12.5, padding: '10px 0' }}>Aucune commande envoyée pour cette table.</div>
          )}
          {tableOrders.map((ord) => {
            const itemCount = ord.items.reduce((sum, it) => sum + it.qty, 0);
            const orderTotal = ord.items.reduce((sum, it) => sum + it.price * it.qty, 0);
            const summary = `${itemCount} article${itemCount === 1 ? '' : 's'} — ${ord.items.map((it) => it.name).join(', ')}`;
            return (
              <div
                key={ord.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 7, padding: '9px 11px' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{summary}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-muted)' }}>
                    {timeLabel(ord.created_at)} · {money(orderTotal)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    onClick={() => onMarkPaid(ord.id)}
                    style={{ padding: '6px 11px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                  >
                    Marquer payé
                  </button>
                  <button
                    onClick={() => onEditOrder(ord.id)}
                    style={{ padding: '6px 11px', borderRadius: 6, border: '1px solid var(--color-accent)', background: 'transparent', color: 'var(--color-accent)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                  >
                    Modifier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
