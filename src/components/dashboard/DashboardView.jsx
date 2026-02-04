import { Grid, Group, Paper, SimpleGrid, Stack, Table, Text, Title, Badge, Box, Button, ThemeIcon } from '@mantine/core';
import { FileText, Activity, Clock, Phone, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../lib/formatters';
import { isPatientDue, getLatestPrenatalVisit } from '../../lib/patientHelpers';

/** Format ISO timestamp to date (MM/DD/YYYY) for created_at/updated_at */
function formatIsoDate(iso) {
  if (!iso) return '';
  const datePart = typeof iso === 'string' ? iso.split('T')[0] : '';
  return datePart ? formatDate(datePart) : '';
}

export default function DashboardView({ patients = [], currentTime, handleAddClick, onFilterSelect }) {
  const safePatients = Array.isArray(patients) ? patients : [];
  const recentPatients = [...safePatients]
    .sort((a, b) => {
      const ta = new Date(a.updated_at || a.created_at || 0).getTime();
      const tb = new Date(b.updated_at || b.created_at || 0).getTime();
      return tb - ta;
    })
    .slice(0, 5);
  const highRiskCount = safePatients.filter((p) => p.is_high_risk).length;
  const currentMonth = currentTime.getMonth();
  const currentYear = currentTime.getFullYear();
  const currentMonthName = currentTime.toLocaleString('default', { month: 'long' });
  const duePatients = safePatients.filter((p) => isPatientDue(p, currentMonth, currentYear));
  const cardStyle = { transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' };
  const hoverStyle = { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };

  return (
    <Stack gap="lg">
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper className="dashboard-card" p="lg" radius="md" bg="teal.0">
            <Title order={2} c="teal.9">Welcome Back!</Title>
            <Group mt="xs">
              <ThemeIcon color="teal" variant="light" size="lg"><Clock size={20} /></ThemeIcon>
              <Text size="xl" fw={700} c="teal.8">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' | '}
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper className="dashboard-card" p="md" radius="md" bg="red.0" withBorder style={{ borderColor: 'red' }}>
            <Group mb="xs"><Phone size={20} color="red" /><Text fw={700} c="red.9">EMERGENCY HOTLINES</Text></Group>
            <Stack gap={2}>
              <Text size="sm" fw={600}>City Health Office: <span style={{ fontWeight: 400 }}>0912-345-6789</span></Text>
              <Text size="sm" fw={600}>Batangas Med Center: <span style={{ fontWeight: 400 }}>(043) 723-0165</span></Text>
              <Text size="sm" fw={600}>Ambulance: <span style={{ fontWeight: 400 }}>911</span></Text>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <Paper className="dashboard-card" shadow="sm" p="lg" radius="md" bg="gradient" style={{ background: 'linear-gradient(135deg, #e6fcf5 0%, #fff 100%)', borderLeft: '5px solid #0ca678', ...cardStyle }}
          onClick={() => onFilterSelect('all')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = hoverStyle.transform; e.currentTarget.style.boxShadow = hoverStyle.boxShadow; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)'; }}
        >
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">Total Patients</Text>
              <Text size="2.5rem" fw={800} c="teal">{safePatients.length}</Text>
            </div>
            <FileText size={40} color="#0ca678" opacity={0.3} />
          </Group>
        </Paper>

        <Paper className="dashboard-card" shadow="sm" p="lg" radius="md" bg="gradient" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)', borderLeft: '5px solid #fa5252', ...cardStyle }}
          onClick={() => onFilterSelect('high_risk')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = hoverStyle.transform; e.currentTarget.style.boxShadow = hoverStyle.boxShadow; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)'; }}
        >
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">High-Risk Cases</Text>
              <Text size="2.5rem" fw={800} c="red">{highRiskCount}</Text>
            </div>
            <Activity size={40} color="#fa5252" opacity={0.3} />
          </Group>
        </Paper>

        <Paper className="dashboard-card" shadow="sm" p="lg" radius="md" bg="gradient" style={{ background: 'linear-gradient(135deg, #fff9db 0%, #fff 100%)', borderLeft: '5px solid #fd7e14', ...cardStyle }}
          onClick={() => onFilterSelect('due')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = hoverStyle.transform; e.currentTarget.style.boxShadow = hoverStyle.boxShadow; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)'; }}
        >
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">Due / Overdue</Text>
              <Text size="2.5rem" fw={800} c="orange">{duePatients.length}</Text>
            </div>
            <Clock size={40} color="#fd7e14" opacity={0.3} />
          </Group>
        </Paper>
      </SimpleGrid>

      {duePatients.length > 0 && (
        <Paper className="dashboard-card" shadow="md" p="md" radius="md" withBorder mb="lg" bg="orange.0" style={{ borderColor: 'orange' }}>
          <Group mb="xs">
            <AlertTriangle size={20} color="orange" />
            <Text fw={700} c="orange.9">Upcoming Visits Required ({currentMonthName})</Text>
          </Group>
          <Text size="sm" mb="sm" c="orange.8">The following patients need to be contacted for their monthly checkup:</Text>
          <Grid>
            {duePatients.map((p) => {
              const latestVisit = getLatestPrenatalVisit(p.prenatal_visits);
              const lastVisitText = latestVisit ? formatDate(latestVisit.date) : 'No visits yet';
              return (
                <Grid.Col key={p.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Paper withBorder p="sm" bg="white" shadow="xs" radius="md">
                    <Text size="md" fw={700} c="dark">{p.last_name}, {p.first_name}</Text>
                    <Text size="xs" c="dimmed" mb={5}>Brgy: {p.barangay}</Text>
                    <Badge color="orange" variant="light" size="sm">Last Visit: {lastVisitText}</Badge>
                  </Paper>
                </Grid.Col>
              );
            })}
          </Grid>
        </Paper>
      )}

      <Paper className="dashboard-card" shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4} c="dimmed">Recently Added / Modified</Title>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Barangay</Table.Th>
                <Table.Th>Last Visit</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Modified</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recentPatients.map((p) => {
                const latestVisit = getLatestPrenatalVisit(p.prenatal_visits);
                const lastVisitText = latestVisit ? formatDate(latestVisit.date) : '—';
                const createdText = formatIsoDate(p.created_at) || '—';
                const updatedAt = p.updated_at;
                const createdAt = p.created_at;
                const wasModified = updatedAt && createdAt && updatedAt !== createdAt;
                const modifiedText = wasModified ? formatIsoDate(updatedAt) : '—';
                return (
                  <Table.Tr key={p.id}>
                    <Table.Td fw={500}>{p.last_name}, {p.first_name}</Table.Td>
                    <Table.Td>{p.barangay}</Table.Td>
                    <Table.Td c="dimmed">{lastVisitText}</Table.Td>
                    <Table.Td c="dimmed">{createdText}</Table.Td>
                    <Table.Td c="dimmed">{modifiedText}</Table.Td>
                    <Table.Td>{p.is_high_risk ? <Badge color="red">High Risk</Badge> : <Badge color="green">Normal</Badge>}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Box>
        <Button variant="subtle" color="teal" fullWidth mt="md" onClick={() => onFilterSelect('all')}>View All Records</Button>
      </Paper>
    </Stack>
  );
}
