import { Paper, Box, Grid, TextInput, Input, NumberInput, Select, Checkbox, Stack, Group, Text, Button, Badge } from '@mantine/core';
import { ArrowRight } from 'lucide-react';
import { BATANGAS_BARANGAYS } from '../../../lib/constants';

export default function GeneralTab({ formData, setFormData, formErrors, getAgeGroup, handleLmpChange, nextTab }) {
  return (
    <>
      <Paper withBorder radius="md" overflow="hidden" mb="md">
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Personal Information</Text>
        </Box>
        <Grid p="sm">
          <Grid.Col span={4}> <TextInput error={formErrors.last_name} label="Last Name" placeholder="Dela Cruz" withAsterisk value={formData.last_name || ''} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} /> </Grid.Col>
          <Grid.Col span={4}> <TextInput error={formErrors.first_name} label="First Name" placeholder="Juana" withAsterisk value={formData.first_name || ''} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} /> </Grid.Col>
          <Grid.Col span={4}> <TextInput label="Middle Name" placeholder="Santos" value={formData.middle_name || ''} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} /> </Grid.Col>
          <Grid.Col span={12}> <TextInput error={formErrors.address} withAsterisk label="Complete Address" placeholder="House No., Street, etc." value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /> </Grid.Col>
          <Grid.Col span={6}> <Select error={formErrors.barangay} label="Barangay" placeholder="Select Barangay" data={BATANGAS_BARANGAYS} searchable value={formData.barangay || ''} onChange={(val) => setFormData({ ...formData, barangay: val })} /> </Grid.Col>
          <Grid.Col span={6}> <TextInput label="Sitio / Purok" placeholder="(Optional)" value={formData.sitio || ''} onChange={(e) => setFormData({ ...formData, sitio: e.target.value })} /> </Grid.Col>
          <Grid.Col span={6}> <NumberInput error={formErrors.age} label="Age" withAsterisk value={formData.age === null ? '' : formData.age} onChange={(val) => setFormData({ ...formData, age: val })} /> </Grid.Col>
          <Grid.Col span={6}> <TextInput label="Age Group" readOnly value={getAgeGroup(formData.age)} variant="filled" /> </Grid.Col>
          <Grid.Col span={6}> <Input.Wrapper label="Date of Registration"> <Input type="date" value={formData.date_of_registration || ''} onChange={(e) => setFormData({ ...formData, date_of_registration: e.target.value })} /> </Input.Wrapper> </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder radius="md" overflow="hidden" mb="md">
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">General Data</Text>
        </Box>
        <Grid p="sm">
          <Grid.Col span={12}>
            <Input.Wrapper label="Civil Status">
              <Group mt="xs" gap="md">
                {['Single', 'Married', 'Widowed', 'Legally Separated'].map((status) => (
                  <Checkbox
                    key={status}
                    label={status}
                    checked={(formData.civil_status || '') === status}
                    onChange={() => setFormData({ ...formData, civil_status: (formData.civil_status || '') === status ? '' : status })}
                  />
                ))}
              </Group>
            </Input.Wrapper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Input.Wrapper label="Solo Parent">
              <Group mt="xs" gap="md">
                <Checkbox
                  label="Yes"
                  checked={formData.is_solo_parent === true}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setFormData({
                      ...formData,
                      is_solo_parent: checked,
                      ...(checked ? {} : {
                        solo_parent_type: '',
                        solo_parent_other: '',
                      }),
                    });
                  }}
                />
                <Checkbox
                  label="No"
                  checked={formData.is_solo_parent === false}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    if (checked) {
                      setFormData({
                        ...formData,
                        is_solo_parent: false,
                        solo_parent_type: '',
                        solo_parent_other: '',
                      });
                    }
                  }}
                />
              </Group>
            </Input.Wrapper>
            {formData.is_solo_parent === true && (
              <Stack mt="xs" gap="xs" pl="md">
                <Select
                  label="Solo parent type"
                  placeholder="Select one"
                  clearable
                  data={[
                    { value: 'unmarried', label: 'Unmarried mother/father' },
                    { value: 'separated', label: 'Separated (not legally married / abandoned)' },
                    { value: 'legally_separated', label: 'Legally separated' },
                    { value: 'widow', label: 'Widow/Widower' },
                    { value: 'incarcerated', label: 'Spouse incarcerated' },
                    { value: 'disability', label: 'Spouse with disability / unable to provide support' },
                    { value: 'others', label: 'Others (pls. specify)' },
                  ]}
                  value={formData.solo_parent_type || null}
                  onChange={(val) => setFormData({
                    ...formData,
                    solo_parent_type: val || '',
                    solo_parent_other: val !== 'others' ? '' : (formData.solo_parent_other || ''),
                  })}
                />
                {(formData.solo_parent_type || '') === 'others' && (
                  <TextInput
                    label="Please specify"
                    placeholder="Specify..."
                    value={formData.solo_parent_other || ''}
                    onChange={(e) => setFormData({ ...formData, solo_parent_other: e.target.value })}
                  />
                )}
              </Stack>
            )}
          </Grid.Col>

          <Grid.Col span={12}>
            <Input.Wrapper label="PhilHealth Member">
              <Group mt="xs" gap="md">
                <Checkbox
                  label="Member"
                  checked={formData.philhealth_status === 'Member'}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setFormData({
                      ...formData,
                      philhealth_status: checked ? 'Member' : '',
                      ...(checked ? {} : { philhealth_type: '' }),
                    });
                  }}
                />
                <Checkbox
                  label="Dependent"
                  checked={formData.philhealth_status === 'Dependent'}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setFormData({
                      ...formData,
                      philhealth_status: checked ? 'Dependent' : '',
                      philhealth_type: '',
                    });
                  }}
                />
                <Checkbox
                  label="Not a member/ No Philhealth"
                  checked={formData.philhealth_status === 'Not a member'}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setFormData({
                      ...formData,
                      philhealth_status: checked ? 'Not a member' : '',
                      philhealth_type: '',
                    });
                  }}
                />
              </Group>
            </Input.Wrapper>
            {formData.philhealth_status === 'Member' && (
              <Select
                mt="xs"
                ml="md"
                label="PhilHealth membership type"
                placeholder="Select one"
                clearable
                data={[
                  { value: 'formal', label: 'Formal Economy' },
                  { value: 'informal', label: 'Informal Economy' },
                  { value: 'indigent', label: 'Indigent' },
                  { value: 'sponsored', label: 'Sponsored' },
                ]}
                value={formData.philhealth_type || null}
                onChange={(val) => setFormData({ ...formData, philhealth_type: val || '' })}
              />
            )}
          </Grid.Col>

          <Grid.Col span={6}>
            <Input.Wrapper label="SSS Member">
              <Group mt="xs" gap="md">
                <Checkbox
                  label="Yes"
                  checked={formData.sss_member === true}
                  onChange={(e) => setFormData({ ...formData, sss_member: e.currentTarget.checked ? true : null })}
                />
                <Checkbox
                  label="No"
                  checked={formData.sss_member === false}
                  onChange={(e) => setFormData({ ...formData, sss_member: e.currentTarget.checked ? false : null })}
                />
              </Group>
            </Input.Wrapper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Input.Wrapper label="GSIS Member">
              <Group mt="xs" gap="md">
                <Checkbox
                  label="Yes"
                  checked={formData.gsis_member === true}
                  onChange={(e) => setFormData({ ...formData, gsis_member: e.currentTarget.checked ? true : null })}
                />
                <Checkbox
                  label="No"
                  checked={formData.gsis_member === false}
                  onChange={(e) => setFormData({ ...formData, gsis_member: e.currentTarget.checked ? false : null })}
                />
              </Group>
            </Input.Wrapper>
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Contact No."
              placeholder="e.g. 09123456789"
              value={formData.contact_no || ''}
              onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Email address"
              placeholder="e.g. example@email.com"
              type="email"
              value={formData.email_address || ''}
              onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder radius="md" overflow="hidden" style={{ borderColor: '#dee2e6' }}>
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Pregnancy Information</Text>
        </Box>
        <Grid p="sm">
          <Grid.Col span={6}> <Input.Wrapper label="LMP (Last Menstrual Period)" withAsterisk error={formErrors.lmp}> <Input error={formErrors.lmp} type="date" value={formData.lmp || ''} onChange={handleLmpChange} /> </Input.Wrapper> </Grid.Col>
          <Grid.Col span={6}> <Input.Wrapper label="EDC (Estimated Date of Confinement)"> <Input type="date" disabled style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', color: '#0ca678' }} value={formData.edc || ''} /> </Input.Wrapper> </Grid.Col>
          <Grid.Col span={6}> <NumberInput error={formErrors.gravida} label="Gravida (No. of Pregnancies)" withAsterisk min={1} value={formData.gravida === null ? '' : formData.gravida} onChange={(val) => setFormData({ ...formData, gravida: val })} /> </Grid.Col>
          <Grid.Col span={6}> <NumberInput error={formErrors.parity} label="Parity (No. of Births)" withAsterisk min={0} value={formData.parity === 0 ? 0 : (formData.parity ?? '')} onChange={(val) => setFormData({ ...formData, parity: val })} /> </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder radius="md" overflow="hidden" mt="md" style={{ borderColor: formData.manual_risk ? 'red' : '#dee2e6' }}>
        <Box bg="red.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Group justify="space-between">
            <Text size="sm" fw={700} c="red.9">Risk Factors</Text>
            {formData.manual_risk && <Badge color="red" variant="filled">HIGH RISK</Badge>}
          </Group>
        </Box>
        <Stack p="sm" gap="xs">
          <Checkbox
            label="Is this person high risk?"
            checked={formData.manual_risk || false}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              setFormData({
                ...formData,
                manual_risk: checked,
                ...(checked
                  ? {}
                  : {
                    has_hypertension: false,
                    has_gestational_diabetes: false,
                    has_advanced_maternal_age: false,
                    has_multiple_gestation: false,
                    has_multiple_miscarriages: false,
                    has_obesity: false,
                    high_risk_reason: '',
                    supplements_calcium: [],
                    calcium_carbonate_completed: false,
                  }),
              });
            }}
            color="red"
            size="md"
          />
          {formData.manual_risk && (
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">Select all that apply:</Text>
              {[
                { key: 'has_hypertension', label: 'Hypertension' },
                { key: 'has_gestational_diabetes', label: 'Gestational diabetes' },
                { key: 'has_advanced_maternal_age', label: 'Advanced maternal age' },
                { key: 'has_multiple_gestation', label: 'Multiple gestation (twins, etc.)' },
                { key: 'has_multiple_miscarriages', label: 'Multiple miscarriages' },
                { key: 'has_obesity', label: 'Obesity' },
              ].map(({ key, label }) => (
                <Checkbox
                  key={key}
                  label={label}
                  checked={!!formData[key]}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setFormData({ ...formData, [key]: checked });
                  }}
                  color="red"
                  size="md"
                />
              ))}
              <TextInput
                label="Other reason (optional)"
                placeholder="e.g., History of C-Section..."
                value={formData.high_risk_reason || ''}
                onChange={(e) => setFormData({ ...formData, high_risk_reason: e.target.value })}
              />
            </Stack>
          )}
        </Stack>
      </Paper>

      <Group justify="flex-end" mt="md"><Button rightSection={<ArrowRight size={16} />} onClick={() => nextTab('prenatal')}>Next Section</Button></Group>
    </>
  );
}
