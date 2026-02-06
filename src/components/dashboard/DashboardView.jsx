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
  const allDuePatients = safePatients.filter((p) => isPatientDue(p, currentMonth, currentYear));
  const duePatients = allDuePatients
    .sort((a, b) => {
      const aLatestVisit = getLatestPrenatalVisit(a.prenatal_visits);
      const bLatestVisit = getLatestPrenatalVisit(b.prenatal_visits);
      
      // Patients with no visits are most urgent
      if (!aLatestVisit && bLatestVisit) return -1;
      if (aLatestVisit && !bLatestVisit) return 1;
      if (!aLatestVisit && !bLatestVisit) return 0;
      
      // Sort by last visit date (older = more overdue = higher priority)
      const aDate = aLatestVisit?.date ? new Date(aLatestVisit.date).getTime() : 0;
      const bDate = bLatestVisit?.date ? new Date(bLatestVisit.date).getTime() : 0;
      return aDate - bDate; // Older dates come first
    })
    .slice(0, 5); // Limit to top 5
  const cardStyle = { 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
    cursor: 'pointer',
  };
  const hoverStyle = { 
    transform: 'translateY(-6px)', 
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
  };

  return (
    <Stack gap="lg">
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper 
            className="dashboard-card hover-lift" 
            p="xl" 
            radius="lg" 
            style={{ 
              background: 'linear-gradient(135deg, #e6fcf5 0%, #ffffff 100%)',
              border: '1px solid rgba(12, 166, 120, 0.1)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Title order={2} c="teal.9" mb="xs" style={{ fontWeight: 800 }}>Welcome Back!</Title>
            <Group mt="md" gap="md">
              <ThemeIcon 
                color="teal" 
                variant="light" 
                size="xl"
                radius="md"
                style={{
                  boxShadow: '0 2px 8px rgba(12, 166, 120, 0.2)',
                }}
              >
                <Clock size={22} />
              </ThemeIcon>
              <Text size="xl" fw={700} c="teal.8" style={{ letterSpacing: '-0.01em' }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' | '}
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper 
            className="dashboard-card hover-lift" 
            p="lg" 
            radius="lg" 
            style={{ 
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
              border: '2px solid rgba(250, 82, 82, 0.2)',
              boxShadow: '0 4px 6px -1px rgba(250, 82, 82, 0.15), 0 2px 4px -1px rgba(250, 82, 82, 0.1)',
            }}
          >
            <Group mb="md" gap="xs">
              <ThemeIcon color="red" variant="light" size="md" radius="md">
                <Phone size={18} />
              </ThemeIcon>
              <Text fw={700} c="red.9" size="sm" style={{ letterSpacing: '0.05em' }}>EMERGENCY HOTLINES</Text>
            </Group>
            <Stack gap="xs">
              <Text size="sm" fw={600} c="dark.7">
                City Health Office: <Text component="span" fw={400} c="dark.6">0912-345-6789</Text>
              </Text>
              <Text size="sm" fw={600} c="dark.7">
                Batangas Med Center: <Text component="span" fw={400} c="dark.6">(043) 723-0165</Text>
              </Text>
              <Text size="sm" fw={600} c="dark.7">
                Ambulance: <Text component="span" fw={400} c="dark.6">911</Text>
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <Paper 
          className="dashboard-card" 
          shadow="md" 
          p="xl" 
          radius="lg" 
          style={{ 
            background: 'linear-gradient(135deg, #e6fcf5 0%, #ffffff 100%)', 
            borderLeft: '4px solid #0ca678',
            border: '1px solid rgba(12, 166, 120, 0.1)',
            ...cardStyle 
          }}
          onClick={() => onFilterSelect('all')}
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = hoverStyle.transform; 
            e.currentTarget.style.boxShadow = hoverStyle.boxShadow; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'none'; 
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; 
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.1em' }}>
                Total Patients
              </Text>
              <Text size="2.5rem" fw={800} c="teal" style={{ lineHeight: 1.2, marginTop: '4px' }}>
                {safePatients.length}
              </Text>
            </div>
            <ThemeIcon 
              color="teal" 
              variant="light" 
              size="xl" 
              radius="md"
              style={{
                opacity: 0.8,
                boxShadow: '0 2px 8px rgba(12, 166, 120, 0.2)',
              }}
            >
              <FileText size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper 
          className="dashboard-card" 
          shadow="md" 
          p="xl" 
          radius="lg" 
          style={{ 
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)', 
            borderLeft: '4px solid #fa5252',
            border: '1px solid rgba(250, 82, 82, 0.1)',
            ...cardStyle 
          }}
          onClick={() => onFilterSelect('high_risk')}
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = hoverStyle.transform; 
            e.currentTarget.style.boxShadow = hoverStyle.boxShadow; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'none'; 
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; 
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.1em' }}>
                High-Risk Cases
              </Text>
              <Text size="2.5rem" fw={800} c="red" style={{ lineHeight: 1.2, marginTop: '4px' }}>
                {highRiskCount}
              </Text>
            </div>
            <ThemeIcon 
              color="red" 
              variant="light" 
              size="xl" 
              radius="md"
              style={{
                opacity: 0.8,
                boxShadow: '0 2px 8px rgba(250, 82, 82, 0.2)',
              }}
            >
              <Activity size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper 
          className="dashboard-card" 
          shadow="md" 
          p="xl" 
          radius="lg" 
          style={{ 
            background: 'linear-gradient(135deg, #fff9db 0%, #ffffff 100%)', 
            borderLeft: '4px solid #fd7e14',
            border: '1px solid rgba(253, 126, 20, 0.1)',
            ...cardStyle 
          }}
          onClick={() => onFilterSelect('due')}
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = hoverStyle.transform; 
            e.currentTarget.style.boxShadow = hoverStyle.boxShadow; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'none'; 
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; 
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.1em' }}>
                Due / Overdue
              </Text>
              <Text size="2.5rem" fw={800} c="orange" style={{ lineHeight: 1.2, marginTop: '4px' }}>
                {duePatients.length}
              </Text>
            </div>
            <ThemeIcon 
              color="orange" 
              variant="light" 
              size="xl" 
              radius="md"
              style={{
                opacity: 0.8,
                boxShadow: '0 2px 8px rgba(253, 126, 20, 0.2)',
              }}
            >
              <Clock size={32} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {duePatients.length > 0 && (
        <Paper 
          className="dashboard-card" 
          shadow="md" 
          p="lg" 
          radius="lg" 
          mb="lg" 
          style={{ 
            background: 'linear-gradient(135deg, #fff9db 0%, #ffffff 100%)',
            border: '2px solid rgba(253, 126, 20, 0.2)',
            boxShadow: '0 4px 6px -1px rgba(253, 126, 20, 0.15), 0 2px 4px -1px rgba(253, 126, 20, 0.1)',
          }}
        >
          <Group mb="md" gap="xs">
            <ThemeIcon color="orange" variant="light" size="md" radius="md">
              <AlertTriangle size={18} />
            </ThemeIcon>
            <Text fw={700} c="orange.9" size="lg">
              Upcoming Visits Required ({currentMonthName})
            </Text>
          </Group>
          <Text size="sm" mb="md" c="orange.8" style={{ lineHeight: 1.6 }}>
            The following patients need to be contacted for their monthly checkup:
          </Text>
          <Grid>
            {duePatients.map((p) => {
              const latestVisit = getLatestPrenatalVisit(p.prenatal_visits);
              const lastVisitText = latestVisit ? formatDate(latestVisit.date) : 'No visits yet';
              return (
                <Grid.Col key={p.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Paper 
                    withBorder 
                    p="md" 
                    bg="white" 
                    shadow="sm" 
                    radius="md"
                    style={{
                      border: '1px solid rgba(253, 126, 20, 0.15)',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover-lift"
                  >
                    <Text size="md" fw={700} c="dark" mb={4}>{p.last_name}, {p.first_name}</Text>
                    <Text size="xs" c="dimmed" mb={8}>Brgy: {p.barangay}</Text>
                    <Badge color="orange" variant="light" size="sm" radius="md" style={{ fontWeight: 600 }}>
                      Last Visit: {lastVisitText}
                    </Badge>
                  </Paper>
                </Grid.Col>
              );
            })}
          </Grid>
          <Button 
            variant="subtle" 
            color="orange" 
            fullWidth 
            mt="md" 
            onClick={() => onFilterSelect('due')}
            style={{ fontWeight: 600 }}
          >
            View All Due Patients
          </Button>
        </Paper>
      )}

      <Paper 
        className="dashboard-card" 
        shadow="md" 
        p="lg" 
        radius="lg" 
        withBorder
        style={{
          border: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Group justify="space-between" mb="md">
          <Title order={4} c="dimmed" fw={700}>Recently Added / Modified</Title>
        </Group>
        <Box style={{ overflowX: 'auto', borderRadius: '8px' }}>
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
                    <Table.Td fw={600}>{p.last_name}, {p.first_name}</Table.Td>
                    <Table.Td>{p.barangay}</Table.Td>
                    <Table.Td c="dimmed">{lastVisitText}</Table.Td>
                    <Table.Td c="dimmed">{createdText}</Table.Td>
                    <Table.Td c="dimmed">{modifiedText}</Table.Td>
                    <Table.Td>
                      {p.is_high_risk ? (
                        <Badge color="red" variant="light" radius="md" style={{ fontWeight: 600 }}>
                          High Risk
                        </Badge>
                      ) : (
                        <Badge color="green" variant="light" radius="md" style={{ fontWeight: 600 }}>
                          Normal
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Box>
        <Button 
          variant="subtle" 
          color="teal" 
          fullWidth 
          mt="md" 
          onClick={() => onFilterSelect('all')}
          style={{ fontWeight: 600 }}
        >
          View All Records
        </Button>
      </Paper>
    </Stack>
  );
}
