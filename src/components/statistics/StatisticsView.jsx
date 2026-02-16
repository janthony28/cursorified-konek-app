import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Grid, Group, Loader, Paper, Stack, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { AlertTriangle, BarChart3, HeartPulse, PieChart as PieChartIcon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchStatisticsData } from '../../services/statisticsService';

const CHART_COLORS = ['#0ca678', '#f08c00', '#228be6', '#fa5252', '#845ef7', '#12b886', '#e8590c', '#2f9e44'];

function fmtPct(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function ChartPaper({ title, subtitle, icon, children }) {
  return (
    <Paper withBorder radius="md" p="md" h="100%">
      <Group justify="space-between" mb="xs">
        <div>
          <Text fw={700}>{title}</Text>
          {subtitle ? <Text size="xs" c="dimmed">{subtitle}</Text> : null}
        </div>
        <ThemeIcon variant="light" color="teal">
          {icon}
        </ThemeIcon>
      </Group>
      <div style={{ width: '100%', height: 320 }}>{children}</div>
    </Paper>
  );
}

function TopRows({ rows, valueLabel }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (!safeRows.length) return <Text size="sm" c="dimmed">No records yet.</Text>;
  return (
    <Stack gap={8}>
      {safeRows.slice(0, 10).map((row) => (
        <Group key={`${row.barangay}-${row.count}`} justify="space-between">
          <Text size="sm">{row.barangay}</Text>
          <Badge color="orange" variant="light">{row.count} {valueLabel}</Badge>
        </Group>
      ))}
    </Stack>
  );
}

export default function StatisticsView({ isAdmin, userId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchStatisticsData({ isAdmin, userId });
        if (!mounted) return;
        setStats(data);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load statistics.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isAdmin, userId]);

  const topTeenageBarangays = useMemo(
    () => (stats?.criticalAlerts?.teenagePregnancyByBarangay || []).slice(0, 10),
    [stats]
  );

  // Merge barangays with the same count value for "Total Pregnant Women per Barangay"
  const mergedPregnantWomenPerBarangay = useMemo(() => {
    const data = stats?.ancCoverage?.pregnantWomenPerBarangay || [];
    const grouped = new Map();
    
    data.forEach(({ barangay, count }) => {
      const key = count;
      if (!grouped.has(key)) {
        grouped.set(key, { count, barangays: [] });
      }
      grouped.get(key).barangays.push(barangay);
    });
    
    return Array.from(grouped.entries())
      .map(([count, { barangays }]) => ({
        count: Number(count),
        barangay: barangays.length === 1 ? barangays[0] : `${barangays.length} barangays`,
        barangays: barangays,
      }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  // Merge barangays with the same coveragePct value for "First Trimester ANC Coverage"
  const mergedFirstTrimesterCoverage = useMemo(() => {
    const data = stats?.ancCoverage?.firstTrimesterCoveragePerBarangay || [];
    const grouped = new Map();
    
    data.forEach(({ barangay, coveragePct, numerator, denominator }) => {
      const key = coveragePct;
      if (!grouped.has(key)) {
        grouped.set(key, { coveragePct, numerator: 0, denominator: 0, barangays: [] });
      }
      const group = grouped.get(key);
      group.barangays.push(barangay);
      group.numerator += numerator;
      group.denominator += denominator;
    });
    
    return Array.from(grouped.entries())
      .map(([coveragePct, { numerator, denominator, barangays }]) => ({
        coveragePct: Number(coveragePct),
        numerator,
        denominator,
        barangay: barangays.length === 1 ? barangays[0] : `${barangays.length} barangays`,
        barangays: barangays,
      }))
      .sort((a, b) => b.coveragePct - a.coveragePct);
  }, [stats]);

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader color="teal" />
      </Group>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Unable to load statistics">
        {error}
      </Alert>
    );
  }

  const ancCompletion = stats?.ancCoverage?.ancCompletionOverall || [];
  const highRiskDistribution = stats?.highRiskAnalysis?.distribution || [];
  const topRiskFactors = stats?.highRiskAnalysis?.topRiskFactors || [];
  const facilityBirthsPerBarangay = stats?.deliveryAndPostpartum?.facilityBirthsPerBarangay || [];
  const postpartumCoverage = stats?.deliveryAndPostpartum?.postpartumVisit?.coveragePct || 0;
  const registrationRows = stats?.criticalAlerts?.birthRegistrationByBarangay || [];

  return (
    <Stack gap="lg">
      <div>
        <Title order={3}>Statistics Dashboard</Title>
        <Text c="dimmed" size="sm">
          All values are dynamically aggregated from current records in `maternal_records`.
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">Total Mothers</Text>
            <Title order={2}>{stats?.totals?.mothers || 0}</Title>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">1st Trimester ANC Coverage</Text>
            <Title order={2}>{fmtPct(stats?.percentages?.firstTrimesterCoverage)}</Title>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">High-Risk Rate</Text>
            <Title order={2}>{fmtPct(stats?.percentages?.highRiskRate)}</Title>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">Postpartum Visit Coverage</Text>
            <Title order={2}>{fmtPct(postpartumCoverage)}</Title>
          </Paper>
        </Grid.Col>
      </Grid>

      <Title order={4}>1. ANC & Coverage</Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ChartPaper
            title="Total Pregnant Women per Barangay"
            subtitle="Count of maternal records grouped by barangay"
            icon={<BarChart3 size={16} />}
          >
            <ResponsiveContainer>
              <BarChart data={mergedPregnantWomenPerBarangay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="barangay" hide />
                <YAxis allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                            {data.barangays.length === 1 ? data.barangay : `${data.count} Women`}
                          </p>
                          {data.barangays.length > 1 && (
                            <div style={{ marginTop: '4px' }}>
                              <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: 'bold' }}>Barangays:</p>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                                {data.barangays.map((bg, idx) => (
                                  <li key={idx}>{bg}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                            Count: {data.count}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Women" fill="#0ca678" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPaper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ChartPaper
            title="First Trimester ANC Coverage"
            subtitle="% who started ANC in first trimester by barangay"
            icon={<BarChart3 size={16} />}
          >
            <ResponsiveContainer>
              <BarChart data={mergedFirstTrimesterCoverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="barangay" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                            {data.barangays.length === 1 ? data.barangay : `${data.coveragePct}% Coverage`}
                          </p>
                          {data.barangays.length > 1 && (
                            <div style={{ marginTop: '4px' }}>
                              <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: 'bold' }}>Barangays:</p>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                                {data.barangays.map((bg, idx) => (
                                  <li key={idx}>{bg}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                            Coverage: {data.coveragePct}%
                          </p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666' }}>
                            ({data.numerator}/{data.denominator})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="coveragePct" name="Coverage %" fill="#228be6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPaper>
        </Grid.Col>
        <Grid.Col span={12}>
          <ChartPaper
            title="ANC Completion"
            subtitle='Less than 4 visits, at least 4 visits, and completed 8 ANC visits (sorted by % descending)'
            icon={<BarChart3 size={16} />}
          >
            <ResponsiveContainer>
              <BarChart data={ancCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                <Bar dataKey="percent" name="Coverage %" fill="#12b886" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPaper>
        </Grid.Col>
      </Grid>

      <Title order={4}>2. High Risk Analysis</Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <ChartPaper
            title="High Risk Rate"
            subtitle="High risk vs normal pregnancies"
            icon={<PieChartIcon size={16} />}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie data={highRiskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                  {highRiskDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartPaper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <ChartPaper
            title="Top Reasons for High Risk"
            subtitle="Based on risk flags and high-risk reason inputs"
            icon={<HeartPulse size={16} />}
          >
            <ResponsiveContainer>
              <BarChart data={topRiskFactors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="reason" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Cases" fill="#fa5252" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPaper>
        </Grid.Col>
      </Grid>

      <Title order={4}>3. Delivery & Postpartum</Title>
      <Grid>
        <Grid.Col span={12}>
          <ChartPaper
            title="Facility-based Births by Barangay"
            subtitle="% deliveries in facility vs home"
            icon={<BarChart3 size={16} />}
          >
            <ResponsiveContainer>
              <BarChart data={facilityBirthsPerBarangay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="barangay" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="facilityPct" stackId="a" name="Facility %" fill="#2f9e44" />
                <Bar dataKey="homePct" stackId="a" name="Home %" fill="#f08c00" />
              </BarChart>
            </ResponsiveContainer>
          </ChartPaper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">Postpartum (at least 1 visit)</Text>
            <Title order={2}>{fmtPct(postpartumCoverage)}</Title>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">Prenatal IFA Compliance</Text>
            <Title order={2}>{fmtPct(stats?.percentages?.prenatalIfaCompliance)}</Title>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">Postpartum IFA Compliance</Text>
            <Title order={2}>{fmtPct(stats?.percentages?.postpartumIfaCompliance)}</Title>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder radius="md" p="md">
            <Text size="xs" c="dimmed">Vitamin A Completion</Text>
            <Title order={2}>{fmtPct(stats?.percentages?.vitACompliance)}</Title>
          </Paper>
        </Grid.Col>
      </Grid>

      <Title order={4}>4. Critical Alerts</Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder radius="md" p="md" h="100%">
            <Group mb="sm">
              <ThemeIcon color="orange" variant="light">
                <AlertTriangle size={16} />
              </ThemeIcon>
              <Text fw={700}>Teenage Pregnancy (Top Barangays)</Text>
            </Group>
            <TopRows rows={topTeenageBarangays} valueLabel="cases" />
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder radius="md" p="md">
        <Text fw={700} mb="xs">Birth Registration Status per Barangay</Text>
        <Text size="xs" c="dimmed" mb="md">
          Unknown means no birth registration field/value was found in the current record.
        </Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Barangay</Table.Th>
              <Table.Th>Registered</Table.Th>
              <Table.Th>Unregistered</Table.Th>
              <Table.Th>Unknown</Table.Th>
              <Table.Th>Total</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {registrationRows.map((row) => (
              <Table.Tr key={row.barangay}>
                <Table.Td>{row.barangay}</Table.Td>
                <Table.Td>{row.registered}</Table.Td>
                <Table.Td>{row.unregistered}</Table.Td>
                <Table.Td>{row.unknown}</Table.Td>
                <Table.Td>{row.total}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
