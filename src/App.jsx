import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';
import { getAgeGroup, calculateEDC, calculateAOGData, isPatientDue, parseOthers, getLatestPrenatalVisit } from './lib/patientHelpers';
import { formatDate } from './lib/formatters';
import { getInitialFormState } from './lib/initialFormState';
import DashboardView from './components/dashboard/DashboardView';
import RecordsView from './components/records/RecordsView';
import ReportsView from './components/reports/ReportsView';
import HelpView from './components/help/HelpView';
import AccountsView from './components/accounts/AccountsView';
import AppShellLayout from './components/layout/AppShellLayout';
import PatientModal from './components/patient-modal/PatientModal';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Box, Loader, Text } from '@mantine/core';
import { Stethoscope } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); setLoading(false); });
    return () => subscription.unsubscribe();
  }, []);

  const clearSession = () => setSession(null);

  if (loading) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 16,
          background: 'linear-gradient(160deg, #e6fcf5 0%, #f0f4f8 50%, #fff 100%)',
        }}
      >
        <Stethoscope size={48} color="#0ca678" strokeWidth={1.5} style={{ opacity: 0.9 }} />
        <Loader color="teal" type="dots" size="lg" />
        <Text size="sm" c="dimmed" fw={500}>Loading KONEK Health…</Text>
      </Box>
    );
  }
  if (!session) return <Login />;

  return <MainApp session={session} onLogout={clearSession} />;
}

