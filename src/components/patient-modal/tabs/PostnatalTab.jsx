import { Paper, Box, Stack, Group, Grid, Input, NumberInput, Select, Button, Table, ActionIcon, Text, Progress, Divider, Badge, TextInput } from '@mantine/core';
import { Trash } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';

export default function PostnatalTab({
  formData,
  setFormData,
  newPostpartumLog,
  setNewPostpartumLog,
  addPostpartumLog,
  removePostpartumLog,
  handlePncDateChange,
  postpartumProgress,
}) {
  const pncDatesFilled = [formData.pnc_date_1, formData.pnc_date_2, formData.pnc_date_3, formData.pnc_date_4].filter(Boolean).length;
  const is4PncCompleted = pncDatesFilled === 4;
  const isPostpartumIfaCompleted = postpartumProgress >= 100;
  const isVitACompleted = !!(formData.vit_a_completed_date && String(formData.vit_a_completed_date).trim());

  return (
    <Grid grow>
      <Grid.Col span={5}>
        <Paper withBorder radius="md" overflow="hidden" h="100%">
          <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
            <Text size="sm" fw={700} c="blue.9" align="center">Date of Postnatal Care (4PNC)</Text>
          </Box>
          <Stack p="sm" gap="sm">
            <Input.Wrapper label="Contact 1 (within 24 hrs)"><Input type="date" value={formData.pnc_date_1 || ''} onChange={(e) => handlePncDateChange('pnc_date_1', e.target.value)} /></Input.Wrapper>
            <Input.Wrapper label="Contact 2 (on day 3)"><Input type="date" value={formData.pnc_date_2 || ''} onChange={(e) => handlePncDateChange('pnc_date_2', e.target.value)} /></Input.Wrapper>
            <Input.Wrapper label="Contact 3 (between 7-14 days)"><Input type="date" value={formData.pnc_date_3 || ''} onChange={(e) => handlePncDateChange('pnc_date_3', e.target.value)} /></Input.Wrapper>
            <Input.Wrapper label="Contact 4 (6 weeks after birth)"><Input type="date" value={formData.pnc_date_4 || ''} onChange={(e) => handlePncDateChange('pnc_date_4', e.target.value)} /></Input.Wrapper>
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb={4}>Completed 4PNC?</Text>
              <Text size="sm" fw={500} c={is4PncCompleted ? 'green' : 'dimmed'}>{is4PncCompleted ? 'Yes' : 'No'}</Text>
            </Box>
            <TextInput label="Remarks" placeholder="Optional" value={formData.pnc_remarks || ''} onChange={(e) => setFormData({ ...formData, pnc_remarks: e.target.value })} />
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={7}>
        <Paper withBorder radius="md" overflow="hidden" h="100%">
          <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
            <Text size="sm" fw={700} c="blue.9" align="center">Postpartum Supplementation</Text>
          </Box>
          <Stack p="sm" gap="md">
            <Box p="xs" bg="gray.0" style={{ borderRadius: '4px' }}>
              <Text size="xs" fw={700} c="dimmed" mb="xs" align="center">Iron with Folic Acid (IFA)</Text>
              <Text size="xs" align="center" c="dimmed" mb={5}>Goal: 90 Tablets</Text>
              <Progress value={postpartumProgress} color={postpartumProgress >= 100 ? 'green' : 'blue'} size="lg" radius="xl" mb="md" />
              {postpartumProgress >= 100 && <Badge color="green" mb="xs">COMPLETED</Badge>}

              <Divider mb="sm" />
              <Stack gap="xs">
                <Group grow>
                  <Input type="date" value={newPostpartumLog.date} onChange={(e) => setNewPostpartumLog({ ...newPostpartumLog, date: e.target.value })} />
                  <NumberInput placeholder="Tabs" value={newPostpartumLog.count} onChange={(v) => setNewPostpartumLog({ ...newPostpartumLog, count: v })} />
                </Group>
                <Select placeholder="Remarks (Optional)" data={[{ value: 'Trans In', label: 'A - Trans In' }, { value: 'Trans Out', label: 'B - Trans Out before 4PNC' }]} value={newPostpartumLog.remarks} onChange={(v) => setNewPostpartumLog({ ...newPostpartumLog, remarks: v })} clearable />
                <Button onClick={addPostpartumLog} size="xs" variant="light" fullWidth>+ Add Log</Button>
              </Stack>

              <Box mt="md" style={{ maxHeight: 120, overflowY: 'auto' }}>
                <Table striped withTableBorder>
                  <Table.Tbody>
                    {(formData.postpartum_logs || []).map((log, i) => (
                      <Table.Tr key={i}>
                        <Table.Td>{formatDate(log.date)}</Table.Td>
                        <Table.Td>{log.count} tabs</Table.Td>
                        <Table.Td style={{ fontSize: '10px' }}>{log.remarks}</Table.Td>
                        <Table.Td><ActionIcon size="sm" color="red" onClick={() => removePostpartumLog(i)}><Trash size={14} /></ActionIcon></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            </Box>
            <Grid align="end">
              <Grid.Col span={6}>
                <Paper withBorder p="xs">
                  <Text size="xs" fw={700} mb={5}>Completed IFA?</Text>
                  <Text size="sm" fw={500} c={isPostpartumIfaCompleted ? 'green' : 'dimmed'} mb="xs">{isPostpartumIfaCompleted ? 'Yes' : 'No'}</Text>
                  <input type="date" disabled style={{ width: '100%', padding: '4px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '12px', backgroundColor: '#f1f3f5' }} value={formData.postpartum_ifa_completed_date || ''} />
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper withBorder p="xs">
                  <Text size="xs" fw={700} mb={5}>Completed Vit. A?</Text>
                  <Text size="sm" fw={500} c={isVitACompleted ? 'green' : 'dimmed'} mb="xs">{isVitACompleted ? 'Yes' : 'No'}</Text>
                  <input type="date" style={{ width: '100%', padding: '4px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '12px' }} value={formData.vit_a_completed_date || ''} onChange={(e) => setFormData({ ...formData, vit_a_completed_date: e.target.value })} />
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
