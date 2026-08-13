import { useState } from 'react';
import { money } from '../../lib/format.js';

const EMPTY_FORM = { name: '', category: '', price: '' };

function fieldStyle() {
  return {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
  };
}

export default function MenuItemsAdmin({ items, categories, onToggle, onAdd, onUpdate, onDelete }) {
  const [newForm, setNewForm] = useState({ ...EMPTY_FORM, category: categories[0] ?? '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const submitAdd = (e) => {
    e.preventDefault();
    const price = Number(newForm.price);
    if (!newForm.name.trim() || !newForm.category || !(price > 0)) return;
    onAdd({ name: newForm.name.trim(), category: newForm.category, price });
    setNewForm({ ...EMPTY_FORM, category: newForm.category });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, category: item.category, price: String(item.price) });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    const price = Number(editForm.price);
    if (!editForm.name.trim() || !editForm.category || !(price > 0)) return;
    onUpdate(editingId, { name: editForm.name.trim(), category: editForm.category, price });
    cancelEdit();
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Articles du menu</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Ajoutez, modifiez, retirez des articles ou basculez leur disponibilité.
      </div>

      <form
        onSubmit={submitAdd}
        className="admin-form-grid"
        style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr auto', gap: 8, marginBottom: 26, alignItems: 'center' }}
      >
        <input
          value={newForm.name}
          onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nom de l'article"
          style={fieldStyle()}
        />
        <select
          value={newForm.category}
          onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))}
          style={fieldStyle()}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={newForm.price}
          onChange={(e) => setNewForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Prix"
          type="number"
          min="0"
          step="0.5"
          style={fieldStyle()}
        />
        <button
          type="submit"
          style={{ padding: '9px 16px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Ajouter
        </button>
      </form>

      {categories.map((cat) => {
        const catItems = items.filter((m) => m.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 26 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{cat}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {catItems.map((m) =>
                editingId === m.id ? (
                  <form
                    key={m.id}
                    onSubmit={submitEdit}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-accent)',
                      borderRadius: 8,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      style={fieldStyle()}
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      style={fieldStyle()}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      value={editForm.price}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                      type="number"
                      min="0"
                      step="0.5"
                      style={fieldStyle()}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="submit"
                        style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    key={m.id}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      opacity: m.available ? 1 : 0.6,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25 }}>{m.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-accent)', fontWeight: 600 }}>
                      {money(m.price)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      {m.available ? (
                        <button
                          onClick={() => onToggle(m.id)}
                          title="Disponible"
                          style={{ width: 40, height: 22, borderRadius: 11, border: 'none', background: 'var(--color-accent)', position: 'relative', cursor: 'pointer', flex: '0 0 auto' }}
                        >
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, right: 3 }} />
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggle(m.id)}
                          title="Épuisé"
                          style={{ width: 40, height: 22, borderRadius: 11, border: '1px solid oklch(80% 0.015 60)', background: 'var(--color-surface-dim)', position: 'relative', cursor: 'pointer', flex: '0 0 auto' }}
                        >
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: 3, boxShadow: '0 1px 2px oklch(70% 0.01 60)' }} />
                        </button>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{m.available ? 'Disponible' : 'Épuisé'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                      <button
                        onClick={() => startEdit(m)}
                        style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--color-strong)', cursor: 'pointer' }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onDelete(m.id)}
                        style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--color-accent)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', cursor: 'pointer' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
