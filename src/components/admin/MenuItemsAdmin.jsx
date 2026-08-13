import { money } from '../../lib/format.js';

export default function MenuItemsAdmin({ items, onToggle }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Menu Items</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Toggle availability — changes apply to the cashier screen instantly.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((m) => (
          <div
            key={m.id}
            style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '13px 16px' }}
          >
            <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', width: 70, flex: '0 0 auto' }}>
              {m.category}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{m.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--color-muted)', width: 60, flex: '0 0 auto' }}>
              {money(m.price)}
            </div>
            {m.available ? (
              <button
                onClick={() => onToggle(m.id)}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: 'var(--color-accent)', position: 'relative', cursor: 'pointer', flex: '0 0 auto' }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, right: 3 }} />
              </button>
            ) : (
              <button
                onClick={() => onToggle(m.id)}
                style={{ width: 44, height: 24, borderRadius: 12, border: '1px solid oklch(80% 0.015 60)', background: 'var(--color-surface-dim)', position: 'relative', cursor: 'pointer', flex: '0 0 auto' }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: 3, boxShadow: '0 1px 2px oklch(70% 0.01 60)' }} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
