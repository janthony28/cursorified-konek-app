/**
 * DOH-style report month filter: include a patient if any event (registration,
 * delivery, visit, Td dose, supplement, lab, PNC, etc.) occurred in the given month.
 * @param {string} dateStr - YYYY-MM-DD or ISO date string
 * @param {number} year - Full year (e.g. 2026)
 * @param {number} month - Month 1-12 (January = 1)
 * @returns {boolean}
 */
export function isDateInMonth(dateStr, year, month) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}

/**
 * Returns true if the patient had any reportable activity in the given month:
 * - Record created (created_at)
 * - Delivery (delivery_date)
 * - Any prenatal visit date
 * - Any PNC contact date
 * - Any Td dose date
 * - Deworming date
 * - Any supplement log date (IFA, MMS, Calcium)
 * - Any lab log date
 * - Any postpartum log date
 * - Vit A / postpartum IFA completed dates
 * - Date of registration (if stored)
 */
export function hasActivityInMonth(patient, year, month) {
  if (!patient) return false;

  if (isDateInMonth(patient.created_at, year, month)) return true;
  if (isDateInMonth(patient.delivery_date, year, month)) return true;
  if (isDateInMonth(patient.date_of_registration, year, month)) return true;

  const visits = patient.prenatal_visits || [];
  if (visits.some((v) => v && isDateInMonth(v.date, year, month))) return true;

  for (const field of ['pnc_date_1', 'pnc_date_2', 'pnc_date_3', 'pnc_date_4']) {
    if (isDateInMonth(patient[field], year, month)) return true;
  }
  for (const field of ['td1', 'td2', 'td3', 'td4', 'td5']) {
    if (isDateInMonth(patient[field], year, month)) return true;
  }
  if (isDateInMonth(patient.deworming_date, year, month)) return true;

  for (const list of [
    patient.supplements_ifa,
    patient.supplements_mms,
    patient.supplements_calcium,
  ]) {
    const arr = list || [];
    if (arr.some((item) => item && isDateInMonth(item.date, year, month))) return true;
  }

  const labLogs = patient.lab_logs || [];
  if (labLogs.some((log) => log && isDateInMonth(log.date, year, month))) return true;

  const postpartumLogs = patient.postpartum_logs || [];
  if (postpartumLogs.some((log) => log && isDateInMonth(log.date, year, month))) return true;

  if (isDateInMonth(patient.vit_a_completed_date, year, month)) return true;
  if (isDateInMonth(patient.postpartum_ifa_completed_date, year, month)) return true;

  return false;
}

/**
 * Filter patients to those with at least one event in the given report month (DOH-style).
 * @param {Array} patients - Full list of maternal records
 * @param {number} year - Report year (e.g. 2026)
 * @param {number} month - Report month 1-12
 * @returns {Array} Filtered patients
 */
export function filterPatientsByReportMonth(patients, year, month) {
  if (!Array.isArray(patients)) return [];
  if (year == null || month == null) return patients;
  return patients.filter((p) => hasActivityInMonth(p, year, month));
}
