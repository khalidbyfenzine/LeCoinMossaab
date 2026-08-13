import { money } from '../../lib/format.js';

export default function MenuGrid({ items, onAdd }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        {items.map((it) =>
          it.available ? (
            <button
              key={it.id}
              onClick={() => onAdd(it)}
              style={{
                textAlign: 'left',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '14px 12px',
                cursor: 'pointer',
                boxShadow: '0 1px 0 var(--color-border-strong)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 76,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25 }}>{it.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-accent)', fontWeight: 600 }}>
                {money(it.price)}
              </div>
            </button>
          ) : (
            <div
              key={it.id}
              style={{
                textAlign: 'left',
                background: 'var(--color-surface-dim)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '14px 12px',
                opacity: 0.55,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 76,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25 }}>{it.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-muted)', fontWeight: 600, letterSpacing: 0.4 }}>
                SOLD OUT
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
