/** Format date string (YYYY-MM-DD or ISO with time) to MM/DD/YYYY */
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const datePart = typeof isoString === 'string' ? isoString.split('T')[0] : String(isoString);
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return isoString;
    return `${month}/${day}/${year}`;
  } catch (e) {
    return isoString;
  }
}
