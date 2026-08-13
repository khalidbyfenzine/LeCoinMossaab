export default function TopBar({
  view,
  onGoCashier,
  onGoAdmin,
  isCashier,
  canAccessAdmin,
  tables,
  selectedTable,
  onSelectTable,
  todayLabel,
  currentUserName,
  onLogout,
}) {
  return (
    <div
      className="topbar"
      style={{
        height: 64,
        flex: '0 0 auto',
        background: 'var(--color-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '0 20px',
        color: 'oklch(96% 0.01 70)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 15,
            color: 'oklch(97% 0.01 70)',
          }}
        >
          M
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.2 }}>Le Coin Mosaab</div>
      </div>

      {isCashier ? (
        <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0' }}>
          {tables.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTable(t)}
              style={
                t === selectedTable
                  ? {
                      flex: '0 0 auto',
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: '1px solid var(--color-accent)',
                      background: 'var(--color-accent)',
                      color: 'oklch(97% 0.01 70)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }
                  : {
                      flex: '0 0 auto',
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: '1px solid var(--color-dark-border)',
                      background: 'transparent',
                      color: 'var(--color-dark-text-dimmer)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }
              }
            >
              {t}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, fontSize: 13, color: 'var(--color-dark-text-dim)', fontFamily: 'var(--font-mono)' }}>
          {todayLabel}
        </div>
      )}

      {canAccessAdmin && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            flex: '0 0 auto',
            background: 'var(--color-dark-alt)',
            padding: 4,
            borderRadius: 8,
          }}
        >
          <button
            onClick={onGoCashier}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              border: 'none',
              background: view === 'cashier' ? 'var(--color-accent)' : 'transparent',
              color: view === 'cashier' ? '#fff' : 'var(--color-dark-text-dim)',
              fontWeight: view === 'cashier' ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Caissier
          </button>
          <button
            onClick={onGoAdmin}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              border: 'none',
              background: view === 'admin' ? 'var(--color-accent)' : 'transparent',
              color: view === 'admin' ? '#fff' : 'var(--color-dark-text-dim)',
              fontWeight: view === 'admin' ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Administrateur
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
        <div style={{ fontSize: 13, color: 'var(--color-dark-text-dim)' }}>{currentUserName}</div>
        <button
          onClick={onLogout}
          style={{
            padding: '7px 14px',
            borderRadius: 6,
            border: '1px solid var(--color-dark-border)',
            background: 'transparent',
            color: 'var(--color-dark-text-dimmer)',
            fontWeight: 500,
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
