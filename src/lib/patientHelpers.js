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

export function calculateAOGData(lmp, visitDate) {
  if (!lmp || !visitDate) return { aog: '', trimester: '' };
  const start = new Date(lmp);
  const end = new Date(visitDate);
  if (end - start < 0) return { aog: 'Invalid', trimester: '' };
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  let trim = '1st Trimester';
  if (weeks > 13) trim = '2nd Trimester';
  if (weeks > 27) trim = '3rd Trimester';
  return { aog: `${weeks} weeks ${days} days`, trimester: trim };
}

/** Parse "Others: xxx" into { main: 'Others', specify: 'xxx' } */
export function parseOthers(val) {
  if (!val || typeof val !== 'string') return { main: '', specify: '' };
  if (val.startsWith('Others: ')) return { main: 'Others', specify: val.replace('Others: ', '') };
  return { main: val, specify: '' };
}
