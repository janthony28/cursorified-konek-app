import { supabase } from '../supabaseClient';

const UNKNOWN_BARANGAY = 'Unassigned';

const HIGH_RISK_REASON_FLAGS = [
  ['has_hypertension', 'Hypertension'],
  ['has_gestational_diabetes', 'Gestational Diabetes'],
  ['has_advanced_maternal_age', 'Advanced Maternal Age'],
  ['has_multiple_gestation', 'Multiple Gestation'],
  ['has_multiple_miscarriages', 'History of Multiple Miscarriages'],
  ['has_obesity', 'Obesity'],
];

const MATERNAL_DEATH_FIELDS = [
  'is_maternal_death',
  'maternal_death',
  'maternal_death_flag',
  'has_maternal_death',
];

const NEONATAL_DEATH_FIELDS = [
  'is_neonatal_death',
  'neonatal_death',
  'neonatal_death_flag',
  'has_neonatal_death',
];

const BIRTH_REGISTRATION_FIELDS = [
  'birth_registration_status',
  'birth_registered',
  'is_birth_registered',
  'newborn_registered',
  'is_newborn_registered',
];

function normalizeBarangay(value) {
  const cleaned = String(value || '').trim();
  return cleaned || UNKNOWN_BARANGAY;
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value) {
  if (value === true || value === false) return value;
  const text = String(value || '').trim().toLowerCase();
  return ['true', 'yes', '1', 'y'].includes(text);
}

