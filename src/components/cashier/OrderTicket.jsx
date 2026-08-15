import { useEffect, useState } from 'react';
import { money } from '../../lib/format.js';
import { buildReceiptBytes } from '../../lib/escpos.js';
import { ensurePrinterConnected, sendBytes } from '../../lib/webusbPrinter.js';

export default function OrderTicket({
  selectedTable,
  cart,
  onInc,
  onDec,
  subtotal,
  tax,
  total,
  onFinalizeOrder,
  serverName,
}) {
  const [amountReceived, setAmountReceived] = useState('');
  const [printing, setPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState(null);

  useEffect(() => {
    setAmountReceived('');
  }, [selectedTable]);

  useEffect(() => {
    if (cart.length === 0) setAmountReceived('');
  }, [cart.length]);

  const receivedNum = Number(amountReceived) || 0;
  const changeDue = receivedNum - total;

  const handlePrintClick = async () => {
    if (cart.length === 0 || printing) return;
    setPrintStatus(null);
    setPrinting(true);

    // Must be the first awaited call so it's still tied to this click —
    // navigator.usb.requestDevice() only works as a direct response to a
    // user gesture, and only prompts the browser's picker the first time.
    let printer = null;
    try {
      printer = await ensurePrinterConnected();
    } catch {
      // No printer paired/available — the sale still finalizes below.
    }

    const receiptData = { table: selectedTable, server: serverName, items: cart, subtotal, tax, total, amountReceived: receivedNum, changeDue };

    let orderInfo;
    try {
      orderInfo = await onFinalizeOrder();
    } catch {
      setPrintStatus({ ok: false, message: "Échec de l'enregistrement de la commande." });
      setPrinting(false);
      return;
    }

    if (!printer) {
      setPrintStatus({ ok: false, message: 'Vente enregistrée. Imprimante non connectée.' });
      setPrinting(false);
      return;
    }

    try {
      const bytes = buildReceiptBytes({ ...receiptData, createdAt: orderInfo?.createdAt });
      await sendBytes(printer, bytes);
      setPrintStatus({ ok: true, message: 'Ticket imprimé.' });
    } catch {
      setPrintStatus({ ok: false, message: "Vente enregistrée, mais l'impression a échoué." });
    }
    setPrinting(false);
  };

  return (
    <div
      className="order-ticket"
      style={{
        width: 360,
        flex: '0 0 auto',
        background: 'var(--color-surface)',
        borderLeft: '1px dashed var(--color-border-dashed)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-muted)',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {selectedTable}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Ticket de commande</div>

      <div style={{ flex: '1 1 140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 60 }}>
        {cart.length === 0 && (
          <div style={{ color: 'var(--color-muted-2)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
            Aucun article pour l'instant — touchez un article du menu pour l'ajouter.
          </div>
        )}
        {cart.map((ln) => (
          <div key={ln.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--color-accent)', minWidth: 20 }}>
              {ln.qty}×
            </div>
            <div style={{ fontSize: 13.5, flex: '0 1 auto' }}>{ln.name}</div>
            <div style={{ flex: 1, borderBottom: '1px dotted oklch(75% 0.015 60)', height: 1, transform: 'translateY(-3px)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600 }}>{money(ln.price * ln.qty)}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                onClick={() => onDec(ln.id)}
                style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid oklch(80% 0.015 60)', background: '#fff', fontSize: 12, lineHeight: 1, cursor: 'pointer' }}
              >
                −
              </button>
              <button
                onClick={() => onInc(ln.id)}
                style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid oklch(80% 0.015 60)', background: '#fff', fontSize: 12, lineHeight: 1, cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed var(--color-border-dashed)', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
          <span>Sous-total</span>
          <span>{money(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
          <span>Taxe</span>
          <span>{money(tax)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: 'var(--color-text)', marginTop: 4 }}>
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--color-muted)' }}>Montant reçu</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
            placeholder={money(total)}
            style={{
              width: 120,
              padding: '7px 10px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13.5,
              textAlign: 'right',
            }}
          />
        </div>
        {receivedNum > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              color: changeDue >= 0 ? 'var(--color-success-text)' : 'var(--color-accent)',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
              {changeDue >= 0 ? 'Monnaie à rendre' : 'Montant manquant'}
            </span>
            <span>{money(Math.abs(changeDue))}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
        <button
          onClick={handlePrintClick}
          disabled={cart.length === 0 || printing}
          style={{
            padding: 13,
            borderRadius: 7,
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: cart.length === 0 || printing ? 'not-allowed' : 'pointer',
            opacity: cart.length === 0 || printing ? 0.6 : 1,
          }}
        >
          {printing ? 'Impression…' : 'Imprimer'}
        </button>
        {printStatus && (
          <div
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: printStatus.ok ? 'var(--color-success-text)' : 'var(--color-accent)',
            }}
          >
            {printStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}
