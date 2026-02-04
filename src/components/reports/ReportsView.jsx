import { useState } from 'react';
import { Stack, Title, SimpleGrid, Paper, Group, Text, Button, ThemeIcon, Select, Grid } from '@mantine/core';
import { FileText, Download } from 'lucide-react';
import { exportToExcel } from '../../lib/fhsisExport';
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
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => ({
  value: String(y),
  label: String(y),
}));

const BARANGAY_OPTIONS = [{ value: '', label: 'All barangays' }, ...BATANGAS_BARANGAYS];

export default function ReportsView({ patients }) {
  const [reportMonth, setReportMonth] = useState(String(currentDate.getMonth() + 1));
  const [reportYear, setReportYear] = useState(String(currentYear));
  const [reportBarangay, setReportBarangay] = useState('');

  const monthNum = reportMonth && reportMonth !== '' ? parseInt(reportMonth, 10) : null;
  const yearNum = reportYear ? parseInt(reportYear, 10) : null;
  const useMonthFilter = monthNum >= 1 && monthNum <= 12 && yearNum != null;
  let filteredPatients = useMonthFilter
    ? filterPatientsByReportMonth(patients || [], yearNum, monthNum)
    : patients || [];
  if (reportBarangay) {
    filteredPatients = filteredPatients.filter((p) => p.barangay === reportBarangay);
  }

  const handleExport = () => {
    const options = {
      ...(useMonthFilter ? { reportYear: yearNum, reportMonth: monthNum } : {}),
      ...(reportBarangay ? { reportBarangay } : {}),
    };
    exportToExcel(filteredPatients, options);
  };

  return (
    <Stack>
      <Title order={3}>Maternal Care Reports</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Paper withBorder p="lg" radius="md" shadow="sm">
          <Group mb="md">
            <ThemeIcon size="xl" color="pink" variant="light"><FileText size={24} /></ThemeIcon>
            <Text fw={700} size="lg">FHSIS M1 (Maternal Care)</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Standard FHSIS layout. Includes indicators for Prenatal Care, Immunization (Td), Nutrition (BMI), and Deliveries aggregated by age group (10-14, 15-19, 20-49).
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Filter by report month (DOH-style): include only patients with activity in the selected month (registration, delivery, visits, Td, supplements, labs, or PNC in that month).
          </Text>
          <Grid mb="lg">
            <Grid.Col span={{ base: 12, xs: 6 }}>
              <Select
                label="Month"
                placeholder="All months"
                data={MONTH_OPTIONS}
                value={reportMonth}
                onChange={(v) => setReportMonth(v ?? '')}
                allowDeselect
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6 }}>
              <Select
                label="Year"
                data={YEAR_OPTIONS}
                value={reportYear}
                onChange={(v) => setReportYear(v ?? String(currentYear))}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Barangay"
                placeholder="All barangays"
                data={BARANGAY_OPTIONS}
                value={reportBarangay}
                onChange={(v) => setReportBarangay(v ?? '')}
                searchable
                allowDeselect
                clearable
              />
            </Grid.Col>
          </Grid>
          {(useMonthFilter || reportBarangay) && (
            <Text size="sm" c="dimmed" mb="sm">
              {filteredPatients.length} record(s)
              {useMonthFilter && ` with activity in ${MONTH_OPTIONS.find((m) => m.value === reportMonth)?.label} ${reportYear}`}
              {reportBarangay && ` in ${reportBarangay}`}.
            </Text>
          )}
          <Button fullWidth color="pink" leftSection={<Download size={16} />} onClick={handleExport}>
            Download Excel Report
          </Button>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
