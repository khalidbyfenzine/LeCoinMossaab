const DIGIT_LAYOUT = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'clear'];

export default function PinPad({ targetName, pinEntry, pinError, onDigit, onCancel }) {
  const dots = [0, 1, 2, 3];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(15% 0.01 40 / 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 12,
          padding: '28px 30px',
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{targetName}</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>Enter your 4-digit code</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {dots.map((i) => (
            <div
              key={i}
              style={
                i < pinEntry.length
                  ? { width: 14, height: 14, borderRadius: '50%', background: 'var(--color-accent)' }
                  : {
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '1.5px solid oklch(75% 0.015 60)',
                    }
              }
            />
          ))}
        </div>

        {pinError && (
          <div style={{ fontSize: 12, color: 'var(--color-accent)', fontWeight: 600 }}>
            Incorrect code — try again.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {DIGIT_LAYOUT.map((d, idx) => (
            <button
              key={idx}
              onClick={() => onDigit(d)}
              style={{
                width: 60,
                height: 48,
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: '#fff',
                fontSize: 17,
                fontWeight: 600,
                cursor: 'pointer',
                visibility: d === '' ? 'hidden' : 'visible',
              }}
            >
              {d === 'clear' ? 'Clear' : d}
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            fontSize: 12.5,
            color: 'var(--color-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
