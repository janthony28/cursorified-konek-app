import { Paper, Box, Stack, Group, Input, Select, Button, Table, ActionIcon, Text, Badge } from '@mantine/core';
import { ArrowRight, Plus, Trash, Pencil } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';

export default function LabsTab({ formData, setFormData, newLab, setNewLab, addLabLog, removeLabLog, editingLabIndex, startEditLabLog, nextTab }) {
  return (
    <>
      <Paper withBorder radius="md" overflow="hidden">
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Laboratory Test Results</Text>
        </Box>
        <Stack p="sm">
          <Group align="end">
            <Select label="Test Type" data={['CBC', 'Gestational Diabetes', 'Syphilis', 'HIV', 'Hep B']} value={newLab.type} onChange={(v) => setNewLab({ ...newLab, type: v, date: '', result: '' })} style={{ width: 200 }} />
            <Input.Wrapper label="Date"><Input type="date" value={newLab.date} onChange={(e) => setNewLab({ ...newLab, date: e.target.value })} /></Input.Wrapper>
            <Select
              key={newLab.type}
              label="Result"
              placeholder="Select result"
              data={
                newLab.type === 'CBC'
                  ? ['With Anemia', 'Without Anemia', 'Prefer not to say']
                  : ['Positive', 'Negative', 'Prefer not to say']
              }
              value={newLab.result || null}
              onChange={(v) => setNewLab({ ...newLab, result: v ?? '' })}
            />
            <Button onClick={addLabLog} leftSection={<Plus size={16} />}>{editingLabIndex != null ? 'Update Result' : 'Add Result'}</Button>
          </Group>
          <Table striped withTableBorder>
            <Table.Thead><Table.Tr><Table.Th>Test</Table.Th><Table.Th>Date</Table.Th><Table.Th>Result</Table.Th><Table.Th></Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {[...(formData.lab_logs || [])]
                .map((log, originalIndex) => ({ log, originalIndex }))
                .sort((a, b) => (b.log.date || '').localeCompare(a.log.date || ''))
                .map(({ log, originalIndex }) => {
                const isBad = ['Positive', 'With Anemia'].includes(log.result);
                return (
                  <Table.Tr key={originalIndex} bg={isBad ? 'red.1' : undefined}>
                    <Table.Td fw={500}>{log.type}</Table.Td>
                    <Table.Td>{formatDate(log.date)}</Table.Td>
                    <Table.Td>
                      {isBad ? <Badge color="red">{log.result}</Badge> : <Badge color="gray">{log.result}</Badge>}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon color="blue" size="sm" variant="light" onClick={() => startEditLabLog(originalIndex)} title="Edit"><Pencil size={14} /></ActionIcon>
                        <ActionIcon color="red" size="sm" onClick={() => removeLabLog(originalIndex)} title="Delete"><Trash size={14} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
              {(formData.lab_logs || []).length === 0 && <Table.Tr><Table.Td colSpan={4} align="center" c="dimmed">No lab results added yet.</Table.Td></Table.Tr>}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
      <Group justify="flex-end" mt="md"><Button rightSection={<ArrowRight size={16} />} onClick={() => nextTab('delivery')}>Next Section</Button></Group>
    </>
  );
}
