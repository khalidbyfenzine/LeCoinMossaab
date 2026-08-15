import { useState } from 'react';
import { money } from '../../lib/format.js';

export default function AddonPicker({ item, addons, onConfirm, onCancel }) {
  const [selected, setSelected] = useState([]);

  const toggle = (addon) => {
    setSelected((prev) => (prev.some((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]));
  };

  const total = Number(item.price) + selected.reduce((sum, a) => sum + Number(a.price), 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(15% 0.01 40 / 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 12,
          padding: '22px 24px',
          width: 300,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>Choisissez des suppléments (facultatif)</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {addons.map((a) => {
            const checked = selected.some((s) => s.id === a.id);
            return (
              <label
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '9px 11px',
                  borderRadius: 7,
                  border: '1px solid var(--color-border)',
                  background: checked ? 'var(--color-surface-alt)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5 }}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(a)} />
                  {a.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-accent)', fontWeight: 600 }}>
                  +{money(a.price)}
                </span>
              </label>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 15,
            borderTop: '1px dashed var(--color-border-dashed)',
            paddingTop: 10,
          }}
        >
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)' }}>Total</span>
          <span>{money(total)}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-strong)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(selected)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