function percent(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function visitDateValue(visit) {
  const date = String(visit?.date || '');
  if (!date) return Number.POSITIVE_INFINITY;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function getSortedPrenatalVisits(record) {
  const visits = Array.isArray(record?.prenatal_visits) ? [...record.prenatal_visits] : [];
  return visits.sort((a, b) => visitDateValue(a) - visitDateValue(b));
}

function isFirstTrimesterVisit(visit) {
  const trimester = String(visit?.trimester || '').trim().toLowerCase();
  if (trimester === '1st trimester') return true;
  const aogText = String(visit?.aog || '').trim().toLowerCase();
  const weekMatch = aogText.match(/^(\d+)\s*weeks?/);
  if (!weekMatch) return false;
  const weeks = Number(weekMatch[1]);
  return Number.isFinite(weeks) && weeks <= 13;
}

function startedAncInFirstTrimester(record) {
  const visits = getSortedPrenatalVisits(record);
  if (!visits.length) return false;
  return isFirstTrimesterVisit(visits[0]);
}

function hasAtLeastOnePostpartumVisit(record) {
  return [record?.pnc_date_1, record?.pnc_date_2, record?.pnc_date_3, record?.pnc_date_4].some(Boolean);
}

function getIfaTotal(record) {
  const items = Array.isArray(record?.supplements_ifa) ? record.supplements_ifa : [];
  return items.reduce((sum, item) => sum + asNumber(item?.count), 0);
}

function getMmsTotal(record) {
  const items = Array.isArray(record?.supplements_mms) ? record.supplements_mms : [];
  return items.reduce((sum, item) => sum + asNumber(item?.count), 0);
}

function hasDelivery(record) {
  return Boolean(record?.delivery_date || record?.delivery_outcome);
}

function isFacilityBirth(record) {
  if (!hasDelivery(record)) return false;
  const place = String(record?.delivery_place || '').trim();
  const facilityType = String(record?.delivery_facility_type || '').trim().toLowerCase();
  if (place && place !== 'Others') return true;
  if (facilityType === 'public' || facilityType === 'private') return true;
  return false;
}

function isTeenage(record) {
  const age = Number(record?.age);
  return Number.isFinite(age) && age >= 10 && age <= 19;
}

function collectRiskReasons(record) {
  const reasons = [];
  for (const [key, label] of HIGH_RISK_REASON_FLAGS) {
    if (toBoolean(record?.[key])) reasons.push(label);
  }
  const customReason = String(record?.high_risk_reason || '').trim();
  if (customReason) reasons.push(customReason);
  if (!reasons.length) reasons.push('Unspecified');
  return reasons;
}

function hasAnyTruthyField(record, fieldNames) {
  return fieldNames.some((field) => toBoolean(record?.[field]));
}

function isMaternalDeath(record) {
  if (hasAnyTruthyField(record, MATERNAL_DEATH_FIELDS)) return true;
  const remarks = String(record?.pregnancy_outcome_remarks || '').toLowerCase();
  return /\bmaternal death\b|\bmaternal mortality\b|\bmmd\b/.test(remarks);
}

function isNeonatalDeath(record) {
  if (hasAnyTruthyField(record, NEONATAL_DEATH_FIELDS)) return true;
  const remarks = String(record?.pregnancy_outcome_remarks || '').toLowerCase();
  return /\bneonatal death\b|\bneonatal mortality\b|\bnnd\b/.test(remarks);
}

function getBirthRegistrationStatus(record) {
  const raw = BIRTH_REGISTRATION_FIELDS
    .map((field) => record?.[field])
    .find((value) => value !== undefined && value !== null && String(value).trim() !== '');

  if (raw === undefined) return 'Unknown';
  if (toBoolean(raw)) return 'Registered';
  if (raw === false || raw === 0) return 'Unregistered';

  const text = String(raw).trim().toLowerCase();
  if (['registered', 'complete', 'completed', 'yes'].includes(text)) return 'Registered';
  if (['unregistered', 'not registered', 'no', 'pending', 'false', '0'].includes(text)) return 'Unregistered';
  return 'Unknown';
}

function mapToSortedCountRows(counterMap) {
  return [...counterMap.entries()]
    .map(([barangay, count]) => ({ barangay, count }))
    .sort((a, b) => b.count - a.count || a.barangay.localeCompare(b.barangay));
}

export function buildMaternalStatistics(records) {
  const safeRecords = Array.isArray(records) ? records : [];

  const totalByBarangay = new Map();
  const firstTrimesterByBarangay = new Map();
  const anc4ByBarangay = new Map();
  const anc8ByBarangay = new Map();
  const deliveriesByBarangay = new Map();
  const facilityBirthsByBarangay = new Map();
  const teenageByBarangay = new Map();
  const neonatalDeathsByBarangay = new Map();
  const maternalDeathsByBarangay = new Map();
  const riskReasons = new Map();
  const birthRegistrationByBarangay = new Map();

  let highRiskCount = 0;
  let anc4Count = 0;
  let anc8Count = 0;
  let postpartumWithVisit = 0;
  let prenatalIfaCompliant = 0;
  let postpartumIfaCompliant = 0;
  let vitACompleted = 0;
  let mmsReceived = 0;
  let mothersWithDelivery = 0;

  for (const record of safeRecords) {
    const barangay = normalizeBarangay(record?.barangay);
    const visits = getSortedPrenatalVisits(record);
    const visitCount = visits.length;

    totalByBarangay.set(barangay, (totalByBarangay.get(barangay) || 0) + 1);

    if (startedAncInFirstTrimester(record)) {
      firstTrimesterByBarangay.set(barangay, (firstTrimesterByBarangay.get(barangay) || 0) + 1);
    }

    if (visitCount >= 4) {
      anc4Count += 1;
      anc4ByBarangay.set(barangay, (anc4ByBarangay.get(barangay) || 0) + 1);
    }

    if (visitCount >= 8 || toBoolean(record?.is_8anc_completed)) {
      anc8Count += 1;
      anc8ByBarangay.set(barangay, (anc8ByBarangay.get(barangay) || 0) + 1);
    }

    if (toBoolean(record?.is_high_risk)) {
      highRiskCount += 1;
      for (const reason of collectRiskReasons(record)) {
        riskReasons.set(reason, (riskReasons.get(reason) || 0) + 1);
      }
    }

    if (hasDelivery(record)) {
      mothersWithDelivery += 1;
      deliveriesByBarangay.set(barangay, (deliveriesByBarangay.get(barangay) || 0) + 1);
      if (isFacilityBirth(record)) {
        facilityBirthsByBarangay.set(barangay, (facilityBirthsByBarangay.get(barangay) || 0) + 1);
      }
    }

    if (hasAtLeastOnePostpartumVisit(record)) {
      postpartumWithVisit += 1;
    }

    if (getIfaTotal(record) >= 180) prenatalIfaCompliant += 1;
    if ((asNumber(record?.postpartum_ifa_count) >= 90) || toBoolean(record?.is_postpartum_ifa_completed)) {
      postpartumIfaCompliant += 1;
    }
    if (record?.vit_a_completed_date || toBoolean(record?.is_vit_a_completed)) vitACompleted += 1;
    if (getMmsTotal(record) > 0) mmsReceived += 1;

    if (isTeenage(record)) {
      teenageByBarangay.set(barangay, (teenageByBarangay.get(barangay) || 0) + 1);
    }

    if (isNeonatalDeath(record)) {
      neonatalDeathsByBarangay.set(barangay, (neonatalDeathsByBarangay.get(barangay) || 0) + 1);
    }

    if (isMaternalDeath(record)) {
      maternalDeathsByBarangay.set(barangay, (maternalDeathsByBarangay.get(barangay) || 0) + 1);
    }

    const registrationStatus = getBirthRegistrationStatus(record);
    const barangayRegistration = birthRegistrationByBarangay.get(barangay) || {
      barangay,
      registered: 0,
      unregistered: 0,
      unknown: 0,
      total: 0,
    };
    if (registrationStatus === 'Registered') barangayRegistration.registered += 1;
    else if (registrationStatus === 'Unregistered') barangayRegistration.unregistered += 1;
    else barangayRegistration.unknown += 1;
    barangayRegistration.total += 1;
    birthRegistrationByBarangay.set(barangay, barangayRegistration);
  }

  const totalRecords = safeRecords.length;
  const pregnantWomenPerBarangay = mapToSortedCountRows(totalByBarangay);

  const firstTrimesterCoveragePerBarangay = pregnantWomenPerBarangay
    .map(({ barangay, count }) => {
      const numerator = firstTrimesterByBarangay.get(barangay) || 0;
      return {
        barangay,
        numerator,
        denominator: count,
        coveragePct: percent(numerator, count),
      };
    })
    .sort((a, b) => b.coveragePct - a.coveragePct || a.barangay.localeCompare(b.barangay));

  const ancLessThan4Count = Math.max(totalRecords - anc4Count, 0);

  const ancCompletionByBarangay = pregnantWomenPerBarangay
    .map(({ barangay, count }) => {
      const anc4 = anc4ByBarangay.get(barangay) || 0;
      const anc8 = anc8ByBarangay.get(barangay) || 0;
      return {
        barangay,
        anc4,
        anc8,
        anc4Pct: percent(anc4, count),
        anc8Pct: percent(anc8, count),
      };
    })
    .sort((a, b) => b.anc4Pct - a.anc4Pct || a.barangay.localeCompare(b.barangay));

  const ancCompletionOverallRaw = [
    { label: 'Less than 4 visits', count: ancLessThan4Count, percent: percent(ancLessThan4Count, totalRecords) },
    { label: 'At least 4 ANC visits', count: anc4Count, percent: percent(anc4Count, totalRecords) },
    { label: 'Completed 8 ANC visits', count: anc8Count, percent: percent(anc8Count, totalRecords) },
  ];
  const ancCompletionOverall = ancCompletionOverallRaw.sort((a, b) => b.percent - a.percent);

  const facilityBirthsPerBarangay = mapToSortedCountRows(deliveriesByBarangay).map(({ barangay, count }) => {
    const facilityCount = facilityBirthsByBarangay.get(barangay) || 0;
    const homeCount = Math.max(count - facilityCount, 0);
    return {
      barangay,
      totalDeliveries: count,
      facilityCount,
      homeCount,
      facilityPct: percent(facilityCount, count),
      homePct: percent(homeCount, count),
    };
  });

  const topRiskFactors = [...riskReasons.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason))
    .slice(0, 10);

  const postpartumWithoutVisit = Math.max(totalRecords - postpartumWithVisit, 0);
  const highRiskDistribution = [
    { name: 'High Risk', value: highRiskCount },
    { name: 'Normal', value: Math.max(totalRecords - highRiskCount, 0) },
  ];

  const birthRegistrationByBarangayRows = [...birthRegistrationByBarangay.values()]
    .sort((a, b) => b.total - a.total || a.barangay.localeCompare(b.barangay));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      mothers: totalRecords,
      deliveries: mothersWithDelivery,
      highRisk: highRiskCount,
      postpartumWithVisit,
      postpartumWithoutVisit,
      anc4Count,
      anc8Count,
    },
    percentages: {
      firstTrimesterCoverage: percent(firstTrimesterByBarangay.size ? [...firstTrimesterByBarangay.values()].reduce((s, c) => s + c, 0) : 0, totalRecords),
      anc4Coverage: percent(anc4Count, totalRecords),
      anc8Coverage: percent(anc8Count, totalRecords),
      postpartumCoverage: percent(postpartumWithVisit, totalRecords),
      highRiskRate: percent(highRiskCount, totalRecords),
      prenatalIfaCompliance: percent(prenatalIfaCompliant, totalRecords),
      postpartumIfaCompliance: percent(postpartumIfaCompliant, totalRecords),
      vitACompliance: percent(vitACompleted, totalRecords),
      mmsCoverage: percent(mmsReceived, totalRecords),
    },
    ancCoverage: {
      pregnantWomenPerBarangay,
      firstTrimesterCoveragePerBarangay,
      ancCompletionOverall,
      ancCompletionByBarangay,
    },
    highRiskAnalysis: {
      distribution: highRiskDistribution,
      topRiskFactors,
    },
    deliveryAndPostpartum: {
      facilityBirthsPerBarangay,
      postpartumVisit: {
        withVisit: postpartumWithVisit,
        withoutVisit: postpartumWithoutVisit,
        coveragePct: percent(postpartumWithVisit, totalRecords),
      },
      supplementation: {
        prenatalIfaCompliant,
        postpartumIfaCompliant,
        vitACompleted,
        mmsReceived,
      },
    },
    criticalAlerts: {
      teenagePregnancyByBarangay: mapToSortedCountRows(teenageByBarangay),
      neonatalDeathsByBarangay: mapToSortedCountRows(neonatalDeathsByBarangay),
      maternalDeathsByBarangay: mapToSortedCountRows(maternalDeathsByBarangay),
      birthRegistrationByBarangay: birthRegistrationByBarangayRows,
    },
  };
}

export async function fetchStatisticsData({ isAdmin = false, userId } = {}) {
  let query = supabase.from('maternal_records').select('*');
  if (!isAdmin && userId) query = query.eq('created_by', userId);

  const { data, error } = await query;
  if (error) throw error;
  return buildMaternalStatistics(data || []);
}
