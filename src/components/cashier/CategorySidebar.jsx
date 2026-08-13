export default function CategorySidebar({ categories, category, onSelectCategory }) {
  return (
    <div
      style={{
        width: 170,
        flex: '0 0 auto',
        background: 'var(--color-surface-muted)',
        borderRight: '1px solid var(--color-border)',
        padding: '16px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onSelectCategory(c)}
          style={{
            textAlign: 'left',
            padding: '11px 12px',
            borderRadius: 6,
            border: 'none',
            background: c === category ? 'var(--color-accent)' : 'transparent',
            color: c === category ? '#fff' : 'var(--color-strong)',
            fontWeight: c === category ? 600 : 500,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
