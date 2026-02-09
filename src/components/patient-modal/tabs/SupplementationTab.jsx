import { Paper, Box, Stack, Group, Grid, Input, NumberInput, Button, ActionIcon, Text, Progress, Divider, Checkbox, Badge } from '@mantine/core';
import { ArrowRight, X, Pencil } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';

export default function SupplementationTab({
  formData,
  setFormData,
  newSupp,
  setNewSupp,
  addSupplement,
  removeSupplement,
  editingSupp,
  startEditSupplement,
  cancelEditSupplement,
  totalIFA,
  totalMMS,
  ifaProgress,
  nextTab,
}) {
  const calciumCompleted = !!formData.calcium_carbonate_completed;
  const setCalciumCompleted = (completed) => {
    if (!formData.manual_risk) return;
    setFormData({ ...formData, calcium_carbonate_completed: completed });
  };

  return (
    <>
      <Paper withBorder radius="md" overflow="hidden" mb="md">
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Deworming Status</Text>
        </Box>
        <Group align="center" gap="xl" p="sm">
          <Checkbox label="Deworming Completed (Yes/No)" checked={formData.is_deworming_given || false} onChange={(e) => setFormData({ ...formData, is_deworming_given: e.currentTarget.checked })} />
          {formData.is_deworming_given && (
            <Group gap="xs"><Text size="sm" fw={500}>Date Given:</Text><Input type="date" value={formData.deworming_date || ''} onChange={(e) => setFormData({ ...formData, deworming_date: e.target.value })} /> </Group>
          )}
        </Group>
      </Paper>

      <Text fw={700} mb="xs">Vitamin & Supplement Logs</Text>
      <Grid>
        <Grid.Col span={4}>
          <Paper withBorder h="100%" style={{ opacity: totalMMS > 0 ? 0.5 : 1, pointerEvents: totalMMS > 0 ? 'none' : 'auto', ...(editingSupp?.type === 'IFA' ? { borderLeft: '4px solid var(--mantine-color-green-6)', backgroundColor: 'var(--mantine-color-green-0)' } : {}) }}>
            <Box bg={editingSupp?.type === 'IFA' ? 'green.1' : totalMMS > 0 ? 'gray.1' : 'blue.0'} p="xs" style={{ borderBottom: '1px solid #eee' }}><Text fw={700} size="sm" c={editingSupp?.type === 'IFA' ? 'green.8' : 'blue.9'}>{editingSupp?.type === 'IFA' ? `Editing IFA log ${(editingSupp?.index ?? 0) + 1} of ${formData.supplements_ifa.length}` : 'IFA (Iron Folic Acid)'}</Text></Box>
            <Stack p="sm">
              <Text size="xs" c="dimmed">Total Tablets: {totalIFA} / 180</Text>
              <Progress value={ifaProgress} color={totalIFA >= 180 ? 'green' : 'blue'} size="lg" radius="xl" />
              {totalIFA >= 180 && <Badge color="green">COMPLETED</Badge>}
              <Divider />
              <Group grow><Input type="date" value={newSupp.type === 'IFA' ? newSupp.date : ''} onChange={(e) => setNewSupp({ ...newSupp, type: 'IFA', date: e.target.value })} /> <NumberInput placeholder="Tabs" value={newSupp.type === 'IFA' ? newSupp.count : ''} onChange={(v) => setNewSupp({ ...newSupp, type: 'IFA', count: v })} /></Group>
              <Group gap={4}>
                <Button size="xs" variant="light" onClick={addSupplement}>{editingSupp?.type === 'IFA' ? `Update Log (${(editingSupp?.index ?? 0) + 1} of ${formData.supplements_ifa.length})` : '+ Add Log'}</Button>
                {editingSupp?.type === 'IFA' && <Button size="xs" variant="subtle" color="gray" onClick={cancelEditSupplement}>Cancel</Button>}
              </Group>
              <Stack gap={4}>
                {formData.supplements_ifa.map((s, i) => (
                  <Box key={i} p="xs" style={{ borderRadius: 4, ...(editingSupp?.type === 'IFA' && editingSupp?.index === i ? { backgroundColor: 'var(--mantine-color-green-0)', borderLeft: '3px solid var(--mantine-color-green-6)' } : {}) }}>
                    <Group justify="space-between"><Text size="xs">{formatDate(s.date)}: {s.count} tabs</Text><Group gap={4}><ActionIcon size="sm" color="blue" variant="light" onClick={(e) => { e.stopPropagation(); startEditSupplement('IFA', i); }} title="Edit"><Pencil size={14} /></ActionIcon><ActionIcon size="sm" color="red" onClick={(e) => { e.stopPropagation(); removeSupplement('IFA', i); }} title="Delete"><X size={14} /></ActionIcon></Group></Group>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder h="100%" style={{ opacity: totalIFA > 0 ? 0.5 : 1, pointerEvents: totalIFA > 0 ? 'none' : 'auto', ...(editingSupp?.type === 'MMS' ? { borderLeft: '4px solid var(--mantine-color-green-6)', backgroundColor: 'var(--mantine-color-green-0)' } : {}) }}>
            <Box bg={editingSupp?.type === 'MMS' ? 'green.1' : totalIFA > 0 ? 'gray.1' : 'teal.0'} p="xs" style={{ borderBottom: '1px solid #eee' }}><Text fw={700} size="sm" c={editingSupp?.type === 'MMS' ? 'green.8' : 'teal.9'}>{editingSupp?.type === 'MMS' ? `Editing MMS log ${(editingSupp?.index ?? 0) + 1} of ${formData.supplements_mms.length}` : 'MMS (Micronutrients)'}</Text></Box>
            <Stack p="sm">
              <Group grow><Input type="date" value={newSupp.type === 'MMS' ? newSupp.date : ''} onChange={(e) => setNewSupp({ ...newSupp, type: 'MMS', date: e.target.value })} /> <NumberInput placeholder="Tabs" value={newSupp.type === 'MMS' ? newSupp.count : ''} onChange={(v) => setNewSupp({ ...newSupp, type: 'MMS', count: v })} /></Group>
              <Group gap={4}>
                <Button size="xs" variant="light" color="teal" onClick={addSupplement}>{editingSupp?.type === 'MMS' ? `Update Log (${(editingSupp?.index ?? 0) + 1} of ${formData.supplements_mms.length})` : '+ Add Log'}</Button>
                {editingSupp?.type === 'MMS' && <Button size="xs" variant="subtle" color="gray" onClick={cancelEditSupplement}>Cancel</Button>}
              </Group>
              <Stack gap={4}>
                {formData.supplements_mms.map((s, i) => (
                  <Box key={i} p="xs" style={{ borderRadius: 4, ...(editingSupp?.type === 'MMS' && editingSupp?.index === i ? { backgroundColor: 'var(--mantine-color-green-0)', borderLeft: '3px solid var(--mantine-color-green-6)' } : {}) }}>
                    <Group justify="space-between"><Text size="xs">{formatDate(s.date)}: {s.count} tabs</Text><Group gap={4}><ActionIcon size="sm" color="blue" variant="light" onClick={(e) => { e.stopPropagation(); startEditSupplement('MMS', i); }} title="Edit"><Pencil size={14} /></ActionIcon><ActionIcon size="sm" color="red" onClick={(e) => { e.stopPropagation(); removeSupplement('MMS', i); }} title="Delete"><X size={14} /></ActionIcon></Group></Group>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder style={{ opacity: !formData.manual_risk ? 0.5 : 1 }}>
            <Box bg={!formData.manual_risk ? 'gray.1' : 'orange.0'} p="xs" style={{ borderBottom: '1px solid #eee' }}><Text fw={700} size="sm" c="orange.9">Calcium Carbonate</Text></Box>
            <Stack p="xs" gap={6}>
              {formData.manual_risk ? (
                <>
                  <Text size="xs" c="dimmed">
                    Completed?
                  </Text>
                  <Group gap="md">
                    <Checkbox
                      label="Yes"
                      checked={calciumCompleted}
                      onChange={() => setCalciumCompleted(true)}
                    />
                    <Checkbox
                      label="No"
                      checked={!calciumCompleted}
                      onChange={() => setCalciumCompleted(false)}
                    />
                  </Group>
                </>
              ) : (
                <Text size="xs" c="dimmed">
                  Available for high-risk patients only.
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
      <Group justify="flex-end" mt="md"><Button rightSection={<ArrowRight size={16} />} onClick={() => nextTab('labs')}>Next Section</Button></Group>
    </>
  );
}
