import { Paper, Box, Stack, Group, Table, Input, Button, Badge, Checkbox, Text } from '@mantine/core';
import { ArrowRight } from 'lucide-react';

export default function ImmunizationTab({ formData, setFormData, handleTdChange, getImmunizationStats, nextTab }) {
  return (
    <>
      <Paper withBorder radius="md" overflow="hidden" mb="md">
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Td Vaccination</Text>
        </Box>
        <Box p="sm">
          <Checkbox label="Completed Td (FIM) in previous pregnancy" mb="md" color="teal" checked={formData.td_completed_previously || false} onChange={(e) => setFormData({ ...formData, td_completed_previously: e.currentTarget.checked })} />
          <Table withTableBorder style={{ opacity: formData.td_completed_previously ? 0.5 : 1, pointerEvents: formData.td_completed_previously ? 'none' : 'auto' }}>
            <Table.Thead><Table.Tr><Table.Th>Dose</Table.Th><Table.Th>Date Given</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              <Table.Tr><Table.Td>Td1</Table.Td><Table.Td><Input type="date" variant="unstyled" value={formData.td1 || ''} onChange={(e) => handleTdChange('td1', e.target.value)} /></Table.Td></Table.Tr>
              <Table.Tr><Table.Td>Td2</Table.Td><Table.Td><Input type="date" variant="unstyled" value={formData.td2 || ''} onChange={(e) => handleTdChange('td2', e.target.value)} /></Table.Td></Table.Tr>
              <Table.Tr><Table.Td>Td3</Table.Td><Table.Td><Input type="date" variant="unstyled" value={formData.td3 || ''} onChange={(e) => handleTdChange('td3', e.target.value)} /></Table.Td></Table.Tr>
              <Table.Tr><Table.Td>Td4</Table.Td><Table.Td><Input type="date" variant="unstyled" value={formData.td4 || ''} onChange={(e) => handleTdChange('td4', e.target.value)} /></Table.Td></Table.Tr>
              <Table.Tr><Table.Td>Td5</Table.Td><Table.Td><Input type="date" variant="unstyled" value={formData.td5 || ''} onChange={(e) => handleTdChange('td5', e.target.value)} /></Table.Td></Table.Tr>
            </Table.Tbody>
          </Table>
          <Group grow mt="lg">
            <Paper p="sm" bg="gray.1" withBorder> <Text size="xs" c="dimmed">DOSES</Text> <Text size="xl" fw={900}>{getImmunizationStats().count}</Text> </Paper>
            <Paper p="sm" bg="gray.1" withBorder> <Text size="xs" c="dimmed">FIM?</Text> <Badge size="lg" color={getImmunizationStats().fimStatus === 'Yes' ? 'green' : 'gray'}> {getImmunizationStats().fimStatus} </Badge> </Paper>
          </Group>
        </Box>
      </Paper>
      <Group justify="flex-end" mt="md"><Button rightSection={<ArrowRight size={16} />} onClick={() => nextTab('supplementation')}>Next Section</Button></Group>
    </>
  );
}
