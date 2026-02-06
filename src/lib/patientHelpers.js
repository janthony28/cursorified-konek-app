/** Parse date string (YYYY-MM-DD or ISO) to Date; returns null if invalid. */
function parseVisitDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Get the chronologically latest prenatal visit (by date). Handles unsorted arrays. */
export function getLatestPrenatalVisit(prenatalVisits) {
  if (!Array.isArray(prenatalVisits) || prenatalVisits.length === 0) return null;
  let latest = null;
  let latestTime = -1;
  for (const visit of prenatalVisits) {
    if (!visit || !visit.date) continue;
    const d = parseVisitDate(visit.date);
    if (!d) continue;
    const t = d.getTime();
    if (t > latestTime) {
      latestTime = t;
      latest = visit;
    }
  }
  return latest;
}

/** True if patient has no delivery and (no visits or last visit not in current month/year). */
export function isPatientDue(p, currentMonth, currentYear) {
  if (p.delivery_date || p.delivery_outcome) return false;
  const lastVisit = getLatestPrenatalVisit(p.prenatal_visits);
  if (!lastVisit || !lastVisit.date) return true;

  const lastVisitDate = parseVisitDate(lastVisit.date);
  if (!lastVisitDate) return true;

  if (lastVisitDate.getMonth() !== currentMonth || lastVisitDate.getFullYear() !== currentYear) {
    return true;
  }
  return false;
}

export function getAgeGroup(age) {
  if (!age) return '';
  if (age >= 1 && age <= 9) return '1-9 y.o';
  if (age >= 10 && age <= 14) return '10-14 y.o';
  if (age >= 15 && age <= 19) return '15-19 y.o';
  if (age >= 20 && age <= 49) return '20-49 y.o';
  return 'Out of range';
}

export function calculateEDC(lmpDate) {
  if (!lmpDate) return '';
  const date = new Date(lmpDate);
  date.setDate(date.getDate() + 280);
  return date.toISOString().split('T')[0];
}

/** Maximum AOG in weeks (post-term cap per standard practice). */
const MAX_AOG_WEEKS = 43;

export function calculateAOGData(lmp, visitDate) {
  if (!lmp || !visitDate) return { aog: '', trimester: '' };
  const start = new Date(lmp);
  const end = new Date(visitDate);
  if (end - start < 0) return { aog: 'Invalid', trimester: '' };
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  let weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  if (weeks > MAX_AOG_WEEKS) {
    weeks = MAX_AOG_WEEKS;
  }
  let trim = '1st Trimester';
  if (weeks > 13) trim = '2nd Trimester';
  if (weeks > 27) trim = '3rd Trimester';
  return { aog: `${weeks} weeks ${days} days`, trimester: trim };
}

/**
 * Gestational age in whole weeks at a given date (from LMP).
 * Used for FHSIS outcome rules: AB < 20w, PT 20–<37w, FT ≥ 37w.
 * @param {string} lmp - Last menstrual period (YYYY-MM-DD)
 * @param {string} date - Date of delivery/termination (YYYY-MM-DD)
 * @returns {number|null} Weeks, or null if invalid/missing
 */
export function getWeeksAOG(lmp, date) {
  if (!lmp || !date) return null;
  const start = new Date(lmp);
  const end = new Date(date);
  if (end - start < 0) return null;
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  return weeks > MAX_AOG_WEEKS ? MAX_AOG_WEEKS : weeks;
}

/**
 * Raw gestational age in whole weeks (no cap). Use for validation (e.g. reject visit date when > 43 weeks).
 * @returns {number|null} Weeks, or null if invalid/missing
 */
export function getRawWeeksAOG(lmp, date) {
  if (!lmp || !date) return null;
  const start = new Date(lmp);
  const end = new Date(date);
  if (end - start < 0) return null;
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

/** Parse "Others: xxx" into { main: 'Others', specify: 'xxx' } */
export function parseOthers(val) {
  if (!val || typeof val !== 'string') return { main: '', specify: '' };
  if (val.startsWith('Others: ')) return { main: 'Others', specify: val.replace('Others: ', '') };
  return { main: val, specify: '' };
}
