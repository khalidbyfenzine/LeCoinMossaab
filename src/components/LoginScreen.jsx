import PinPad from './PinPad.jsx';
import { initials } from '../lib/format.js';

export default function LoginScreen({
  loginRole,
  onSetLoginRole,
  staffList,
  pinTarget,
  pinEntry,
  pinError,
  onSelectPerson,
  onDigit,
  onCancelPin,
}) {
  const people = staffList.filter((p) => p.login_role === loginRole);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        gap: 26,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 19,
            color: '#fff',
          }}
        >
          M
        </div>
        <div style={{ fontWeight: 700, fontSize: 20 }}>Le Coin Mosaab</div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Connexion du personnel</div>
      </div>

      <div style={{ display: 'flex', gap: 6, background: 'var(--color-dark)', padding: 4, borderRadius: 8 }}>
        {['cashier', 'admin'].map((role) => (
          <button
            key={role}
            onClick={() => onSetLoginRole(role)}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              background: loginRole === role ? 'var(--color-accent)' : 'transparent',
              color: loginRole === role ? '#fff' : 'var(--color-dark-text-dim)',
              fontWeight: loginRole === role ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {role === 'cashier' ? 'Caissier' : 'Administrateur'}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          maxWidth: 560,
          width: '100%',
        }}
      >
        {people.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPerson(p)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              padding: '20px 12px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--color-avatar-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--color-strong)',
              }}
            >
              {initials(p.name)}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, textAlign: 'center' }}>{p.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{p.role}</div>
          </button>
        ))}
      </div>

      {pinTarget && (
        <PinPad
          targetName={pinTarget.name}
          pinEntry={pinEntry}
          pinError={pinError}
          onDigit={onDigit}
          onCancel={onCancelPin}
        />
      )}
    </div>
  );
}
