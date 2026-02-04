/** Format ISO date string to MM/DD/YYYY */
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const [year, month, day] = isoString.split('-');
    return `${month}/${day}/${year}`;
  } catch (e) {
    return isoString;
  }
}
