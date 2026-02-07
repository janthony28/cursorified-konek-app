import { Paper, Box, Stack, Group, Grid, Input, NumberInput, TextInput, Table, Button, ActionIcon, Text } from '@mantine/core';
import { ArrowRight, Trash, Pencil } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';

export default function PrenatalTab({ formData, setFormData, newVisit, setNewVisit, handleVisitDateChange, handleBMIChange, addVisitToList, removeVisit, editingVisitIndex, startEditVisit, nextTab }) {
  return (
    <>
      <Paper withBorder radius="md" overflow="hidden" mb="md">
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Prenatal Visit</Text>
        </Box>
        <Stack p="sm">
          <Group grow>
            <Input.Wrapper label="Visit Date" withAsterisk> <Input type="date" value={newVisit.date || ''} onChange={handleVisitDateChange} /> </Input.Wrapper>
            <TextInput label="AOG" readOnly value={newVisit.aog} placeholder="Auto" />
            <TextInput label="Trimester" readOnly value={newVisit.trimester} placeholder="Auto" />
          </Group>
          {newVisit.trimester === '1st Trimester' && (
            <Grid>
              <Grid.Col span={3}> <NumberInput label="Ht (cm)" value={newVisit.height} onChange={(val) => handleBMIChange('height', val)} /> </Grid.Col>
              <Grid.Col span={3}> <NumberInput label="Wt (kg)" value={newVisit.weight} onChange={(val) => handleBMIChange('weight', val)} /> </Grid.Col>
              <Grid.Col span={3}> <TextInput label="BMI" readOnly value={newVisit.bmi} /> </Grid.Col>
              <Grid.Col span={3}> <TextInput label="Category" readOnly value={newVisit.bmi_category} /> </Grid.Col>
            </Grid>
          )}
          <Button fullWidth variant="outline" color="teal" onClick={addVisitToList}>{editingVisitIndex != null ? 'Update Visit' : '+ Add Visit'}</Button>
        </Stack>
      </Paper>
      <Paper withBorder radius="md" overflow="hidden">
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Visit History ({formData.prenatal_visits.length})</Text>
        </Box>
        <Box p="sm">
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withTableBorder>
              <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>AOG</Table.Th><Table.Th>Trimester</Table.Th><Table.Th>BMI</Table.Th><Table.Th>Action</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {formData.prenatal_visits.map((v, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{formatDate(v.date)}</Table.Td>
                    <Table.Td>{v.aog}</Table.Td>
                    <Table.Td>{v.trimester || '—'}</Table.Td>
                    <Table.Td>{v.trimester === '1st Trimester' ? (v.bmi ?? '—') : '—'}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon color="blue" size="sm" variant="light" onClick={() => startEditVisit(i)} title="Edit"><Pencil size={14} /></ActionIcon>
                        <ActionIcon color="red" size="sm" onClick={() => removeVisit(i)} title="Delete"><Trash size={14} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
          <Box mt="sm" p="xs" style={{ borderTop: '1px solid #dee2e6' }}>
            <Text size="xs" fw={600} c="dimmed" mb={4}>Completed?</Text>
            <Text size="sm" fw={500} c={formData.prenatal_visits.length >= 8 ? 'green' : 'dimmed'}>{formData.prenatal_visits.length >= 8 ? 'Yes' : 'No'}</Text>
          </Box>
        </Box>
      </Paper>
      <Group justify="flex-end" mt="md"><Button rightSection={<ArrowRight size={16} />} onClick={() => nextTab('immunization')}>Next Section</Button></Group>
    </>
  );
}
