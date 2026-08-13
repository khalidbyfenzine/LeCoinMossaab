export function money(n) {
  return Number(n).toFixed(2).replace('.', ',') + ' €';
}

export function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('');
}

export function timeLabel(dateLike) {
  return new Date(dateLike).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
