import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { parseOthers } from './patientHelpers';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Export maternal patients to FHSIS M1 format (aggregated indicators).
 * @param {Array} patients - List of maternal records (typically filtered by report month)
 * @param {{ reportYear?: number, reportMonth?: number, reportBarangay?: string }} options - Optional report period and barangay for header/filename
 */
export async function exportToExcel(patients, options = {}) {
  const { reportYear, reportMonth, reportBarangay } = options;
  const dateLabel =
    reportYear != null && reportMonth != null
      ? `${reportYear}-${String(reportMonth).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('FHSIS M1');

  const magentaFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD000D0' } };
  const navyFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000080' } };
  const headerGrayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
  const whiteFont = { color: { argb: 'FFFFFFFF' }, bold: true };
  const styles = {
    sectionHeader: { fill: magentaFill, font: { ...whiteFont, size: 11 }, alignment: { horizontal: 'center', vertical: 'middle' } },
    tableHeader: { fill: navyFill, font: whiteFont, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } },
    normalCell: { font: { size: 10 }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }, alignment: { vertical: 'middle', wrapText: true } },
    centeredCell: { font: { size: 10 }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }, alignment: { horizontal: 'center', vertical: 'middle' } },
    reportLabel: { font: { size: 10, bold: true }, fill: headerGrayFill, alignment: { vertical: 'middle' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } },
    reportValue: { font: { size: 10 }, alignment: { vertical: 'middle' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } },
  };

  const colCount = 21;
  sheet.columns = Array.from({ length: colCount }, () => ({ width: 10 }));
  sheet.getColumn(1).width = 50;
  sheet.getColumn(8).width = 50;
  sheet.getColumn(14).width = 50;

  const initCounts = () => ({ '10-14': 0, '15-19': 0, '20-49': 0, total: 0 });
  const data = {
    visits4: initCounts(), bmiNormal: initCounts(), bmiLow: initCounts(), bmiHigh: initCounts(),
    td2plusFirst: initCounts(), td2plusRepeat: initCounts(), iron: initCounts(), calcium: initCounts(),
    deworming: initCounts(), syphilis_screen: initCounts(), syphilis_positive: initCounts(),
    hepB_screen: initCounts(), hepB_positive: initCounts(), hiv_screen: initCounts(),
    anemia_screen: initCounts(), anemia_positive: initCounts(), gd_screen: initCounts(), gd_positive: initCounts(),
    deliveries: initCounts(), liveBirths: initCounts(),
    lb_normal: initCounts(), lb_low_m: initCounts(), lb_low_f: initCounts(), lb_unknown_m: initCounts(), lb_unknown_f: initCounts(),
    attendant_md: initCounts(), attendant_rn: initCounts(), attendant_mw: initCounts(),
    facility_public: initCounts(), facility_private: initCounts(), non_facility: initCounts(),
    del_vaginal: initCounts(), del_cs: initCounts(),
    outcome_ft: initCounts(), outcome_pt: initCounts(), outcome_fd: initCounts(), outcome_ab: initCounts(),
    pnc2: initCounts(), pnc4: initCounts(), postpartum_ifa: initCounts(), vit_a: initCounts(), hypertension: initCounts(),
    anc4_delivery: initCounts(), anc1st_tri: initCounts(), first_birth: initCounts(), grand_multigravida: initCounts(),
  };

  function getLab(p) {
    const logs = p.lab_logs || [];
    return {
      syphilis_screened: !!logs.find((l) => l.type === 'Syphilis') || !!p.lab_syphilis_result,
      syphilis_positive: (logs.find((l) => l.type === 'Syphilis')?.result === 'Positive') || (p.lab_syphilis_result === 'Reactive'),
      hepb_screened: !!logs.find((l) => l.type === 'Hep B') || !!p.lab_hepb_result,
      hepb_positive: (logs.find((l) => l.type === 'Hep B')?.result === 'Positive') || (p.lab_hepb_result === 'Reactive'),
      hiv_screened: !!logs.find((l) => l.type === 'HIV') || !!p.lab_hiv_result,
      cbc_screened: !!logs.find((l) => l.type === 'CBC') || !!p.lab_cbc_result,
      cbc_positive: (logs.find((l) => l.type === 'CBC')?.result === 'With Anemia') || (p.lab_cbc_result === 'With Anemia'),
      gd_screened: !!logs.find((l) => l.type === 'Gestational Diabetes') || !!p.lab_diabetes_result,
      gd_positive: (logs.find((l) => l.type === 'Gestational Diabetes')?.result === 'Positive') || (p.lab_diabetes_result === 'Positive'),
    };
  }

  patients.forEach((p) => {
    try {
      const age = parseInt(p.age || 0, 10);
      let g = '';
      if (age >= 10 && age <= 14) g = '10-14';
      else if (age >= 15 && age <= 19) g = '15-19';
      else if (age >= 20 && age <= 49) g = '20-49';
      if (!g) return;

      const inc = (key) => { if (data[key]) { data[key][g]++; data[key].total++; } };

      if ((p.prenatal_visits || []).length >= 4) inc('visits4');
      const visits = p.prenatal_visits || [];
      const firstTri = [...visits].reverse().find((v) => v.trimester === '1st Trimester');
      if (firstTri) {
        if (firstTri.bmi_category === 'NORMAL') inc('bmiNormal');
        if (firstTri.bmi_category === 'LOW') inc('bmiLow');
        if (firstTri.bmi_category === 'HIGH') inc('bmiHigh');
      }

      const gravida = parseInt(p.gravida || 0, 10);
      const hasTd2 = !!p.td2;
      const hasTd3Plus = !!(p.td3 || p.td4 || p.td5);
      if (gravida === 1 && hasTd2) inc('td2plusFirst');
      if (gravida >= 2 && hasTd3Plus) inc('td2plusRepeat');

      const totalIFA = (p.supplements_ifa || []).reduce((s, i) => s + (Number(i.count) || 0), 0);
      if (totalIFA >= 180) inc('iron');
      // Calcium carbonate supplementation completion is explicitly stored as a boolean (high-risk only).
      if (p.is_high_risk && (p.calcium_carbonate_completed === true || p.calcium_carbonate_completed === 'true' || p.calcium_carbonate_completed === 'Yes')) {
        inc('calcium');
      }

      if (p.is_deworming_given) inc('deworming');
      const lab = getLab(p);
      if (lab.syphilis_screened) inc('syphilis_screen');
      if (lab.syphilis_positive) inc('syphilis_positive');
      if (lab.hepb_screened) inc('hepB_screen');
      if (lab.hepb_positive) inc('hepB_positive');
      if (lab.hiv_screened) inc('hiv_screen');
      if (lab.cbc_screened) inc('anemia_screen');
      if (lab.cbc_positive) inc('anemia_positive');
      if (lab.gd_screened) inc('gd_screen');
      if (lab.gd_positive) inc('gd_positive');

      if (p.delivery_date) {
        inc('deliveries');
        const isLiveBirth = ['FT', 'PT'].includes(p.delivery_outcome);
        const babies = isLiveBirth && Array.isArray(p.baby_details) && p.baby_details.length > 0
          ? p.baby_details
          : isLiveBirth ? [{ category: p.birth_weight_category || '', sex: p.birth_sex || '' }] : [];
        for (let i = 0; i < babies.length; i++) inc('liveBirths');
        babies.forEach((b) => {
          const cat = (b.category === 'Normal' || b.category === 'Low') ? b.category : 'Unknown';
          const sex = b.sex === 'Male' ? 'Male' : (b.sex === 'Female' ? 'Female' : null);
          if (cat === 'Normal') inc('lb_normal');
          if (cat === 'Low' && sex === 'Male') inc('lb_low_m');
          if (cat === 'Low' && sex === 'Female') inc('lb_low_f');
          if (cat === 'Unknown' && sex === 'Male') inc('lb_unknown_m');
          if (cat === 'Unknown' && sex === 'Female') inc('lb_unknown_f');
        });
        if (p.delivery_attendant === 'MD') inc('attendant_md');
        if (p.delivery_attendant === 'RN') inc('attendant_rn');
        if (p.delivery_attendant === 'MW') inc('attendant_mw');
        if (p.delivery_facility_type === 'Public') inc('facility_public');
        if (p.delivery_facility_type === 'Private') inc('facility_private');
        if (p.delivery_place === 'Others') inc('non_facility');
        if (p.delivery_mode === 'VD') inc('del_vaginal');
        if (p.delivery_mode === 'CS') inc('del_cs');
        if (p.delivery_outcome === 'FT') inc('outcome_ft');
        if (p.delivery_outcome === 'PT') inc('outcome_pt');
        if (p.delivery_outcome === 'FD') inc('outcome_fd');
        if (p.delivery_outcome === 'AB') inc('outcome_ab');
        if ((p.prenatal_visits || []).length >= 4) inc('anc4_delivery');
        const has1stTriVisit = (p.prenatal_visits || []).some((v) => v.trimester === '1st Trimester');
        if (has1stTriVisit) inc('anc1st_tri');
        if (gravida === 1) inc('first_birth');
        if (gravida >= 5) inc('grand_multigravida');
      }

      const pncDates = [p.pnc_date_1, p.pnc_date_2, p.pnc_date_3, p.pnc_date_4].filter(Boolean).length;
      if (pncDates >= 2) inc('pnc2');
      if (pncDates >= 4 || p.is_4pnc_completed === 'Yes' || p.is_4pnc_completed === 'true' || p.is_4pnc_completed === true) inc('pnc4');
      if ((p.postpartum_ifa_count || 0) >= 90 || p.is_postpartum_ifa_completed === 'Yes' || p.is_postpartum_ifa_completed === 'true' || p.is_postpartum_ifa_completed === true) inc('postpartum_ifa');
      if (p.vit_a_completed_date || p.is_vit_a_completed === 'Yes' || p.is_vit_a_completed === 'true' || p.is_vit_a_completed === true) inc('vit_a');
      if (p.has_hypertension) inc('hypertension');
    } catch (err) {
      console.error('Error processing patient for FHSIS:', p, err);
    }
  });

  const num = (key, g) => {
    const d = data[key];
    if (!d) return '';
    const v = g ? d[g] : d.total;
    return v !== undefined && v !== null ? v : '';
  };

  let r = 1;

  // Report header: Month, City, Barangay
  const monthLabel =
    reportYear != null && reportMonth >= 1 && reportMonth <= 12
      ? `${MONTH_NAMES[reportMonth - 1]} ${reportYear}`
      : new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  const cityLabel = 'Batangas City';
  const barangayLabel = reportBarangay && String(reportBarangay).trim() ? reportBarangay : 'All';

  sheet.getCell(r, 1).value = 'Month';
  sheet.getCell(r, 2).value = monthLabel;
  sheet.getCell(r, 1).style = styles.reportLabel;
  sheet.getCell(r, 2).style = styles.reportValue;
  r++;
  sheet.getCell(r, 1).value = 'City';
  sheet.getCell(r, 2).value = cityLabel;
  sheet.getCell(r, 1).style = styles.reportLabel;
  sheet.getCell(r, 2).style = styles.reportValue;
  r++;
  sheet.getCell(r, 1).value = 'Barangay';
  sheet.getCell(r, 2).value = barangayLabel;
  sheet.getCell(r, 1).style = styles.reportLabel;
  sheet.getCell(r, 2).style = styles.reportValue;
  r++;
  r++;

  const setHeader = (row, startCol, label) => {
    const c = sheet.getRow(row).getCell(startCol);
    c.value = label;
    c.fill = styles.tableHeader.fill;
    c.font = styles.tableHeader.font;
    c.alignment = styles.tableHeader.alignment;
  };
  const setData = (row, startCol, k) => {
    [0, 1, 2, 3].forEach((i, idx) => {
      const col = startCol + idx;
      const cell = sheet.getRow(row).getCell(col);
      cell.value = num(k, ['10-14', '15-19', '20-49', 'total'][i]);
      cell.style = styles.centeredCell;
    });
  };

  sheet.mergeCells(r, 1, r, colCount);
  sheet.getCell(r, 1).value = 'Indicators'; sheet.getCell(r, 1).fill = styles.tableHeader.fill; sheet.getCell(r, 1).font = styles.tableHeader.font;
  r++;
  sheet.getCell(r, 1).value = 'Indicators'; sheet.getCell(r, 1).fill = styles.tableHeader.fill; sheet.getCell(r, 1).font = styles.tableHeader.font;
  sheet.getCell(r, 2).value = 'Age Group'; sheet.getCell(r, 2).fill = styles.tableHeader.fill; sheet.getCell(r, 2).font = styles.tableHeader.font;
  sheet.getCell(r, 3).value = ''; sheet.getCell(r, 3).fill = styles.tableHeader.fill;
  sheet.getCell(r, 4).value = ''; sheet.getCell(r, 4).fill = styles.tableHeader.fill;
  sheet.getCell(r, 5).value = 'Total'; sheet.getCell(r, 5).fill = styles.tableHeader.fill; sheet.getCell(r, 5).font = styles.tableHeader.font;
  sheet.getCell(r, 6).value = 'Remarks'; sheet.getCell(r, 6).fill = styles.tableHeader.fill; sheet.getCell(r, 6).font = styles.tableHeader.font;
  sheet.getCell(r, 7).value = ''; sheet.getCell(r, 7).fill = styles.tableHeader.fill;
  sheet.getCell(r, 8).value = 'Indicators'; sheet.getCell(r, 8).fill = styles.tableHeader.fill; sheet.getCell(r, 8).font = styles.tableHeader.font;
  sheet.getCell(r, 9).value = 'Age Group'; sheet.getCell(r, 9).fill = styles.tableHeader.fill; sheet.getCell(r, 9).font = styles.tableHeader.font;
  sheet.getCell(r, 10).value = ''; sheet.getCell(r, 10).fill = styles.tableHeader.fill;
  sheet.getCell(r, 11).value = ''; sheet.getCell(r, 11).fill = styles.tableHeader.fill;
  sheet.getCell(r, 12).value = 'Total'; sheet.getCell(r, 12).fill = styles.tableHeader.fill; sheet.getCell(r, 12).font = styles.tableHeader.font;
  sheet.getCell(r, 13).value = 'Remarks'; sheet.getCell(r, 13).fill = styles.tableHeader.fill; sheet.getCell(r, 13).font = styles.tableHeader.font;
  sheet.getCell(r, 14).value = 'Indicators'; sheet.getCell(r, 14).fill = styles.tableHeader.fill; sheet.getCell(r, 14).font = styles.tableHeader.font;
  sheet.getCell(r, 15).value = 'Age Group'; sheet.getCell(r, 15).fill = styles.tableHeader.fill; sheet.getCell(r, 15).font = styles.tableHeader.font;
  sheet.getCell(r, 16).value = ''; sheet.getCell(r, 16).fill = styles.tableHeader.fill;
  sheet.getCell(r, 17).value = ''; sheet.getCell(r, 17).fill = styles.tableHeader.fill;
  sheet.getCell(r, 18).value = 'Total'; sheet.getCell(r, 18).fill = styles.tableHeader.fill; sheet.getCell(r, 18).font = styles.tableHeader.font;
  sheet.getCell(r, 19).value = 'Remarks'; sheet.getCell(r, 19).fill = styles.tableHeader.fill; sheet.getCell(r, 19).font = styles.tableHeader.font;
  r++;
  sheet.getCell(r, 1).value = ''; sheet.getCell(r, 1).fill = styles.tableHeader.fill;
  [2, 3, 4].forEach((c, i) => { sheet.getCell(r, c).value = ['10-14', '15-19', '20-49'][i]; sheet.getCell(r, c).fill = styles.tableHeader.fill; sheet.getCell(r, c).font = styles.tableHeader.font; });
  sheet.getCell(r, 5).value = 'Total'; sheet.getCell(r, 5).fill = styles.tableHeader.fill; sheet.getCell(r, 5).font = styles.tableHeader.font;
  sheet.getCell(r, 6).value = ''; sheet.getCell(r, 6).fill = styles.tableHeader.fill;
  sheet.getCell(r, 7).value = ''; sheet.getCell(r, 7).fill = styles.tableHeader.fill;
  sheet.getCell(r, 8).value = ''; sheet.getCell(r, 8).fill = styles.tableHeader.fill;
  [9, 10, 11].forEach((c, i) => { sheet.getCell(r, c).value = ['10-14', '15-19', '20-49'][i]; sheet.getCell(r, c).fill = styles.tableHeader.fill; sheet.getCell(r, c).font = styles.tableHeader.font; });
  sheet.getCell(r, 12).value = 'Total'; sheet.getCell(r, 12).fill = styles.tableHeader.fill; sheet.getCell(r, 12).font = styles.tableHeader.font;
  sheet.getCell(r, 13).value = ''; sheet.getCell(r, 13).fill = styles.tableHeader.fill;
  sheet.getCell(r, 14).value = ''; sheet.getCell(r, 14).fill = styles.tableHeader.fill;
  [15, 16, 17].forEach((c, i) => { sheet.getCell(r, c).value = ['10-14', '15-19', '20-49'][i]; sheet.getCell(r, c).fill = styles.tableHeader.fill; sheet.getCell(r, c).font = styles.tableHeader.font; });
  sheet.getCell(r, 18).value = 'Total'; sheet.getCell(r, 18).fill = styles.tableHeader.fill; sheet.getCell(r, 18).font = styles.tableHeader.font;
  sheet.getCell(r, 19).value = ''; sheet.getCell(r, 19).fill = styles.tableHeader.fill;
  r++;

  const section = (title) => {
    sheet.mergeCells(r, 1, r, colCount);
    sheet.getCell(r, 1).value = title;
    sheet.getCell(r, 1).fill = styles.sectionHeader.fill;
    sheet.getCell(r, 1).font = styles.sectionHeader.font;
    sheet.getCell(r, 1).alignment = styles.sectionHeader.alignment;
    r++;
  };

  const row3 = (l1, k1, l2, k2, l3, k3) => {
    const row = sheet.getRow(r);
    row.getCell(1).value = l1; row.getCell(1).style = styles.normalCell;
    if (k1) setData(r, 2, k1); else [2, 3, 4, 5].forEach((c) => { row.getCell(c).value = ''; row.getCell(c).style = styles.centeredCell; });
    row.getCell(6).value = ''; row.getCell(6).style = styles.normalCell;
    row.getCell(7).value = '';
    row.getCell(8).value = l2 || ''; row.getCell(8).style = styles.normalCell;
    if (k2) setData(r, 9, k2); else [9, 10, 11, 12].forEach((c) => { row.getCell(c).value = ''; row.getCell(c).style = styles.centeredCell; });
    row.getCell(13).value = ''; row.getCell(13).style = styles.normalCell;
    row.getCell(14).value = l3 || ''; row.getCell(14).style = styles.normalCell;
    if (k3) setData(r, 15, k3); else [15, 16, 17, 18].forEach((c) => { row.getCell(c).value = ''; row.getCell(c).style = styles.centeredCell; });
    row.getCell(19).value = ''; row.getCell(19).style = styles.normalCell;
    r++;
  };

  const row1 = (label, c2, c3, c4, c5) => {
    const row = sheet.getRow(r);
    row.getCell(1).value = label; row.getCell(1).style = styles.normalCell;
    [2, 3, 4, 5].forEach((c, i) => { row.getCell(c).value = [c2, c3, c4, c5][i] ?? ''; row.getCell(c).style = styles.centeredCell; });
    row.getCell(6).value = ''; row.getCell(6).style = styles.normalCell;
    row.getCell(7).value = '';
    row.getCell(8).value = ''; row.getCell(8).style = styles.normalCell;
    [9, 10, 11, 12].forEach((c) => { row.getCell(c).value = ''; row.getCell(c).style = styles.centeredCell; });
    row.getCell(13).value = ''; row.getCell(13).style = styles.normalCell;
    row.getCell(14).value = ''; row.getCell(14).style = styles.normalCell;
    [15, 16, 17, 18].forEach((c) => { row.getCell(c).value = ''; row.getCell(c).style = styles.centeredCell; });
    row.getCell(19).value = ''; row.getCell(19).style = styles.normalCell;
    r++;
  };

  section('Prenatal Care');

  row3('1. Pregnant women with at least 4 pre-natal check-ups', 'visits4', '4. Pregnant women for the 2nd or more times given at least 3 doses of Td vaccination (Td2 Plus)', 'td2plusRepeat', '10. Pregnant women tested positive for syphilis', 'syphilis_positive');
  row3('2. No. of pregnant women assessed of their nutritional status during the 1st trimester', null, '5. Pregnant women who completed the dose of iron with folic acid supplementation', 'iron', '11. Pregnant women screened for Hepatitis B', 'hepB_screen');
  row3('   a. Pregnant women seen in the 1st trimester who have normal BMI', 'bmiNormal', '6. Pregnant women who completed doses of calcium carbonate supplementation', 'calcium', '12. Pregnant women tested positive for Hepatitis B', 'hepB_positive');
  row3('   b. Pregnant women seen in the 1st trimester who have low BMI', 'bmiLow', '', null, '13. Pregnant women screened for HIV', 'hiv_screen');
  row3('   c. Pregnant women seen in the 1st trimester who have high BMI', 'bmiHigh', '7. Pregnant women given one dose of deworming tablet', 'deworming', '14. Pregnant women tested for CBC (Hgb and Hct count)', 'anemia_screen');
  row3('3. Pregnant women for the first time given at least 2 doses of Td vaccination', 'td2plusFirst', '8. Pregnant women screened for syphilis', 'syphilis_screen', '15. Pregnant women tested for CBC (Hgb and Hct) diagnosed with anemia', 'anemia_positive');
  row3('', null, '', null, '16. Pregnant women screened for gestational diabetes', 'gd_screen');
  row3('', null, '', null, '17. Pregnant women tested positive for gestational diabetes', 'gd_positive');

  section('Intrapartum Care and Delivery Outcome');

  // Helper to fill empty right-side columns (14-19) with consistent styling
  const fillRight = (rw) => {
    rw.getCell(14).value = ''; rw.getCell(14).style = styles.normalCell;
    [15, 16, 17, 18].forEach((c) => { rw.getCell(c).value = ''; rw.getCell(c).style = styles.centeredCell; });
    rw.getCell(19).value = ''; rw.getCell(19).style = styles.normalCell;
  };
  // Helper to set middle column label + data on a row
  const setMiddle = (rw, rowNum, label, key) => {
    rw.getCell(7).value = '';
    rw.getCell(8).value = label || ''; rw.getCell(8).style = styles.normalCell;
    if (key) { setData(rowNum, 9, key); } else { [9, 10, 11, 12].forEach((c) => { rw.getCell(c).value = ''; rw.getCell(c).style = styles.centeredCell; }); }
    rw.getCell(13).value = ''; rw.getCell(13).style = styles.normalCell;
  };

  row3('18. Number of deliveries', 'deliveries', '21. Number of health facility-based deliveries', null, '', null);
  row3('19. Number of live births', 'liveBirths', '   a. Number of deliveries in public health facility', 'facility_public', '', null);
  // 19a. Normal birth weight + 21b. Private facility
  {
    const rw = sheet.getRow(r);
    rw.getCell(1).value = '   a. Number of live births with normal birth weight'; rw.getCell(1).style = styles.normalCell;
    setData(r, 2, 'lb_normal');
    rw.getCell(6).value = ''; rw.getCell(6).style = styles.normalCell;
    setMiddle(rw, r, '   b. Number of deliveries in private health facility', 'facility_private');
    fillRight(rw);
    r++;
  }
  // 19b. Low birth weight header (Male / Female) + 22. Non-facility
  {
    const rw = sheet.getRow(r);
    rw.getCell(1).value = '   b. Number of live births with low birth weight'; rw.getCell(1).style = styles.normalCell;
    sheet.mergeCells(r, 2, r, 3); rw.getCell(2).value = 'Male'; rw.getCell(2).style = styles.centeredCell;
    sheet.mergeCells(r, 4, r, 5); rw.getCell(4).value = 'Female'; rw.getCell(4).style = styles.centeredCell;
    rw.getCell(6).value = ''; rw.getCell(6).style = styles.normalCell;
    setMiddle(rw, r, '22. Number of non-facility-based deliveries', 'non_facility');
    fillRight(rw);
    r++;
  }
  // 19b. Low birth weight data + 23. Type of Delivery header
  {
    const rw = sheet.getRow(r);
    rw.getCell(1).value = ''; rw.getCell(1).style = styles.normalCell;
    rw.getCell(2).value = data.lb_low_m?.total ?? 0; rw.getCell(2).style = styles.centeredCell;
    rw.getCell(3).value = data.lb_low_f?.total ?? 0; rw.getCell(3).style = styles.centeredCell;
    rw.getCell(4).value = (data.lb_low_m?.total ?? 0) + (data.lb_low_f?.total ?? 0); rw.getCell(4).style = styles.centeredCell;
    rw.getCell(5).value = ''; rw.getCell(5).style = styles.centeredCell;
    rw.getCell(6).value = ''; rw.getCell(6).style = styles.normalCell;
    setMiddle(rw, r, '23. Type of Delivery', null);
    fillRight(rw);
    r++;
  }
  // 19c. Unknown birth weight header (Male / Female) + 23a. Vaginal
  {
    const rw = sheet.getRow(r);
    rw.getCell(1).value = '   c. Number of live births with unknown birth weight'; rw.getCell(1).style = styles.normalCell;
    sheet.mergeCells(r, 2, r, 3); rw.getCell(2).value = 'Male'; rw.getCell(2).style = styles.centeredCell;
    sheet.mergeCells(r, 4, r, 5); rw.getCell(4).value = 'Female'; rw.getCell(4).style = styles.centeredCell;
    rw.getCell(6).value = ''; rw.getCell(6).style = styles.normalCell;
    setMiddle(rw, r, '   a. Number of vaginal deliveries', 'del_vaginal');
    fillRight(rw);
    r++;
  }
  // 19c. Unknown birth weight data + 23b. Cesarean
  {
    const rw = sheet.getRow(r);
    rw.getCell(1).value = ''; rw.getCell(1).style = styles.normalCell;
    rw.getCell(2).value = data.lb_unknown_m?.total ?? 0; rw.getCell(2).style = styles.centeredCell;
    rw.getCell(3).value = data.lb_unknown_f?.total ?? 0; rw.getCell(3).style = styles.centeredCell;
    rw.getCell(4).value = (data.lb_unknown_m?.total ?? 0) + (data.lb_unknown_f?.total ?? 0); rw.getCell(4).style = styles.centeredCell;
    rw.getCell(5).value = ''; rw.getCell(5).style = styles.centeredCell;
    rw.getCell(6).value = ''; rw.getCell(6).style = styles.normalCell;
    setMiddle(rw, r, '   b. Number of deliveries by cesarean section', 'del_cs');
    fillRight(rw);
    r++;
  }
  row3('20. Number of deliveries attended by skilled health professionals', null, '24. Pregnancy Outcome', null, '', null);
  row3('   a. Number of deliveries attended by a doctor', 'attendant_md', '   a. Number of full-term births', 'outcome_ft', '', null);
  row3('   b. Number of deliveries attended by a nurse', 'attendant_rn', '   b. Number of pre-term births', 'outcome_pt', '', null);
  row3('   c. Number of deliveries attended by midwives', 'attendant_mw', '   c. Number of fetal deaths', 'outcome_fd', '', null);
  row3('', null, '   d. Number of abortion/miscarriage', 'outcome_ab', '', null);

  section('Postpartum and Newborn Care');

  row3('25. Number of postpartum women together with their newborn who completed at least 2 postpartum check-ups', 'pnc2', '', null, '', null);
  row3('26. Number of postpartum women who completed iron with folic acid supplementation', 'postpartum_ifa', '', null, '', null);
  row3('27. Number of postpartum women with Vitamin A supplementation', 'vit_a', '', null, '', null);
  row3('28. No. of pregnant women who are diagnosed with hypertension', 'hypertension', '', null, '', null);
  row3('29a. No. of deliveries with 4 ANC', 'anc4_delivery', '', null, '', null);
  row3('29b. No. of deliveries with 1 ANC during 1st trimester', 'anc1st_tri', '', null, '', null);
  row3('30. No. of women who gave birth for the 1st time', 'first_birth', '', null, '', null);
  row3('31. No. of women who gave birth who are Grand Multigravida (G5 and above)', 'grand_multigravida', '', null, '', null);

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `FHSIS_Maternal_Report_${dateLabel}.xlsx`);
}

/**
 * Export Maternal Target Client List (TCL) using the HTML layout in `TCL/Maternal.html`.
 *
 * This function:
 * - Downloads the existing HTML template as-is so the spacing, alignment and grid lines
 *   match the Google Sheets design exactly.
 * - Saves it with an Excel-friendly MIME type and `.xls` extension so it opens
 *   directly in Excel/LibreOffice as a spreadsheet.
 * - Currently focuses on reproducing the layout; the `patients` parameter is reserved
 *   for future enhancements where you may want to inject patient-level data into
 *   specific cells.
 *
 * @param {Array} patients - List of maternal records (currently unused, kept for future binding)
 * @param {{ reportYear?: number, reportMonth?: number }} options
 */
export async function exportMaternalTcl(patients, options = {}) {
  const { reportYear, reportMonth } = options;
  const dateLabel =
    reportYear != null && reportMonth != null
      ? `${reportYear}-${String(reportMonth).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Maternal TCL');

  // Headers include legend in the same cell (wrap); header row height increased to fit.
  sheet.columns = [
    { header: 'No.', key: 'no', width: 6 },
    { header: 'Date of Registration (mm/dd/yy)', key: 'dateReg', width: 18 },
    { header: 'Full Name (Last Name, First Name, MI)', key: 'fullName', width: 30 },
    { header: 'Complete Address', key: 'address', width: 30 },
    { header: 'Age (years)', key: 'age', width: 9 },
    { header: 'Age Group\nA=10-14, B=15-19, C=20-49 y.o.', key: 'ageGroup', width: 14 },
    { header: 'LMP (mm/dd/yy)', key: 'lmp', width: 14 },
    { header: 'Gravida', key: 'gravida', width: 8 },
    { header: 'Parity', key: 'parity', width: 8 },
    { header: 'EDD (mm/dd/yy)', key: 'edd', width: 14 },
    { header: 'ANC Visit 1 Date', key: 'anc1', width: 15 },
    { header: 'ANC Visit 2 Date', key: 'anc2', width: 15 },
    { header: 'ANC Visit 3 Date', key: 'anc3', width: 15 },
    { header: 'ANC Visit 4 Date', key: 'anc4', width: 15 },
    { header: 'ANC Visit 5 Date', key: 'anc5', width: 15 },
    { header: 'ANC Visit 6 Date', key: 'anc6', width: 15 },
    { header: 'ANC Visit 7 Date', key: 'anc7', width: 15 },
    { header: 'ANC Visit 8 Date', key: 'anc8', width: 15 },
    { header: 'BMI (1st Trimester)', key: 'bmi1', width: 14 },
    { header: 'BMI Category (1st tri)\nLow <18.5, Normal 18.5-22.9, High ≥23', key: 'bmiCat1', width: 18 },
    { header: 'Td1 Date', key: 'td1', width: 12 },
    { header: 'Td2 Date', key: 'td2', width: 12 },
    { header: 'Td3 Date', key: 'td3', width: 12 },
    { header: 'Td4 Date', key: 'td4', width: 12 },
    { header: 'Td5 Date', key: 'td5', width: 12 },
    { header: 'Deworming Given?\n1=Yes, 0=No', key: 'dewormingGiven', width: 14 },
    { header: 'Deworming Date', key: 'dewormingDate', width: 14 },
    { header: 'Syphilis Screen Date', key: 'syphilisDate', width: 16 },
    { header: 'Syphilis Result\n1=pos, 0=neg', key: 'syphilisResult', width: 14 },
    { header: 'HIV Screen Date', key: 'hivDate', width: 16 },
    { header: 'HIV Result\n1=reactive, 0=neg', key: 'hivResult', width: 16 },
    { header: 'Hep B Screen Date', key: 'hepbDate', width: 16 },
    { header: 'Hep B Result\n1=reactive, 0=neg', key: 'hepbResult', width: 16 },
    { header: 'CBC Date', key: 'cbcDate', width: 16 },
    { header: 'CBC Result\n1=with anemia, 0=w/o', key: 'cbcResult', width: 18 },
    { header: 'GDM Screen Date', key: 'gdmDate', width: 16 },
    { header: 'GDM Result\n1=pos, 0=neg', key: 'gdmResult', width: 14 },
    { header: 'Date Terminated (mm/dd/yy)', key: 'deliveryDate', width: 18 },
    { header: 'Outcome\nFT=Full term, PT=Pre-term, FD=Fetal death, AB=Abortion', key: 'deliveryOutcome', width: 22 },
    { header: 'Delivery Type\nCS=Cesarean, VD=Vaginal, CVCD=Combined', key: 'deliveryMode', width: 20 },
    { header: 'Birth Weight (grams, Baby 1)', key: 'birthWeight', width: 20 },
    { header: 'Birth Weight Category\nA=Normal, B=Low, C=Unknown', key: 'birthWeightCat', width: 20 },
    { header: 'Sex of Baby 1 (M/F)', key: 'birthSex', width: 14 },
    { header: 'Place of Delivery (health facility)', key: 'deliveryPlace', width: 26 },
    { header: 'Facility Type (Public/Private)', key: 'facilityType', width: 20 },
    { header: 'BEmONC/CEmONC Capable? (Yes/No)', key: 'facilityCapable', width: 24 },
    { header: 'Non-Health Facility (Home/Others)', key: 'nonHealthFacility', width: 26 },
    { header: 'Non-Health Facility Place (specify)', key: 'nonHealthPlace', width: 26 },
    { header: 'Birth Attendant (MD/RN/MW/Others)', key: 'attendant', width: 26 },
    { header: 'Birth Attendant (specify, if Others)', key: 'attendantSpecify', width: 26 },
    { header: 'Time of Delivery', key: 'deliveryTime', width: 16 },
    { header: 'PNC Contact 1 Date', key: 'pnc1', width: 16 },
    { header: 'PNC Contact 2 Date', key: 'pnc2', width: 16 },
    { header: 'PNC Contact 3 Date', key: 'pnc3', width: 16 },
    { header: 'PNC Contact 4 Date', key: 'pnc4', width: 16 },
    { header: 'Completed 4PNC?\n1=Yes, 0=No', key: 'pncCompleted', width: 14 },
    { header: 'Postpartum IFA Total Tabs', key: 'ppIfaCount', width: 20 },
    { header: 'Postpartum IFA Completed Date', key: 'ppIfaDate', width: 22 },
    { header: 'Vitamin A Completed Date', key: 'vitADate', width: 20 },
  ];

  const getAgeGroup = (age) => {
    if (age >= 10 && age <= 14) return 'A';
    if (age >= 15 && age <= 19) return 'B';
    if (age >= 20 && age <= 49) return 'C';
    return '';
  };

  const getLabEntry = (logs, type) => {
    if (!Array.isArray(logs)) return null;
    return logs.find((l) => l && l.type === type) || null;
  };

  (patients || []).forEach((p, idx) => {
    const ageNum = Number(p.age || 0);

    const fullName = [p.last_name, p.first_name, p.middle_name || p.middle_initial]
      .filter(Boolean)
      .join(', ');
    const addressParts = [p.address, p.sitio, p.barangay, p.city_municipality, p.province]
      .filter(Boolean);
    const address = addressParts.join(', ');

    const visits = Array.isArray(p.prenatal_visits) ? [...p.prenatal_visits] : [];
    visits.sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')));
    const visitDates = visits.map((v) => v?.date || '');
    const firstTrimesterVisits = visits.filter((v) => v?.trimester === '1st Trimester');
    const firstTrimesterVisit = firstTrimesterVisits.length
      ? firstTrimesterVisits[firstTrimesterVisits.length - 1]
      : {};

    const labLogs = p.lab_logs || [];
    const syphilis = getLabEntry(labLogs, 'Syphilis');
    const hiv = getLabEntry(labLogs, 'HIV');
    const hepb = getLabEntry(labLogs, 'Hep B');
    const cbc = getLabEntry(labLogs, 'CBC');
    const gdm = getLabEntry(labLogs, 'Gestational Diabetes');

    const isSyphilisPos = syphilis?.result === 'Positive' || p.lab_syphilis_result === 'Reactive';
    const isHivPos = hiv?.result === 'Positive' || p.lab_hiv_result === 'Reactive';
    const isHepbPos = hepb?.result === 'Positive' || p.lab_hepb_result === 'Reactive';
    const isCbcAnemia = cbc?.result === 'With Anemia' || p.lab_cbc_result === 'With Anemia';
    const isGdmPos = gdm?.result === 'Positive' || p.lab_diabetes_result === 'Positive';

    const is4PncCompleted =
      p.is_4pnc_completed === 'Yes' ||
      p.is_4pnc_completed === true ||
      p.is_4pnc_completed === 'true';

    const babyDetails = Array.isArray(p.baby_details) && p.baby_details.length > 0
      ? p.baby_details
      : [];
    const firstBaby = babyDetails[0] || {};

    sheet.addRow({
      no: idx + 1,
      dateReg: p.date_of_registration || p.date_registered || '',
      fullName,
      address,
      age: Number.isNaN(ageNum) ? '' : ageNum,
      ageGroup: getAgeGroup(ageNum),
      lmp: p.lmp || '',
      gravida: p.gravida || '',
      parity: (p.parity === 0 || p.parity === '0') ? 0 : (p.parity ?? ''),
      edd: p.edc || p.edd || '',
      anc1: visitDates[0] || '',
      anc2: visitDates[1] || '',
      anc3: visitDates[2] || '',
      anc4: visitDates[3] || '',
      anc5: visitDates[4] || '',
      anc6: visitDates[5] || '',
      anc7: visitDates[6] || '',
      anc8: visitDates[7] || '',
      bmi1: firstTrimesterVisit.bmi || '',
      bmiCat1: firstTrimesterVisit.bmi_category || '',
      td1: p.td1 || '',
      td2: p.td2 || '',
      td3: p.td3 || '',
      td4: p.td4 || '',
      td5: p.td5 || '',
      dewormingGiven: p.is_deworming_given ? 1 : 0,
      dewormingDate: p.deworming_date || '',
      syphilisDate: syphilis?.date || '',
      syphilisResult: isSyphilisPos ? 1 : (syphilis ? 0 : ''),
      hivDate: hiv?.date || '',
      hivResult: isHivPos ? 1 : (hiv ? 0 : ''),
      hepbDate: hepb?.date || '',
      hepbResult: isHepbPos ? 1 : (hepb ? 0 : ''),
      cbcDate: cbc?.date || '',
      cbcResult: isCbcAnemia ? 1 : (cbc ? 0 : ''),
      gdmDate: gdm?.date || '',
      gdmResult: isGdmPos ? 1 : (gdm ? 0 : ''),
      deliveryDate: p.delivery_date || '',
      deliveryOutcome: p.delivery_outcome || '',
      deliveryMode: p.delivery_mode || '',
      birthWeight: firstBaby.weight || p.birth_weight || '',
      birthWeightCat: firstBaby.category || p.birth_weight_category || '',
      birthSex: (firstBaby.sex || p.birth_sex || '').startsWith('M')
        ? 'M'
        : (firstBaby.sex || p.birth_sex || '').startsWith('F')
          ? 'F'
          : '',
      deliveryPlace: p.delivery_place || '',
      facilityType: p.delivery_facility_type || '',
      facilityCapable: p.delivery_place_capable || '',
      nonHealthFacility: p.delivery_non_health_facility === 'Others' ? 'Others' : (p.delivery_non_health_facility || ''),
      nonHealthPlace: p.delivery_non_health_place || '',
      attendant: (() => {
        const parsed = parseOthers(p.delivery_attendant);
        return parsed.main || '';
      })(),
      attendantSpecify: (() => {
        const parsed = parseOthers(p.delivery_attendant);
        return parsed.specify || '';
      })(),
      deliveryTime: p.delivery_time || '',
      pnc1: p.pnc_date_1 || '',
      pnc2: p.pnc_date_2 || '',
      pnc3: p.pnc_date_3 || '',
      pnc4: p.pnc_date_4 || '',
      pncCompleted: is4PncCompleted ? 1 : 0,
      ppIfaCount: p.postpartum_ifa_count || 0,
      ppIfaDate: p.postpartum_ifa_completed_date || '',
      vitADate: p.vit_a_completed_date || '',
    });
  });

  const border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = border;
      cell.alignment = {
        vertical: 'middle',
        wrapText: true,
        horizontal: 'center',
      };
      if (rowNumber === 1) {
        cell.font = { bold: true, size: 10 };
      } else {
        cell.font = { size: 10 };
      }
    });
    // Header row taller so legend lines in headers wrap and fit.
    row.height = rowNumber === 1 ? 48 : 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Maternal_TCL_${dateLabel}.xlsx`);
}
