import { useState } from 'react';
import { money } from '../../lib/format.js';

function fieldStyle() {
  return {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 13.5,
    fontFamily: 'var(--font-sans)',
  };
}

function AddonsEditor({ addons, onAdd, onDelete }) {
  const [draftName, setDraftName] = useState('');
  const [draftPrice, setDraftPrice] = useState('');

  const submitAddon = (e) => {
    e.preventDefault();
    const price = Number(draftPrice);
    if (!draftName.trim() || !(price > 0)) return;
    onAdd(draftName.trim(), price);
    setDraftName('');
    setDraftPrice('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px dashed var(--color-border)', paddingTop: 10, marginTop: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
        Suppléments — s'appliquent à tous les articles de cette catégorie
      </div>
      {addons.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {addons.map((a) => (
            <span
              key={a.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                background: 'var(--color-surface-dim)',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                padding: '4px 6px 4px 10px',
              }}
            >
              {a.name}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600 }}>+{money(a.price)}</span>
              <button
                type="button"
                onClick={() => onDelete(a.id)}
                style={{ width: 16, height: 16, borderRadius: '50%', border: 'none', background: 'var(--color-border)', fontSize: 10, lineHeight: 1, cursor: 'pointer', color: 'var(--color-strong)' }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <form onSubmit={submitAddon} className="admin-form-flex" style={{ display: 'flex', gap: 6, maxWidth: 360 }}>
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Nom (ex. Frites)"
          style={{ ...fieldStyle(), flex: 1.4, padding: '6px 8px', fontSize: 12.5 }}
        />
        <input
          value={draftPrice}
          onChange={(e) => setDraftPrice(e.target.value)}
          placeholder="+MAD"
          type="number"
          min="0"
          step="0.5"
          style={{ ...fieldStyle(), flex: 1, padding: '6px 8px', fontSize: 12.5 }}
        />
        <button
          type="submit"
          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}

export default function CategoriesAdmin({ categories, addonsByCategoryId, onAdd, onRemove, onUpdate, onAddAddon, onDeleteAddon }) {
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  const submitAdd = (e) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    onAdd(label);
    setNewLabel('');
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditLabel(c.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const submitEdit = (e) => {
    e.preventDefault();
    const label = editLabel.trim();
    if (!label) return;
    onUpdate(editingId, label);
    cancelEdit();
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Catégories</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Ajoutez, renommez ou retirez des catégories de menu — utilisées à l'écran caissier et pour organiser les
        articles du menu.
      </div>

      <form onSubmit={submitAdd} className="admin-form-flex" style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Nom de la catégorie (ex. Sandwichs)"
          style={{ flex: 1, ...fieldStyle() }}
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
        {categories.map((c) =>
          editingId === c.id ? (
            <form
              key={c.id}
              onSubmit={submitEdit}
              className="admin-form-flex"
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-accent)',
                borderRadius: 8,
                padding: '10px 16px',
              }}
            >
              <input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                style={{ flex: 1, ...fieldStyle() }}
              />
              <button
                type="submit"
                style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
              >
                Annuler
              </button>
            </form>
          ) : (
            <div
              key={c.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '13px 16px',
              }}
            >
              <div className="admin-list-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{c.label}</div>
                <button
                  onClick={() => startEdit(c)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-strong)',
                    fontWeight: 600,
                    fontSize: 12.5,
                    cursor: 'pointer',
                  }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => onRemove(c.id)}
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

              <AddonsEditor
                addons={addonsByCategoryId[c.id] ?? []}
                onAdd={(name, price) => onAddAddon(c.id, { name, price })}
                onDelete={onDeleteAddon}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
