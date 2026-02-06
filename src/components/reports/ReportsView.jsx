import { useState } from 'react';
import { Stack, Title, SimpleGrid, Paper, Group, Text, Button, ThemeIcon, Select, Grid } from '@mantine/core';
import { FileText, Download } from 'lucide-react';
import { exportToExcel, exportMaternalTcl } from '../../lib/fhsisExport';
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
  // FHSIS M1 tile: its own filters
  const [fhsisMonth, setFhsisMonth] = useState(String(currentDate.getMonth() + 1));
  const [fhsisYear, setFhsisYear] = useState(String(currentYear));
  const [fhsisBarangay, setFhsisBarangay] = useState('');

  // Maternal TCL tile: its own filters
  const [tclMonth, setTclMonth] = useState(String(currentDate.getMonth() + 1));
  const [tclYear, setTclYear] = useState(String(currentYear));
  const [tclBarangay, setTclBarangay] = useState('');

  const fhsisMonthNum = fhsisMonth && fhsisMonth !== '' ? parseInt(fhsisMonth, 10) : null;
  const fhsisYearNum = fhsisYear ? parseInt(fhsisYear, 10) : null;
  const fhsisUseMonth = fhsisMonthNum >= 1 && fhsisMonthNum <= 12 && fhsisYearNum != null;
  let filteredFhsis = fhsisUseMonth
    ? filterPatientsByReportMonth(patients || [], fhsisYearNum, fhsisMonthNum)
    : patients || [];
  if (fhsisBarangay) filteredFhsis = filteredFhsis.filter((p) => p.barangay === fhsisBarangay);

  const tclMonthNum = tclMonth && tclMonth !== '' ? parseInt(tclMonth, 10) : null;
  const tclYearNum = tclYear ? parseInt(tclYear, 10) : null;
  const tclUseMonth = tclMonthNum >= 1 && tclMonthNum <= 12 && tclYearNum != null;
  let filteredTcl = tclUseMonth
    ? filterPatientsByReportMonth(patients || [], tclYearNum, tclMonthNum)
    : patients || [];
  if (tclBarangay) filteredTcl = filteredTcl.filter((p) => p.barangay === tclBarangay);

  const handleExport = () => {
    const options = {
      ...(fhsisUseMonth ? { reportYear: fhsisYearNum, reportMonth: fhsisMonthNum } : {}),
      ...(fhsisBarangay ? { reportBarangay: fhsisBarangay } : {}),
    };
    exportToExcel(filteredFhsis, options);
  };

  const handleExportMaternalTcl = () => {
    const options = {
      ...(tclUseMonth ? { reportYear: tclYearNum, reportMonth: tclMonthNum } : {}),
      ...(tclBarangay ? { reportBarangay: tclBarangay } : {}),
    };
    exportMaternalTcl(filteredTcl, options);
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
          <Grid mb="lg">
            <Grid.Col span={{ base: 12, xs: 6 }}>
              <Select
                label="Month"
                placeholder="All months"
                data={MONTH_OPTIONS}
                value={fhsisMonth}
                onChange={(v) => setFhsisMonth(v ?? '')}
                allowDeselect
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6 }}>
              <Select
                label="Year"
                data={YEAR_OPTIONS}
                value={fhsisYear}
                onChange={(v) => setFhsisYear(v ?? String(currentYear))}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Barangay"
                placeholder="All barangays"
                data={BARANGAY_OPTIONS}
                value={fhsisBarangay}
                onChange={(v) => setFhsisBarangay(v ?? '')}
                searchable
                allowDeselect
                clearable
              />
            </Grid.Col>
          </Grid>
          {(fhsisUseMonth || fhsisBarangay) && (
            <Text size="sm" c="dimmed" mb="sm">
              {filteredFhsis.length} record(s)
              {fhsisUseMonth && ` with activity in ${MONTH_OPTIONS.find((m) => m.value === fhsisMonth)?.label} ${fhsisYear}`}
              {fhsisBarangay && ` in ${fhsisBarangay}`}.
            </Text>
          )}
          <Button fullWidth color="pink" leftSection={<Download size={16} />} onClick={handleExport}>
            Download FHSIS M1 Excel
          </Button>
        </Paper>

        <Paper withBorder p="lg" radius="md" shadow="sm">
          <Group mb="md">
            <ThemeIcon size="xl" color="teal" variant="light">
              <FileText size={24} />
            </ThemeIcon>
            <Text fw={700} size="lg">
              Maternal TCL
            </Text>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Target Client List layout for maternal care and services, exported as a spreadsheet using the official TCL format.
          </Text>
          <Grid mb="lg">
            <Grid.Col span={{ base: 12, xs: 6 }}>
              <Select
                label="Month"
                placeholder="All months"
                data={MONTH_OPTIONS}
                value={tclMonth}
                onChange={(v) => setTclMonth(v ?? '')}
                allowDeselect
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6 }}>
              <Select
                label="Year"
                data={YEAR_OPTIONS}
                value={tclYear}
                onChange={(v) => setTclYear(v ?? String(currentYear))}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Barangay"
                placeholder="All barangays"
                data={BARANGAY_OPTIONS}
                value={tclBarangay}
                onChange={(v) => setTclBarangay(v ?? '')}
                searchable
                allowDeselect
                clearable
              />
            </Grid.Col>
          </Grid>
          {(tclUseMonth || tclBarangay) && (
            <Text size="sm" c="dimmed" mb="sm">
              {filteredTcl.length} record(s)
              {tclUseMonth && ` with activity in ${MONTH_OPTIONS.find((m) => m.value === tclMonth)?.label} ${tclYear}`}
              {tclBarangay && ` in ${tclBarangay}`}.
            </Text>
          )}
          <Button fullWidth color="teal" leftSection={<Download size={16} />} onClick={handleExportMaternalTcl}>
            Download Maternal TCL
          </Button>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
