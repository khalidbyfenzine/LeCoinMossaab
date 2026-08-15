import { useState } from 'react';
import { money, initials } from '../../lib/format.js';
import AddonPicker from './AddonPicker.jsx';

function ItemImage({ item }) {
  if (item.image_url) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: 6,
          backgroundImage: `url(${item.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '4 / 3',
        borderRadius: 6,
        background: 'var(--color-avatar-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 22,
        color: 'var(--color-strong)',
      }}
    >
      {initials(item.name)}
    </div>
  );
}

export default function MenuGrid({ items, addonsByCategoryLabel, onAdd }) {
  const [configuringItem, setConfiguringItem] = useState(null);

  const handleClick = (item) => {
    const itemAddons = addonsByCategoryLabel[item.category] ?? [];
    if (itemAddons.length > 0) {
      setConfiguringItem(item);
    } else {
      onAdd(item, []);
    }
  };

  return (
    <div className="menu-grid-container" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 16,
        }}
      >
        {items.map((it) =>
          it.available ? (
            <button
              key={it.id}
              onClick={() => handleClick(it)}
              style={{
                textAlign: 'left',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '12px 14px 14px',
                cursor: 'pointer',
                boxShadow: '0 1px 0 var(--color-border-strong)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <ItemImage item={it} />
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25 }}>{it.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-accent)', fontWeight: 600 }}>
                {money(it.price)}
              </div>
              {(addonsByCategoryLabel[it.category]?.length ?? 0) > 0 && (
                <div style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>
                  + suppléments disponibles
                </div>
              )}
            </button>
          ) : (
            <div
              key={it.id}
              style={{
                textAlign: 'left',
                background: 'var(--color-surface-dim)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '12px 14px 14px',
                opacity: 0.55,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <ItemImage item={it} />
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25 }}>{it.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-muted)', fontWeight: 600, letterSpacing: 0.4 }}>
                ÉPUISÉ
              </div>
            </div>
          )
        )}
      </div>

      {configuringItem && (
        <AddonPicker
          item={configuringItem}
          addons={addonsByCategoryLabel[configuringItem.category] ?? []}
          onConfirm={(selectedAddons) => {
            onAdd(configuringItem, selectedAddons);
            setConfiguringItem(null);
          }}
          onCancel={() => setConfiguringItem(null)}
        />
      )}
    </div>
  );
}
