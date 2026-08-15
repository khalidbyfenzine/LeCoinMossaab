export function money(n) {
  return Number(n).toFixed(2).replace('.', ',') + ' MAD';
}

export function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('');
}
