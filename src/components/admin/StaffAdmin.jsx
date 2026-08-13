import { useState } from 'react';
import { initials } from '../../lib/format.js';

const EMPTY_FORM = { name: '', role: '', login_role: 'cashier', pin: '' };

function fieldStyle() {
  return {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
  };
}

export default function StaffAdmin({ staff, onToggleClock, onAdd, onUpdate, onDelete }) {
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const submitAdd = (e) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.role.trim() || !/^\d{4}$/.test(newForm.pin)) return;
    onAdd({ ...newForm, name: newForm.name.trim(), role: newForm.role.trim() });
    setNewForm(EMPTY_FORM);
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, role: s.role, login_role: s.login_role, pin: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.role.trim()) return;
    if (editForm.pin && !/^\d{4}$/.test(editForm.pin)) return;
    const payload = { name: editForm.name.trim(), role: editForm.role.trim(), login_role: editForm.login_role };
    if (editForm.pin) payload.pin = editForm.pin;
    onUpdate(editingId, payload);
    cancelEdit();
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Personnel</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Ajoutez, modifiez ou retirez des membres du personnel.
      </div>

      <form
        onSubmit={submitAdd}
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr auto',
          gap: 8,
          marginBottom: 18,
          alignItems: 'center',
        }}
      >
        <input
          value={newForm.name}
          onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nom"
          style={fieldStyle()}
        />
        <input
          value={newForm.role}
          onChange={(e) => setNewForm((f) => ({ ...f, role: e.target.value }))}
          placeholder="Rôle (ex. Serveur)"
          style={fieldStyle()}
        />
        <select
          value={newForm.login_role}
          onChange={(e) => setNewForm((f) => ({ ...f, login_role: e.target.value }))}
          style={fieldStyle()}
        >
          <option value="cashier">Caissier</option>
          <option value="admin">Administrateur</option>
        </select>
        <input
          value={newForm.pin}
          onChange={(e) => setNewForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
          placeholder="Code (4 chiffres)"
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {staff.map((s) =>
          editingId === s.id ? (
            <form
              key={s.id}
              onSubmit={submitEdit}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr auto auto',
                gap: 8,
                alignItems: 'center',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-accent)',
                borderRadius: 8,
                padding: '10px 16px',
              }}
            >
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                style={fieldStyle()}
              />
              <input
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                style={fieldStyle()}
              />
              <select
                value={editForm.login_role}
                onChange={(e) => setEditForm((f) => ({ ...f, login_role: e.target.value }))}
                style={fieldStyle()}
              >
                <option value="cashier">Caissier</option>
                <option value="admin">Administrateur</option>
              </select>
              <input
                value={editForm.pin}
                onChange={(e) => setEditForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="Nouveau code"
                style={fieldStyle()}
              />
              <button
                type="submit"
                style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
              >
                Annuler
              </button>
            </form>
          ) : (
            <div
              key={s.id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '13px 16px' }}
            >
              <div
                style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-avatar-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--color-strong)', flex: '0 0 auto' }}
              >
                {initials(s.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
                  {s.role} · {s.login_role === 'admin' ? 'Administrateur' : 'Caissier'}
                </div>
              </div>
              {s.clocked_in ? (
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-success-text)', background: 'var(--color-success-bg)', padding: '3px 9px', borderRadius: 20, marginRight: 6 }}>
                  Présent
                </span>
              ) : (
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-muted)', background: 'var(--color-surface-dim)', padding: '3px 9px', borderRadius: 20, marginRight: 6 }}>
                  Absent
                </span>
              )}
              <button
                onClick={() => onToggleClock(s.id)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid oklch(75% 0.015 60)', background: 'transparent', fontSize: 12.5, fontWeight: 600, color: 'var(--color-strong)', cursor: 'pointer' }}
              >
                Basculer
              </button>
              <button
                onClick={() => startEdit(s)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontSize: 12.5, fontWeight: 600, color: 'var(--color-strong)', cursor: 'pointer' }}
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(s.id)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-accent)', background: 'transparent', fontSize: 12.5, fontWeight: 600, color: 'var(--color-accent)', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
