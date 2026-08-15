// Minimal ESC/POS command encoder for thermal receipt printers (tested
// conceptually against generic ESC/POS — the DURAPOS DPT201-URE-BK is
// ESC/POS compatible per its spec). Paper width is fixed at 80mm / 48
// characters per line at the default font; change CHARS_PER_LINE if a
// 58mm roll (~32 chars) is used instead.

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const CHARS_PER_LINE = 48;

const CMD = {
  INIT: [ESC, 0x40],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_ON: [GS, 0x21, 0x11],
  DOUBLE_OFF: [GS, 0x21, 0x00],
  // Code table 16 is WPC1252 on most Epson-compatible ESC/POS clones, which
  // covers French accented characters. If accents print as garbage on the
  // real printer, try code table 6 (PC858) instead: [ESC, 0x74, 0x06].
  CODEPAGE: [ESC, 0x74, 0x10],
  CUT_PARTIAL: [GS, 0x56, 0x01],
};

function feedCmd(n) {
  return [ESC, 0x64, n];
}

function textToBytes(str) {
  // ESC/POS text is single-byte per the selected code table, not UTF-8.
  // French accented characters (é, è, à, ç, œ, û…) map 1:1 onto
  // Windows-1252/Latin-1 code points below 0x100, so this direct mapping
  // works under CODEPAGE (WPC1252) above.
  const bytes = [];
  for (const ch of str) {
    const code = ch.codePointAt(0);
    bytes.push(code <= 0xff ? code : 0x3f);
  }
  return bytes;
}

function padLine(left = '', right = '', width = CHARS_PER_LINE) {
  if (left.length + right.length >= width) {
    left = left.slice(0, Math.max(0, width - right.length - 1));
  }
  const gap = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(gap) + right;
}

function divider(width = CHARS_PER_LINE) {
  return '-'.repeat(width);
}

class ReceiptBuilder {
  constructor() {
    this.bytes = [...CMD.INIT, ...CMD.CODEPAGE];
  }

  line(str = '') {
    this.bytes.push(...textToBytes(str), LF);
    return this;
  }

  align(side) {
    this.bytes.push(...(side === 'center' ? CMD.ALIGN_CENTER : CMD.ALIGN_LEFT));
    return this;
  }

  bold(on) {
    this.bytes.push(...(on ? CMD.BOLD_ON : CMD.BOLD_OFF));
    return this;
  }

  double(on) {
    this.bytes.push(...(on ? CMD.DOUBLE_ON : CMD.DOUBLE_OFF));
    return this;
  }

  feed(n = 1) {
    this.bytes.push(...feedCmd(n));
    return this;
  }

  cut() {
    this.bytes.push(...CMD.CUT_PARTIAL);
    return this;
  }

  toBytes() {
    return new Uint8Array(this.bytes);
  }
}

function money(n) {
  return Number(n).toFixed(2).replace('.', ',') + ' MAD';
}

export function buildReceiptBytes({
  shopName = 'Le Coin Mosaab',
  table,
  server,
  items,
  subtotal,
  tax,
  total,
  amountReceived,
  changeDue,
  createdAt,
}) {
  const r = new ReceiptBuilder();
  const dateLabel = new Date(createdAt ?? Date.now()).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  r.align('center');
  r.double(true).bold(true).line(shopName).bold(false).double(false);
  r.line('Ticket de caisse');
  r.line(dateLabel);
  r.align('left');
  r.line(divider());
  r.line(padLine(table ?? '', server ?? ''));
  r.line(divider());

  const groups = [];
  const groupIndexByCategory = {};
  for (const it of items) {
    const cat = it.category ?? '';
    if (!(cat in groupIndexByCategory)) {
      groupIndexByCategory[cat] = groups.length;
      groups.push({ category: cat, items: [] });
    }
    groups[groupIndexByCategory[cat]].items.push(it);
  }

  for (const group of groups) {
    if (group.category) {
      r.bold(true).line(group.category.toUpperCase()).bold(false);
    }
    for (const it of group.items) {
      r.line(padLine(`${it.qty}x ${it.name}`, money(it.price * it.qty)));
    }
  }

  r.line(divider());
  r.line(padLine('Sous-total', money(subtotal)));
  r.line(padLine('Taxe', money(tax)));
  r.bold(true).line(padLine('TOTAL', money(total))).bold(false);

  if (amountReceived > 0) {
    r.line(divider());
    r.line(padLine('Montant reçu', money(amountReceived)));
    r.line(padLine(changeDue >= 0 ? 'Monnaie rendue' : 'Montant manquant', money(Math.abs(changeDue))));
  }

  r.line(divider());
  r.align('center');
  r.line('Merci de votre visite !');
  r.feed(4);
  r.cut();

  return r.toBytes();
}
