import { useState } from 'react';

const EMPTY_FORM = { type: 'out', amount: '', description: '' };

function fieldStyle() {
  return {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
  };
}

export default function CaisseAdmin({ balanceDisplay, transactions, onAdd, onDelete }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const submit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!(amount > 0) || !form.description.trim()) return;
    onAdd({ type: form.type, amount, description: form.description.trim() });
    setForm(EMPTY_FORM);
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Caisse</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Solde de la caisse et historique des transactions. Les commandes marquées payées alimentent
        automatiquement la caisse.
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 26,
          maxWidth: 280,
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
          Solde actuel
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600 }}>{balanceDisplay}</div>
      </div>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Nouvelle transaction</div>
      <form
        onSubmit={submit}
        className="admin-form-grid"
        style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.8fr 1.6fr auto', gap: 8, marginBottom: 26, alignItems: 'center' }}
      >
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={fieldStyle()}>
          <option value="out">Dépense (sortie)</option>
          <option value="in">Encaissement (entrée)</option>
        </select>
        <input
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          placeholder="Montant"
          type="number"
          min="0"
          step="0.5"
          style={fieldStyle()}
        />
        <input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Description (ex. Achat de glace)"
          style={fieldStyle()}
        />
        <button
          type="submit"
          style={{
            padding: '9px 16px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Ajouter
        </button>
      </form>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Historique</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {transactions.length === 0 && (
          <div style={{ color: 'var(--color-muted-2)', fontSize: 13, padding: '10px 0' }}>Aucune transaction pour l'instant.</div>
        )}
        {transactions.map((t) => (
          <div
            key={t.id}
            className="admin-list-row"
            style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 16px' }}
          >
            {t.type === 'in' ? (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-success-text)', background: 'var(--color-success-bg)', padding: '3px 9px', borderRadius: 20, flex: '0 0 auto' }}>
                Entrée
              </span>
            ) : (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-accent)', background: 'var(--color-open-bg)', padding: '3px 9px', borderRadius: 20, flex: '0 0 auto' }}>
                Sortie
              </span>
            )}
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                {t.description}
                {t.linkedToOrder && (
                  <span style={{ fontWeight: 500, color: 'var(--color-muted)', fontSize: 11.5 }}> · commande</span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-muted)' }}>
                {t.dateDisplay}
                {t.createdBy ? ` · ${t.createdBy}` : ''}
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: t.type === 'in' ? 'var(--color-success-text)' : 'var(--color-accent)',
              }}
            >
              {t.type === 'in' ? '+' : '−'}
              {t.amountDisplay}
            </div>
            {!t.linkedToOrder && (
              <button
                onClick={() => onDelete(t.id)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--color-strong)', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
