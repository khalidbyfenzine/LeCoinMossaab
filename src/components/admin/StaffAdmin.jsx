import { initials } from '../../lib/format.js';

export default function StaffAdmin({ staff, onToggle }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Personnel</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 22 }}>Équipe en service aujourd'hui.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {staff.map((s) => (
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
              <div style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>{s.role}</div>
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
              onClick={() => onToggle(s.id)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid oklch(75% 0.015 60)', background: 'transparent', fontSize: 12.5, fontWeight: 600, color: 'var(--color-strong)', cursor: 'pointer' }}
            >
              Basculer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
