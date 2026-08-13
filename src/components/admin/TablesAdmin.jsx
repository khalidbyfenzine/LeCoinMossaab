import { useState } from 'react';

export default function TablesAdmin({ tables, onAdd, onRemove }) {
  const [newLabel, setNewLabel] = useState('');

  const submitAdd = (e) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    onAdd(label);
    setNewLabel('');
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Tables</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Ajoutez ou retirez des tables — la liste se met à jour instantanément à l'écran caissier.
      </div>

      <form onSubmit={submitAdd} className="admin-form-flex" style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Nom de la table (ex. Table 9)"
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 6,
            border: '1px solid var(--color-border)',
            fontSize: 13.5,
            fontFamily: 'var(--font-sans)',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 18px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          Ajouter
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tables.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '13px 16px',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{t.label}</div>
            <button
              onClick={() => onRemove(t.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--color-accent)',
                background: 'transparent',
                color: 'var(--color-accent)',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
