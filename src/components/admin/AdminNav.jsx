const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'menu', label: 'Articles du menu' },
  { id: 'tables', label: 'Tables' },
  { id: 'staff', label: 'Personnel' },
];

export default function AdminNav({ adminSection, onSelect }) {
  return (
    <div
      style={{
        width: 200,
        flex: '0 0 auto',
        background: 'var(--color-dark)',
        padding: '18px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {NAV_ITEMS.map((n) => (
        <button
          key={n.id}
          onClick={() => onSelect(n.id)}
          style={{
            textAlign: 'left',
            padding: '10px 12px',
            borderRadius: 6,
            border: 'none',
            background: n.id === adminSection ? 'var(--color-accent)' : 'transparent',
            color: n.id === adminSection ? '#fff' : 'var(--color-dark-text-dim)',
            fontWeight: n.id === adminSection ? 600 : 500,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {n.label}
        </button>
      ))}
    </div>
  );
}
