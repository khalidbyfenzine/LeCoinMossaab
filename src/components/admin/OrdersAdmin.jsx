import { useState } from 'react';
import { money } from '../../lib/format.js';

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

function EditForm({ order, tables, onCancel, onSave }) {
  const [table, setTable] = useState(order.table);
  const [server, setServer] = useState(order.server);
  const [status, setStatus] = useState(order.status);
  const [lines, setLines] = useState(order.items.map((it) => ({ ...it })));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const total = lines.reduce((sum, it) => sum + it.price * it.qty, 0);

  const changeQty = (id, delta) => {
    setLines((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)));
  };

  const removeLine = (id) => {
    setLines((prev) => prev.map((it) => (it.id === id ? { ...it, qty: 0 } : it)));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!server.trim() || lines.every((it) => it.qty <= 0)) return;
    setError(null);
    setSaving(true);
    try {
      await onSave({
        table_label: table,
        server_name: server.trim(),
        status,
        items: lines.map((it) => ({ id: it.id, qty: it.qty })),
      });
    } catch (err) {
      setError(err.message ?? "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td colSpan={6} style={{ padding: 0 }}>
        <form
          onSubmit={submit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-accent)',
            borderRadius: 8,
            padding: 14,
            margin: '6px 0',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={table} onChange={(e) => setTable(e.target.value)} style={fieldStyle()}>
              {tables.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="Serveur"
              style={{ ...fieldStyle(), flex: 1, minWidth: 140 }}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={fieldStyle()}>
              <option value="open">Ouverte</option>
              <option value="paid">Payée</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lines.map((it) => (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: it.qty <= 0 ? 0.4 : 1,
                  textDecoration: it.qty <= 0 ? 'line-through' : 'none',
                }}
              >
                <div style={{ flex: 1, fontSize: 13 }}>{it.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-muted)', width: 70, textAlign: 'right' }}>
                  {money(it.price * it.qty)}
                </div>
                <button
                  type="button"
                  onClick={() => changeQty(it.id, -1)}
                  style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer' }}
                >
                  −
                </button>
                <span style={{ width: 20, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{it.qty}</span>
                <button
                  type="button"
                  onClick={() => changeQty(it.id, 1)}
                  style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer' }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeLine(it.id)}
                  title="Retirer l'article"
                  style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--color-accent)', background: 'transparent', color: 'var(--color-accent)', cursor: 'pointer', fontSize: 12 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-mono)' }}>
            Total&nbsp;: {money(total)}
          </div>

          {error && <div style={{ fontSize: 12.5, color: 'var(--color-accent)' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

export default function OrdersAdmin({ orders, tables, ordersFrom, ordersTo, statusFilter, onFromChange, onToChange, onStatusFilterChange, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  const saveEdit = async (fields) => {
    await onUpdate(editingId, fields);
    setEditingId(null);
  };

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
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border-strong)' }}>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Date</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Table</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Serveur</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Articles</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Total</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}>Statut</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-muted)' }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '18px 10px', color: 'var(--color-muted-2)', textAlign: 'center' }}>
                  Aucune commande sur cette période.
                </td>
              </tr>
            )}
            {orders.map((o) =>
              editingId === o.id ? (
                <EditForm key={o.id} order={o} tables={tables} onCancel={() => setEditingId(null)} onSave={saveEdit} />
              ) : (
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
                  <td style={{ padding: '9px 10px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditingId(o.id)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--color-strong)', cursor: 'pointer' }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onDelete(o.id)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-accent)', background: 'transparent', fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', cursor: 'pointer' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
