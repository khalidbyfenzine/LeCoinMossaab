export function money(n) {
  return '$' + Number(n).toFixed(2);
}

export function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('');
}

export function timeLabel(dateLike) {
  return new Date(dateLike).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
