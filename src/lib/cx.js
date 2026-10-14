/** Joins class names, skipping falsy values: cx('a', cond && 'b'). */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}
