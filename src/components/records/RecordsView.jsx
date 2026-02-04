import { useState } from 'react';
import { Group, Paper, Stack, Table, Text, Title, Badge, Box, Button, TextInput, ActionIcon, Select, Grid, Checkbox } from '@mantine/core';
import { UserPlus, Search, Edit, Trash, Filter } from 'lucide-react';
import { formatDate } from '../../lib/formatters';
import { isPatientDue, getLatestPrenatalVisit } from '../../lib/patientHelpers';
import { filterPatientsByReportMonth } from '../../lib/reportMonthFilter';
import { BATANGAS_BARANGAYS } from '../../lib/constants';

const MONTH_OPTIONS = [
  { value: '', label: 'All months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => ({ value: String(y), label: String(y) }));
const BARANGAY_OPTIONS = [{ value: '', label: 'All barangays' }, ...BATANGAS_BARANGAYS];

export default function RecordsView({
  patients = [],
  search,
  setSearch,
  handleAddClick,
  handleEditClick,
  handleDelete,
  isAdmin,
  getAgeGroup,
  filterStatus,
  setFilterStatus,
  modalOpened,
}) {
  const [recordMonth, setRecordMonth] = useState('');
  const [recordYear, setRecordYear] = useState(String(currentYear));
  const [recordBarangay, setRecordBarangay] = useState('');
  const [recordStatus, setRecordStatus] = useState(() => (filterStatus === 'high_risk' ? 'high_risk' : 'all'));
  const [dueForVisitOnly, setDueForVisitOnly] = useState(() => filterStatus === 'due');

  const safePatients = Array.isArray(patients) ? patients : [];

  const monthNum = recordMonth && recordMonth !== '' ? parseInt(recordMonth, 10) : null;
  const yearNum = recordYear ? parseInt(recordYear, 10) : null;
  const useMonthFilter = monthNum >= 1 && monthNum <= 12 && yearNum != null;

  let displayPatients = safePatients;
  if (useMonthFilter) {
    displayPatients = filterPatientsByReportMonth(displayPatients, yearNum, monthNum);
  }
  if (recordBarangay) {
    displayPatients = displayPatients.filter((p) => p.barangay === recordBarangay);
  }
  if (recordStatus === 'normal') {
    displayPatients = displayPatients.filter((p) => !p.is_high_risk);
  } else if (recordStatus === 'high_risk') {
    displayPatients = displayPatients.filter((p) => p.is_high_risk);
  }
  if (dueForVisitOnly) {
    const now = new Date();
    displayPatients = displayPatients.filter((p) => isPatientDue(p, now.getMonth(), now.getFullYear()));
  }

  const filtered = displayPatients.filter(
    (p) =>
      (p.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.first_name || '').toLowerCase().includes(search.toLowerCase())
  );

  let viewTitle = 'Maternal Records';
  if (recordStatus === 'high_risk') viewTitle = 'High Risk Records';
  else if (recordStatus === 'normal') viewTitle = 'Normal Records';
  if (dueForVisitOnly) viewTitle += ' (Due for visit)';

  const hasAnyFilter = useMonthFilter || recordBarangay || recordStatus !== 'all' || dueForVisitOnly;
  const clearAllFilters = () => {
    setRecordMonth('');
    setRecordYear(String(currentYear));
    setRecordBarangay('');
    setRecordStatus('all');
    setDueForVisitOnly(false);
    setFilterStatus('all');
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>{viewTitle}</Title>
        <Button leftSection={<UserPlus size={16} />} color="teal" onClick={handleAddClick} disabled={modalOpened}>Add New Record</Button>
      </Group>

      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group mb="md" gap="xs">
          <Filter size={16} />
          <Text size="sm" fw={600}>Filters</Text>
        </Group>
        <Grid gutter="xs" mb="sm">
          <Grid.Col span={{ base: 12, xs: 6, sm: 2 }}>
            <Select label="Month" placeholder="All months" data={MONTH_OPTIONS} value={recordMonth || null} onChange={(v) => setRecordMonth(v ?? '')} clearable allowDeselect size="xs" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, sm: 2 }}>
            <Select label="Year" data={YEAR_OPTIONS} value={recordYear} onChange={(v) => setRecordYear(v ?? String(currentYear))} size="xs" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 12, sm: 3 }}>
            <Select label="Barangay" placeholder="All barangays" data={BARANGAY_OPTIONS} value={recordBarangay || null} onChange={(v) => setRecordBarangay(v ?? '')} searchable clearable allowDeselect size="xs" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, sm: 2 }}>
            <Select
              label="Status"
              data={[
                { value: 'all', label: 'All' },
                { value: 'normal', label: 'Normal' },
                { value: 'high_risk', label: 'High Risk' },
              ]}
              value={recordStatus}
              onChange={(v) => { setRecordStatus(v ?? 'all'); setFilterStatus(v ?? 'all'); }}
              size="xs"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, sm: 2 }}>
            <Checkbox
              label="Due for visit"
              checked={dueForVisitOnly}
              onChange={(e) => setDueForVisitOnly(e.currentTarget.checked)}
              size="xs"
              mt={22}
            />
          </Grid.Col>
        </Grid>
        {hasAnyFilter && (
          <Group mb="sm" gap="xs">
            <Text size="xs" c="dimmed">Active:</Text>
            {useMonthFilter && <Badge size="sm" variant="light" color="teal">{MONTH_OPTIONS.find((m) => m.value === recordMonth)?.label} {recordYear}</Badge>}
            {recordBarangay && <Badge size="sm" variant="light" color="blue">{recordBarangay}</Badge>}
            {recordStatus === 'normal' && <Badge size="sm" variant="light" color="green">Normal</Badge>}
            {recordStatus === 'high_risk' && <Badge size="sm" variant="light" color="red">High Risk</Badge>}
            {dueForVisitOnly && <Badge size="sm" variant="light" color="orange">Due / Overdue</Badge>}
            <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }} onClick={clearAllFilters}>Clear all</Text>
          </Group>
        )}

        <TextInput leftSection={<Search size={16} />} placeholder="Search by name..." mb="sm" value={search} onChange={(e) => setSearch(e.target.value)} size="sm" />
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead bg="gray.1">
              <Table.Tr><Table.Th>Name</Table.Th><Table.Th>Age Group</Table.Th><Table.Th>Barangay</Table.Th><Table.Th>Last Visit</Table.Th><Table.Th>Status</Table.Th><Table.Th>Action</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((p) => {
                const latestVisit = getLatestPrenatalVisit(p.prenatal_visits);
                const lastVisit = latestVisit ? formatDate(latestVisit.date) : '-';
                const now = new Date();
                const isDue = isPatientDue(p, now.getMonth(), now.getFullYear());
                const statusBadges = (
                  <Group gap={6} wrap="wrap">
                    {p.is_high_risk ? <Badge size="sm" color="red">High Risk</Badge> : <Badge size="sm" color="green">Normal</Badge>}
                    {isDue && <Badge size="sm" color="orange">Due/Overdue</Badge>}
                  </Group>
                );
                return (
                  <Table.Tr key={p.id}>
                    <Table.Td fw={600}>{p.last_name}, {p.first_name}</Table.Td>
                    <Table.Td>{getAgeGroup(p.age)}</Table.Td>
                    <Table.Td>{p.barangay}</Table.Td>
                    <Table.Td c="dimmed">{lastVisit}</Table.Td>
                    <Table.Td>{statusBadges}</Table.Td>
                    <Table.Td>
                      <Group gap={5}>
                        <ActionIcon color="blue" variant="light" onClick={() => handleEditClick(p)}><Edit size={16} /></ActionIcon>
                        {isAdmin && <ActionIcon color="red" variant="light" onClick={() => handleDelete(p.id)}><Trash size={16} /></ActionIcon>}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
              {filtered.length === 0 && <Table.Tr><Table.Td colSpan={6} align="center">No records found</Table.Td></Table.Tr>}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>
    </Stack>
  );
}
