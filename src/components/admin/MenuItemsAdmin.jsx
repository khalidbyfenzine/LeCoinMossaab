import { useState } from 'react';
import { money, initials } from '../../lib/format.js';
import { uploadMenuImage } from '../../lib/uploadImage.js';

const EMPTY_FORM = { name: '', category: '', price: '', image_url: '' };

function fieldStyle() {
  return {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
  };
}

function ImagePicker({ imageUrl, uploading, error, onSelectFile, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          border: '1px dashed var(--color-border)',
          background: imageUrl ? `center / cover no-repeat url(${imageUrl})` : 'var(--color-surface-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          flex: '0 0 auto',
        }}
        title={label}
      >
        {!imageUrl && !uploading && <span style={{ fontSize: 18, color: 'var(--color-muted)' }}>+</span>}
        {uploading && <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>…</span>}
        <input type="file" accept="image/*" onChange={onSelectFile} style={{ display: 'none' }} />
      </label>
      {error && <div style={{ fontSize: 10.5, color: 'var(--color-accent)', maxWidth: 90 }}>{error}</div>}
    </div>
  );
}

export default function MenuItemsAdmin({ items, categories, onToggle, onAdd, onUpdate, onDelete }) {
  const [newForm, setNewForm] = useState({ ...EMPTY_FORM, category: categories[0] ?? '' });
  const [newUploading, setNewUploading] = useState(false);
  const [newImageError, setNewImageError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editUploading, setEditUploading] = useState(false);
  const [editImageError, setEditImageError] = useState(null);

  const handleImageChange = async (e, isEdit) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const setForm = isEdit ? setEditForm : setNewForm;
    const setUploading = isEdit ? setEditUploading : setNewUploading;
    const setError = isEdit ? setEditImageError : setNewImageError;

    setError(null);
    setUploading(true);
    try {
      const url = await uploadMenuImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err.message ?? 'Échec du téléversement.');
    } finally {
      setUploading(false);
    }
  };

  const submitAdd = (e) => {
    e.preventDefault();
    const price = Number(newForm.price);
    if (!newForm.name.trim() || !newForm.category || !(price > 0)) return;
    onAdd({ name: newForm.name.trim(), category: newForm.category, price, image_url: newForm.image_url || null });
    setNewForm({ ...EMPTY_FORM, category: newForm.category });
    setNewImageError(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, category: item.category, price: String(item.price), image_url: item.image_url ?? '' });
    setEditImageError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditImageError(null);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    const price = Number(editForm.price);
    if (!editForm.name.trim() || !editForm.category || !(price > 0)) return;
    onUpdate(editingId, {
      name: editForm.name.trim(),
      category: editForm.category,
      price,
      image_url: editForm.image_url || null,
    });
    cancelEdit();
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Articles du menu</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>
        Ajoutez, modifiez, retirez des articles, basculez leur disponibilité ou ajoutez une photo.
      </div>

      <form
        onSubmit={submitAdd}
        className="admin-form-grid"
        style={{ display: 'grid', gridTemplateColumns: 'auto 1.4fr 1fr 0.8fr auto', gap: 8, marginBottom: 26, alignItems: 'center' }}
      >
        <ImagePicker
          imageUrl={newForm.image_url}
          uploading={newUploading}
          error={newImageError}
          onSelectFile={(e) => handleImageChange(e, false)}
          label="Ajouter une photo"
        />
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
          disabled={newUploading}
          style={{ padding: '9px 16px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: newUploading ? 'not-allowed' : 'pointer', opacity: newUploading ? 0.6 : 1 }}
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
                    <ImagePicker
                      imageUrl={editForm.image_url}
                      uploading={editUploading}
                      error={editImageError}
                      onSelectFile={(e) => handleImageChange(e, true)}
                      label="Changer la photo"
                    />
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
                        disabled={editUploading}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: editUploading ? 'not-allowed' : 'pointer', opacity: editUploading ? 0.6 : 1 }}
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
                    {m.image_url ? (
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 6,
                          backgroundImage: `url(${m.image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 6,
                          background: 'var(--color-avatar-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 20,
                          color: 'var(--color-strong)',
                        }}
                      >
                        {initials(m.name)}
                      </div>
                    )}

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