function MainApp({ session, onLogout }) {
  const isAdmin = session.user.email === 'admin@konek.ph';
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');

  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [formErrors, setFormErrors] = useState({});

  const initialFormState = getInitialFormState();
  const [formData, setFormData] = useState(initialFormState);
  const [newVisit, setNewVisit] = useState({ date: '', aog: '', trimester: '', weight: '', height: '', bmi: '', bmi_category: '', remarks: '' });
  const [newSupp, setNewSupp] = useState({ type: 'IFA', date: '', count: '' });
  const [newLab, setNewLab] = useState({ type: 'CBC', date: '', result: '' });
  const [newPostpartumLog, setNewPostpartumLog] = useState({ date: '', count: '', remarks: '' });
  const [editingVisitIndex, setEditingVisitIndex] = useState(null);
  const [editingSupp, setEditingSupp] = useState(null); // { type: 'IFA'|'MMS', index }
  const [editingLabIndex, setEditingLabIndex] = useState(null);
  const [editingPostpartumIndex, setEditingPostpartumIndex] = useState(null);

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { fetchPatients(); }, []);

  async function fetchPatients() {
    let query = supabase.from('maternal_records').select('*').order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('created_by', session.user.id);
    const { data, error } = await query;
    if (!error) setPatients(data || []);
  }

  async function handleDelete(patient) {
    if (!confirm('Delete?')) return;

    let query = supabase.from('maternal_records').delete().eq('id', patient.id);
    if (!isAdmin) {
      query = query.eq('created_by', session.user.id);
    }

    const { error } = await query;
    if (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
      return;
    }

    fetchPatients();
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    if (isMobile && mobileOpened) toggleMobile();
  };

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setActivePage('records');
  };

  const handleTdChange = (field, value) => {
    if (!value) { setFormData({ ...formData, [field]: value }); return; }
    const sequence = ['td1', 'td2', 'td3', 'td4', 'td5'];
    const currentIndex = sequence.indexOf(field);
    for (let i = 0; i < currentIndex; i++) {
      const prevField = sequence[i];
      const prevDateString = formData[prevField];
      if (prevDateString && prevDateString >= value) {
        notifications.show({ title: 'Invalid date', message: `${field.toUpperCase()} cannot be earlier than or same as ${prevField.toUpperCase()} (${formatDate(prevDateString)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
        return;
      }
    }
    for (let i = currentIndex + 1; i < sequence.length; i++) {
      const nextField = sequence[i];
      const nextDateString = formData[nextField];
      if (nextDateString && nextDateString <= value) {
        notifications.show({ title: 'Invalid date', message: `${field.toUpperCase()} cannot be later than or same as ${nextField.toUpperCase()} (${formatDate(nextDateString)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
        return;
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  const getImmunizationStats = () => {
    if (formData.td_completed_previously) return { count: 'Completed (Prev)', fimStatus: 'Yes' };
    if (formData.td5) return { count: 5, fimStatus: 'Yes' };
    if (formData.td4) return { count: 4, fimStatus: 'No' };
    if (formData.td3) return { count: 3, fimStatus: 'No' };
    if (formData.td2) return { count: 2, fimStatus: 'No' };
    if (formData.td1) return { count: 1, fimStatus: 'No' };
    return { count: 0, fimStatus: 'No' };
  };

  const handleBirthWeightChange = (val, index = 0) => {
    let category = '';
    if (val !== '' && val !== undefined && val !== null) { category = val >= 2500 ? 'Normal' : 'Low'; }

    setFormData((prev) => {
      // Determine how many babies should be represented based on pregnancy type
      const type = prev.pregnancy_type;
      const multipleCount = Number(prev.pregnancy_multiple_count) || 0;
      let desiredCount = 1;
      if (type === 'Twins') desiredCount = 2;
      else if (type === 'Multiple' && multipleCount > 0) desiredCount = Math.min(multipleCount, 12);

      const existing = Array.isArray(prev.baby_details) ? [...prev.baby_details] : [];
      while (existing.length < desiredCount) existing.push({ weight: '', category: '', sex: '' });

      const updated = [...existing];
      const current = updated[index] || { weight: '', category: '', sex: '' };
      updated[index] = { ...current, weight: val, category };

      const next = {
        ...prev,
        baby_details: updated,
      };

      // Keep legacy single-baby fields in sync with Baby 1 for reporting / backward compatibility
      if (index === 0) {
        next.birth_weight = val;
        next.birth_weight_category = category;
      }

      return next;
    });
  };

  const handleBabySexChange = (val, index = 0) => {
    setFormData((prev) => {
      const type = prev.pregnancy_type;
      const multipleCount = Number(prev.pregnancy_multiple_count) || 0;
      let desiredCount = 1;
      if (type === 'Twins') desiredCount = 2;
      else if (type === 'Multiple' && multipleCount > 0) desiredCount = Math.min(multipleCount, 12);

      const existing = Array.isArray(prev.baby_details) ? [...prev.baby_details] : [];
      while (existing.length < desiredCount) existing.push({ weight: '', category: '', sex: '' });

      const updated = [...existing];
      const current = updated[index] || { weight: '', category: '', sex: '' };
      updated[index] = { ...current, sex: val };

      const next = {
        ...prev,
        baby_details: updated,
      };

      if (index === 0) {
        next.birth_sex = val;
      }

      return next;
    });
  };

  const handleLmpChange = (e) => {
    const newLmp = e.target.value;
    const newEdc = calculateEDC(newLmp);
    const { aog, trimester } = calculateAOGData(newLmp, formData.visit_date);
    setFormData({ ...formData, lmp: newLmp, edc: newEdc, aog, trimester });
    // Recalculate new visit AOG/trimester when LMP changes (if visit date already set)
    setNewVisit((prev) => {
      if (!prev.date) return prev;
      const { aog: visitAog, trimester: visitTrim } = calculateAOGData(newLmp, prev.date);
      return { ...prev, aog: visitAog, trimester: visitTrim };
    });
  };

  const handleVisitDateChange = (e) => {
    const date = e.target.value;
    if (date) {
      const latest = getLatestPrenatalVisit(formData.prenatal_visits);
      if (latest?.date && date <= latest.date) {
        notifications.show({ title: 'Invalid date', message: `Visit date must be after the latest visit (${formatDate(latest.date)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
        return;
      }
    }
    const { aog, trimester } = calculateAOGData(formData.lmp, date);
    setNewVisit({ ...newVisit, date, aog, trimester });
  };

  const handleBMIChange = (field, value) => {
    const updatedVisit = { ...newVisit, [field]: value };
    let bmiValue = '', category = '';
    if (updatedVisit.weight && updatedVisit.height) {
      const h = updatedVisit.height / 100;
      const w = updatedVisit.weight;
      const rawBmi = w / (h * h);
      const res = Number(rawBmi.toFixed(1));
      bmiValue = res.toFixed(1);
      if (res < 18.5) category = 'LOW';
      else if (res < 25) category = 'NORMAL';
      else category = 'HIGH';
    }
    setNewVisit({ ...updatedVisit, bmi: bmiValue, bmi_category: category });
  };

  const addVisitToList = () => {
    if (!newVisit.date) return notifications.show({ title: 'Required', message: 'Please enter visit date.', color: 'red' });
    if (newVisit.trimester === '1st Trimester' && (newVisit.weight === '' || newVisit.weight == null)) return notifications.show({ title: 'Required', message: 'Weight is required for 1st trimester visits.', color: 'red' });
    const otherVisits = editingVisitIndex != null ? formData.prenatal_visits.filter((_, idx) => idx !== editingVisitIndex) : formData.prenatal_visits;
    const latest = getLatestPrenatalVisit(otherVisits);
    if (latest?.date && newVisit.date <= latest.date) {
      notifications.show({ title: 'Invalid date', message: `Visit date must be after the latest visit (${formatDate(latest.date)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
      return;
    }
    if (editingVisitIndex != null) {
      const next = [...formData.prenatal_visits];
      next[editingVisitIndex] = newVisit;
      setFormData({ ...formData, prenatal_visits: next });
      setEditingVisitIndex(null);
    } else {
      setFormData({ ...formData, prenatal_visits: [...formData.prenatal_visits, newVisit] });
    }
    setNewVisit({ date: '', aog: '', trimester: '', weight: '', height: '', bmi: '', bmi_category: '', remarks: '' });
  };
  const removeVisit = (i) => {
    setFormData({ ...formData, prenatal_visits: formData.prenatal_visits.filter((_, idx) => idx !== i) });
    if (editingVisitIndex === i) { setEditingVisitIndex(null); setNewVisit({ date: '', aog: '', trimester: '', weight: '', height: '', bmi: '', bmi_category: '', remarks: '' }); }
  };
  const startEditVisit = (i) => {
    const v = formData.prenatal_visits[i] || {};
    setNewVisit({ date: v.date || '', aog: v.aog || '', trimester: v.trimester || '', weight: v.weight || '', height: v.height || '', bmi: v.bmi || '', bmi_category: v.bmi_category || '', remarks: v.remarks || '' });
    setEditingVisitIndex(i);
  };

  const addSupplement = () => {
    if (!newSupp.date || !newSupp.count) return notifications.show({ title: 'Required', message: 'Please enter date and count.', color: 'red' });
    const list = newSupp.type === 'IFA' ? formData.supplements_ifa : newSupp.type === 'Calcium' ? formData.supplements_calcium : formData.supplements_mms;
    const otherList = editingSupp != null && editingSupp.type === newSupp.type ? list.filter((_, i) => i !== editingSupp.index) : list;
    const latestDate = otherList.length ? otherList.reduce((max, item) => (item.date > max ? item.date : max), otherList[0].date) : null;
    if (latestDate && newSupp.date <= latestDate) {
      const label = newSupp.type === 'IFA' ? 'IFA' : newSupp.type === 'Calcium' ? 'Calcium' : 'MMS';
      notifications.show({ title: 'Invalid date', message: `${label} log date must be after the latest log (${formatDate(latestDate)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
      return;
    }
    const entry = { date: newSupp.date, count: newSupp.count };
    if (editingSupp != null && editingSupp.type === newSupp.type) {
      const arr = [...list];
      arr[editingSupp.index] = entry;
      if (newSupp.type === 'IFA') setFormData({ ...formData, supplements_ifa: arr });
      else if (newSupp.type === 'Calcium') setFormData({ ...formData, supplements_calcium: arr });
      else setFormData({ ...formData, supplements_mms: arr });
      setEditingSupp(null);
    } else {
      if (newSupp.type === 'IFA') setFormData({ ...formData, supplements_ifa: [...formData.supplements_ifa, entry] });
      else if (newSupp.type === 'Calcium') setFormData({ ...formData, supplements_calcium: [...formData.supplements_calcium, entry] });
      else setFormData({ ...formData, supplements_mms: [...formData.supplements_mms, entry] });
    }
    setNewSupp({ ...newSupp, date: '', count: '' });
  };
  const removeSupplement = (type, index) => {
    if (type === 'IFA') setFormData({ ...formData, supplements_ifa: formData.supplements_ifa.filter((_, i) => i !== index) });
    else if (type === 'Calcium') setFormData({ ...formData, supplements_calcium: formData.supplements_calcium.filter((_, i) => i !== index) });
    else setFormData({ ...formData, supplements_mms: formData.supplements_mms.filter((_, i) => i !== index) });
    if (editingSupp?.type === type && editingSupp?.index === index) { setEditingSupp(null); setNewSupp({ ...newSupp, date: '', count: '' }); }
  };
  const startEditSupplement = (type, index) => {
    const list = type === 'IFA' ? formData.supplements_ifa : type === 'MMS' ? formData.supplements_mms : formData.supplements_calcium;
    const s = list[index] || {};
    setNewSupp({ type, date: s.date || '', count: s.count ?? '' });
    setEditingSupp({ type, index });
  };

  const addLabLog = () => {
    if (!newLab.date) return notifications.show({ title: 'Required', message: 'Date is required.', color: 'red' });
    if (!newLab.result) return notifications.show({ title: 'Required', message: 'Result is required.', color: 'red' });
    const logs = formData.lab_logs || [];
    if (editingLabIndex != null) {
      const next = [...logs];
      next[editingLabIndex] = newLab;
      setFormData({ ...formData, lab_logs: next });
      setEditingLabIndex(null);
    } else {
      setFormData({ ...formData, lab_logs: [...logs, newLab] });
    }
    setNewLab({ type: newLab.type, date: '', result: '' });
  };
  const removeLabLog = (index) => {
    setFormData({ ...formData, lab_logs: formData.lab_logs.filter((_, i) => i !== index) });
    if (editingLabIndex === index) { setEditingLabIndex(null); setNewLab({ type: newLab.type, date: '', result: '' }); }
  };
  const startEditLabLog = (index) => {
    const log = (formData.lab_logs || [])[index] || {};
    setNewLab({ type: log.type || 'CBC', date: log.date || '', result: log.result || '' });
    setEditingLabIndex(index);
  };

  const getIfaCompletionDate = (logList) => {
    const sorted = [...(logList || [])].sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')));
    let running = 0;
    for (const item of sorted) {
      running += Number(item?.count) || 0;
      if (running >= 90) return item?.date || '';
    }
    return '';
  };

  const addPostpartumLog = () => {
    if (!newPostpartumLog.date || !newPostpartumLog.count) return notifications.show({ title: 'Required', message: 'Date and count are required.', color: 'red' });
    const logs = formData.postpartum_logs || [];
    const otherLogs = editingPostpartumIndex != null ? logs.filter((_, i) => i !== editingPostpartumIndex) : logs;
    const latestDate = otherLogs.length ? otherLogs.reduce((max, item) => (item.date > max ? item.date : max), otherLogs[0].date) : null;
    if (latestDate && newPostpartumLog.date <= latestDate) {
      notifications.show({ title: 'Invalid date', message: `Postpartum log date must be after the latest log (${formatDate(latestDate)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
      return;
    }

    let updatedLogs;
    if (editingPostpartumIndex != null) {
      updatedLogs = [...logs];
      updatedLogs[editingPostpartumIndex] = newPostpartumLog;
      setEditingPostpartumIndex(null);
    } else {
      updatedLogs = [...logs, newPostpartumLog];
    }
    const completionDate = getIfaCompletionDate(updatedLogs);
    setFormData({
      ...formData,
      postpartum_logs: updatedLogs,
      postpartum_ifa_completed_date: completionDate || null,
    });
    setNewPostpartumLog({ date: '', count: '', remarks: '' });
  };
  const removePostpartumLog = (index) => {
    const updatedLogs = (formData.postpartum_logs || []).filter((_, i) => i !== index);
    const completionDate = getIfaCompletionDate(updatedLogs);
    setFormData({
      ...formData,
      postpartum_logs: updatedLogs,
      postpartum_ifa_completed_date: completionDate || null,
    });
    if (editingPostpartumIndex === index) { setEditingPostpartumIndex(null); setNewPostpartumLog({ date: '', count: '', remarks: '' }); }
  };
  const startEditPostpartumLog = (index) => {
    const log = (formData.postpartum_logs || [])[index] || {};
    setNewPostpartumLog({ date: log.date || '', count: log.count ?? '', remarks: log.remarks || '' });
    setEditingPostpartumIndex(index);
  };

  const handlePncDateChange = (field, value) => {
    if (!value) { setFormData({ ...formData, [field]: value }); return; }
    const sequence = ['pnc_date_1', 'pnc_date_2', 'pnc_date_3', 'pnc_date_4'];
    const currentIndex = sequence.indexOf(field);
    const contactLabel = (f) => `Contact ${f.replace('pnc_date_', '')}`;
    for (let i = 0; i < currentIndex; i++) {
      const prevField = sequence[i];
      const prevDateString = formData[prevField];
      if (prevDateString && prevDateString >= value) {
        notifications.show({ title: 'Invalid date', message: `${contactLabel(field)} cannot be earlier than or same as ${contactLabel(prevField)} (${formatDate(prevDateString)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
        return;
      }
    }
    for (let i = currentIndex + 1; i < sequence.length; i++) {
      const nextField = sequence[i];
      const nextDateString = formData[nextField];
      if (nextDateString && nextDateString <= value) {
        notifications.show({ title: 'Invalid date', message: `${contactLabel(field)} cannot be later than or same as ${contactLabel(nextField)} (${formatDate(nextDateString)}). You cannot add a date that is the same as or before the previous one.`, color: 'red' });
        return;
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleAddClick = () => {
    if (opened && isEditing) {
      if (!confirm('You are editing a record. Start a new record instead? Your current changes will be lost.')) return;
    }
    setFormData(getInitialFormState());
    setFormErrors({});
    setIsEditing(false);
    setEditId(null);
    setActiveTab('general');
    setEditingVisitIndex(null);
    setEditingSupp(null);
    setEditingLabIndex(null);
    setEditingPostpartumIndex(null);
    open();
  };

  const handleEditClick = (patient) => {
    const attendant = parseOthers(patient.delivery_attendant);
    const cleanData = {};
    Object.keys(initialFormState).forEach((key) => {
      if (patient[key] === null || patient[key] === undefined) cleanData[key] = initialFormState[key];
      else cleanData[key] = patient[key];
    });
    cleanData.baby_details = Array.isArray(patient.baby_details) ? patient.baby_details : (cleanData.baby_details || []);

    setFormData({
      ...initialFormState,
      ...cleanData,
      manual_risk: patient.is_high_risk,
      delivery_attendant: attendant.main,
      delivery_attendant_specify: attendant.specify,
      prenatal_visits: patient.prenatal_visits || [],
      supplements_ifa: patient.supplements_ifa || [],
      supplements_calcium: patient.supplements_calcium || [],
      supplements_mms: patient.supplements_mms || [],
      lab_logs: patient.lab_logs || [],
      postpartum_logs: patient.postpartum_logs || [],
    });
    setFormErrors({});
    setIsEditing(true);
    setEditId(patient.id);
    setActiveTab('general');
    setEditingVisitIndex(null);
    setEditingSupp(null);
    setEditingLabIndex(null);
    setEditingPostpartumIndex(null);
    open();
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorTab = null;
    const isInvalid = (val) => val === '' || val === null || val === undefined;
    const setError = (field, tab, msg) => {
      if (!newErrors[field]) { newErrors[field] = msg; if (!firstErrorTab) firstErrorTab = tab; }
    };

    if (isInvalid(formData.last_name)) setError('last_name', 'general', 'Last name is required');
    if (isInvalid(formData.first_name)) setError('first_name', 'general', 'First name is required');
    if (isInvalid(formData.age)) setError('age', 'general', 'Age is required');
    if (isInvalid(formData.barangay)) setError('barangay', 'general', 'Barangay is required');
    if (isInvalid(formData.address)) setError('address', 'general', 'Address is required');
    if (isInvalid(formData.lmp)) setError('lmp', 'general', 'LMP is required');
    if (isInvalid(formData.gravida)) setError('gravida', 'general', 'Gravida is required');
    if (isInvalid(formData.parity)) setError('parity', 'general', 'Parity is required');
    const isAbortedCheck = formData.delivery_outcome === 'AB' || formData.delivery_outcome === 'FD';
    const hasDelivered = !!(formData.delivery_outcome && String(formData.delivery_outcome).trim());
    if (hasDelivered && !isAbortedCheck && isInvalid(formData.delivery_mode)) setError('delivery_mode', 'delivery', 'Delivery type is required');

    setFormErrors(newErrors);
    if (firstErrorTab) {
      setActiveTab(firstErrorTab);
      setTimeout(() => {
        const errorElement = document.querySelector('.mantine-InputWrapper-error');
        if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit() {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const latest = getLatestPrenatalVisit(formData.prenatal_visits) || {};
      const calculatedIfaCount = (formData.postpartum_logs || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0);
      const finalAttendant = formData.delivery_attendant === 'Others' ? `Others: ${formData.delivery_attendant_specify}` : formData.delivery_attendant;

      const pncAllFour = [formData.pnc_date_1, formData.pnc_date_2, formData.pnc_date_3, formData.pnc_date_4].filter(Boolean).length === 4;
      const vitADateSet = !!(formData.vit_a_completed_date && String(formData.vit_a_completed_date).trim());
      const getIfaCompletionDate = (logList) => {
        const sorted = [...(logList || [])].sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')));
        let running = 0;
        for (const item of sorted) {
          running += Number(item?.count) || 0;
          if (running >= 90) return item?.date || null;
        }
        return null;
      };
      const ifaCompletionDate = getIfaCompletionDate(formData.postpartum_logs);

      const rawPayload = {
        ...formData,
        is_high_risk: formData.manual_risk,
        height: latest.height || null,
        weight: latest.weight || null,
        bmi: latest.bmi || null,
        bmi_category: latest.bmi_category || null,
        delivery_attendant: finalAttendant,
        postpartum_ifa_count: calculatedIfaCount,
        is_4pnc_completed: pncAllFour ? 'Yes' : 'No',
        is_postpartum_ifa_completed: calculatedIfaCount >= 90 ? 'Yes' : 'No',
        postpartum_ifa_completed_date: ifaCompletionDate,
        is_vit_a_completed: vitADateSet ? 'Yes' : 'No',
        created_by: session.user.id,
      };

      // UI-only / helper fields that should not be sent to Supabase
      delete rawPayload.delivery_attendant_specify;
      delete rawPayload.td_completed_previously;
      delete rawPayload.delivery_place_specify;
      if (isEditing) delete rawPayload.created_by;

      // Persist baby_details for reporting; empty for non–live births
      const isLiveBirth = ['FT', 'PT'].includes(formData.delivery_outcome);
      rawPayload.baby_details = isLiveBirth && Array.isArray(formData.baby_details) && formData.baby_details.length > 0
        ? formData.baby_details
        : [];

      if (formData.delivery_place === 'Others') {
        rawPayload.delivery_non_health_facility = formData.delivery_non_health_facility || null;
        rawPayload.delivery_non_health_place = formData.delivery_non_health_facility === 'Others' ? (formData.delivery_non_health_place || null) : null;
      } else {
        rawPayload.delivery_non_health_facility = null;
        rawPayload.delivery_non_health_place = null;
      }

      const numberFields = ['age', 'gravida', 'parity', 'birth_weight', 'height', 'weight', 'bmi', 'postpartum_ifa_count', 'pregnancy_multiple_count'];
      const finalPayload = { ...rawPayload };
      Object.keys(finalPayload).forEach((key) => {
        if (finalPayload[key] === '') finalPayload[key] = null;
        if (numberFields.includes(key) && (finalPayload[key] === '' || finalPayload[key] === null)) finalPayload[key] = null;
      });

      let error;
      if (isEditing) {
        finalPayload.updated_at = new Date().toISOString();
        const { error: updateError } = await supabase.from('maternal_records').update(finalPayload).eq('id', editId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('maternal_records').insert(finalPayload);
        error = insertError;
      }

      if (!error) {
        close();
        setFormData(getInitialFormState());
        setIsEditing(false);
        setEditId(null);
        setEditingVisitIndex(null);
        setEditingSupp(null);
        setEditingLabIndex(null);
        setEditingPostpartumIndex(null);
        fetchPatients();
      } else {
        notifications.show({ title: 'Error', message: error.message, color: 'red' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const nextTab = (next) => setActiveTab(next);
  const totalIFA = formData.supplements_ifa.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const totalMMS = formData.supplements_mms.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const ifaProgress = Math.min((totalIFA / 180) * 100, 100);
  const totalPostpartum = (formData.postpartum_logs || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const postpartumProgress = Math.min((totalPostpartum / 90) * 100, 100);
  const isAborted = formData.delivery_outcome === 'AB' || formData.delivery_outcome === 'FD';

  const mainContent =
    activePage === 'dashboard' ? <DashboardView patients={patients} currentTime={currentTime} handleAddClick={handleAddClick} onFilterSelect={handleFilterSelect} /> :
      activePage === 'records' ? <RecordsView patients={patients} search={search} setSearch={setSearch} handleAddClick={handleAddClick} handleEditClick={handleEditClick} handleDelete={handleDelete} isAdmin={isAdmin} getAgeGroup={getAgeGroup} filterStatus={filterStatus} setFilterStatus={setFilterStatus} modalOpened={opened} /> :
        activePage === 'reports' ? <ReportsView patients={patients} /> :
          activePage === 'help' ? <HelpView /> :
            activePage === 'accounts' ? <AccountsView /> : null;

  return (
    <>
      <AppShellLayout
        mobileOpened={mobileOpened}
        toggleMobile={toggleMobile}
        desktopOpened={desktopOpened}
        toggleDesktop={toggleDesktop}
        activePage={activePage}
        handleNavClick={handleNavClick}
        handleAddClick={handleAddClick}
        handleLogout={handleLogout}
        isAdmin={isAdmin}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        modalOpened={opened}
      >
        {mainContent}
      </AppShellLayout>

      <PatientModal
        opened={opened}
        close={close}
        submitting={submitting}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newVisit={newVisit}
        setNewVisit={setNewVisit}
        newSupp={newSupp}
        setNewSupp={setNewSupp}
        newLab={newLab}
        setNewLab={setNewLab}
        newPostpartumLog={newPostpartumLog}
        setNewPostpartumLog={setNewPostpartumLog}
        handleSubmit={handleSubmit}
        nextTab={nextTab}
        getAgeGroup={getAgeGroup}
        getImmunizationStats={getImmunizationStats}
        handleTdChange={handleTdChange}
        handleLmpChange={handleLmpChange}
        handleVisitDateChange={handleVisitDateChange}
        handleBMIChange={handleBMIChange}
        addVisitToList={addVisitToList}
        removeVisit={removeVisit}
        editingVisitIndex={editingVisitIndex}
        startEditVisit={startEditVisit}
        addSupplement={addSupplement}
        removeSupplement={removeSupplement}
        editingSupp={editingSupp}
        startEditSupplement={startEditSupplement}
        addLabLog={addLabLog}
        removeLabLog={removeLabLog}
        editingLabIndex={editingLabIndex}
        startEditLabLog={startEditLabLog}
        addPostpartumLog={addPostpartumLog}
        removePostpartumLog={removePostpartumLog}
        editingPostpartumIndex={editingPostpartumIndex}
        startEditPostpartumLog={startEditPostpartumLog}
        handlePncDateChange={handlePncDateChange}
        handleBirthWeightChange={handleBirthWeightChange}
        handleBabySexChange={handleBabySexChange}
        totalIFA={totalIFA}
        totalMMS={totalMMS}
        ifaProgress={ifaProgress}
        totalPostpartum={totalPostpartum}
        postpartumProgress={postpartumProgress}
        isAborted={isAborted}
      />
    </>
  );
}

export default App;
