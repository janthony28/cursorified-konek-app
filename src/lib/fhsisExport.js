import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Export maternal patients to FHSIS format matching the official template (image layout).
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
        if (p.delivery_facility_type === 'Non-Health Facility') inc('non_facility');
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

  row3('18. Number of deliveries', 'deliveries', '21. Number of health facility-based deliveries', null, '21. Number of health facility-based deliveries', null);
  row3('19. Number of live births', 'liveBirths', '   a. Number of deliveries in public health facility', 'facility_public', '   a. Number of deliveries in public health facility', 'facility_public');
  row1('   a. Number of live births with normal birth weight', num('lb_normal', '10-14'), num('lb_normal', '15-19'), num('lb_normal', '20-49'), num('lb_normal', 'total'));
  row3('', null, '   b. Number of deliveries in private health facility', 'facility_private', '   b. Number of deliveries in private health facility', 'facility_private');
  const row19b = sheet.getRow(r);
  row19b.getCell(1).value = '   b. Number of live births with low birth weight'; row19b.getCell(1).style = styles.normalCell;
  sheet.mergeCells(r, 2, r, 3); row19b.getCell(2).value = 'Male'; row19b.getCell(2).style = styles.centeredCell;
  sheet.mergeCells(r, 4, r, 5); row19b.getCell(4).value = 'Female'; row19b.getCell(4).style = styles.centeredCell;
  row19b.getCell(6).value = ''; row19b.getCell(6).style = styles.normalCell;
  r++;
  row1('', data.lb_low_m?.total ?? 0, 0, data.lb_low_f?.total ?? 0, (data.lb_low_m?.total ?? 0) + (data.lb_low_f?.total ?? 0));
  const row19c = sheet.getRow(r);
  row19c.getCell(1).value = '   c. Number of live births with unknown birth weight'; row19c.getCell(1).style = styles.normalCell;
  sheet.mergeCells(r, 2, r, 3); row19c.getCell(2).value = 'Male'; row19c.getCell(2).style = styles.centeredCell;
  sheet.mergeCells(r, 4, r, 5); row19c.getCell(4).value = 'Female'; row19c.getCell(4).style = styles.centeredCell;
  row19c.getCell(6).value = ''; row19c.getCell(6).style = styles.normalCell;
  r++;
  row1('', data.lb_unknown_m?.total ?? 0, 0, data.lb_unknown_f?.total ?? 0, (data.lb_unknown_m?.total ?? 0) + (data.lb_unknown_f?.total ?? 0));
  row3('', null, '22. Number of non-facility-based deliveries', 'non_facility', '22. Number of non-facility-based deliveries', 'non_facility');
  row3('20. Number of deliveries attended by skilled health professionals', null, '23. Type of Delivery', null, '23. Type of Delivery', null);
  row3('   a. Number of deliveries attended by a doctor', 'attendant_md', '   a. Number of vaginal deliveries', 'del_vaginal', '   a. Number of vaginal deliveries', 'del_vaginal');
  row3('   b. Number of deliveries attended by a nurse', 'attendant_rn', '   b. Number of deliveries by cesarean section', 'del_cs', '   b. Number of deliveries by cesarean section', 'del_cs');
  row3('   c. Number of deliveries attended by midwives', 'attendant_mw', '24. Pregnancy Outcome', null, '24. Pregnancy Outcome', null);
  row3('', null, '   a. Number of full-term births', 'outcome_ft', '   a. Number of full-term births', 'outcome_ft');
  row3('', null, '   b. Number of pre-term births', 'outcome_pt', '   b. Number of pre-term births', 'outcome_pt');
  row3('', null, '   c. Number of fetal deaths', 'outcome_fd', '   c. Number of fetal deaths', 'outcome_fd');
  row3('', null, '   c. Number of abortion/miscarriage', 'outcome_ab', '   c. Number of abortion/miscarriage', 'outcome_ab');

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
