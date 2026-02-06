/** Default form state for maternal record add/edit (matches Supabase schema) */
export function getInitialFormState() {
  return {
    first_name: '',
    last_name: '',
    middle_name: '',
    age: '',
    barangay: '',
    sitio: '',
    address: '',
    date_of_registration: new Date().toISOString().split('T')[0],

    lmp: '',
    edc: '',
    gravida: '',
    parity: '',
    visit_date: '',
    aog: '',
    trimester: '',
    prenatal_remarks: '',
    is_8anc_completed: false,

    height: '',
    weight: '',
    bmi: '',
    bmi_category: '',

    prenatal_visits: [],
    supplements_ifa: [],
    supplements_calcium: [],
    supplements_mms: [],
    lab_logs: [],
    postpartum_logs: [],

    // Calcium carbonate supplementation completion (high-risk only)
    calcium_carbonate_completed: false,

    td1: '', td2: '', td3: '', td4: '', td5: '',
    td_completed_previously: false,

    deworming_date: '',
    is_deworming_given: false,

    has_hypertension: false,
    has_gestational_diabetes: false,
    has_advanced_maternal_age: false,
    has_multiple_gestation: false,
    has_multiple_miscarriages: false,
    has_obesity: false,
    manual_risk: false,
    is_high_risk: false,
    high_risk_reason: '',

    delivery_date: '',
    delivery_time: '',
    delivery_outcome: '',
    pregnancy_outcome_remarks: '',
    pregnancy_type: '',
    pregnancy_multiple_count: '',
    // Legacy single-baby fields (Baby 1) kept for backward compatibility and reporting
    birth_weight: '',
    birth_weight_category: '',
    birth_sex: '',
    // Structured baby details (persisted for multi-baby reporting)
    baby_details: [],
    delivery_mode: '',
    delivery_attendant: '',

    delivery_facility_type: '',
    delivery_place: '',
    delivery_non_health_place: '',
    delivery_non_health_facility: '',
    delivery_place_capable: '',

    pnc_date_1: '', pnc_date_2: '', pnc_date_3: '', pnc_date_4: '',
    is_4pnc_completed: '',
    pnc_remarks: '',

    is_postpartum_ifa_completed: '',
    postpartum_ifa_completed_date: '',
    postpartum_ifa_count: 0,
    is_vit_a_completed: '',
    vit_a_completed_date: '',

    delivery_attendant_specify: '',
    delivery_place_specify: '',
  };
}
