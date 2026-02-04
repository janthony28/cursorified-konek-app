import { useState, useEffect } from 'react';
import { Paper, Box, Stack, Group, Grid, Input, Select, TextInput, Checkbox, Text, NumberInput, Button } from '@mantine/core';
import { ArrowRight } from 'lucide-react';

export default function DeliveryTab({ formData, setFormData, formErrors, handleBirthWeightChange, handleBabySexChange, isAborted, nextTab }) {
  const [selectedBabyIndex, setSelectedBabyIndex] = useState(0);

  const pregnancyType = formData.pregnancy_type || '';
  const multipleCount = Number(formData.pregnancy_multiple_count) || 0;

  let babyCount = 1;
  if (pregnancyType === 'Twins') babyCount = 2;
  else if (pregnancyType === 'Multiple' && multipleCount > 0) babyCount = Math.min(multipleCount, 12);

  useEffect(() => {
    setSelectedBabyIndex((prev) => Math.min(prev, Math.max(0, babyCount - 1)));
  }, [babyCount]);

  const baseBabyDetails = Array.isArray(formData.baby_details) ? formData.baby_details : [];
  const babyDetails = Array.from({ length: babyCount }, (_, index) => {
    const existing = baseBabyDetails[index];
    if (existing) return existing;
    // For Baby 1, fall back to legacy single-baby fields if no structured data yet
    if (index === 0) {
      return {
        weight: formData.birth_weight || '',
        category: formData.birth_weight_category || '',
        sex: formData.birth_sex || '',
      };
    }
    return { weight: '', category: '', sex: '' };
  });

  const effectiveIndex = Math.min(selectedBabyIndex, babyCount - 1);
  const currentBaby = babyDetails[effectiveIndex] || { weight: '', category: '', sex: '' };

  const handlePregnancyTypeChange = (val) => {
    setFormData({
      ...formData,
      pregnancy_type: val,
      pregnancy_multiple_count: val === 'Multiple' ? (formData.pregnancy_multiple_count || '') : '',
    });
  };

  return (
    <>
      <Grid grow>
        <Grid.Col span={4}>
          <Paper withBorder radius="md" overflow="hidden">
            <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
              <Text size="sm" fw={700} c="blue.9" align="center">Pregnancy Outcome</Text>
            </Box>
            <Stack p="sm" gap="xs">
              <Input.Wrapper label="Date Terminated"> <Input type="date" value={formData.delivery_date || ''} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} /> </Input.Wrapper>
              <Select
                label="Outcome"
                placeholder="--"
                data={[{ value: 'FT', label: 'FT - Full Term' }, { value: 'PT', label: 'PT - Pre-term' }, { value: 'FD', label: 'FD - Fetal Death' }, { value: 'AB', label: 'AB - Abortion' }]}
                value={formData.delivery_outcome || ''}
                onChange={(val) => {
                  if (val === 'FD' || val === 'AB') {
                    setFormData({
                      ...formData,
                      delivery_outcome: val,
                      birth_weight: '',
                      birth_weight_category: '',
                      birth_sex: '',
                      delivery_time: '',
                      delivery_mode: '',
                      delivery_attendant: '',
                      delivery_attendant_specify: '',
                      delivery_place: '',
                      delivery_facility_type: '',
                      delivery_place_specify: '',
                      delivery_place_capable: '',
                      pregnancy_type: '',
                      pregnancy_multiple_count: '',
                    });
                  } else {
                    setFormData({ ...formData, delivery_outcome: val });
                  }
                }}
              />
              <TextInput label="Remarks" placeholder="..." value={formData.pregnancy_outcome_remarks || ''} onChange={(e) => setFormData({ ...formData, pregnancy_outcome_remarks: e.target.value })} />
              <Select
                label="Pregnancy Type"
                placeholder="Select..."
                data={['Singleton', 'Twins', 'Multiple']}
                value={pregnancyType}
                onChange={handlePregnancyTypeChange}
              />
              {pregnancyType === 'Multiple' && (
                <NumberInput
                  label="How many?"
                  placeholder="Enter number"
                  min={3}
                  max={12}
                  allowDecimal={false}
                  value={formData.pregnancy_multiple_count}
                  onChange={(val) => setFormData({ ...formData, pregnancy_multiple_count: val })}
                />
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder radius="md" overflow="hidden" h="100%" style={{ opacity: isAborted ? 0.5 : 1 }}>
            <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
              <Text size="sm" fw={700} c="blue.9" align="center">
                Baby Details
              </Text>
            </Box>
            <Stack p="sm" gap="xs">
              {babyCount > 1 && (
                <Select
                  label="Select baby to edit"
                  placeholder="Choose..."
                  data={Array.from({ length: babyCount }, (_, i) => ({ value: String(i), label: `Baby ${i + 1}` }))}
                  value={String(effectiveIndex)}
                  onChange={(val) => val != null && setSelectedBabyIndex(Number(val))}
                />
              )}
              <NumberInput
                disabled={isAborted}
                label="Weight (grams)"
                placeholder="e.g. 3000"
                value={currentBaby.weight}
                onChange={(val) => handleBirthWeightChange(val, effectiveIndex)}
              />
              <Select
                disabled
                label="Category"
                placeholder="--"
                data={[
                  { value: 'Normal', label: 'A - Normal (>= 2500g)' },
                  { value: 'Low', label: 'B - Low (< 2500g)' },
                  { value: 'Unknown', label: 'C - Unknown' },
                ]}
                value={currentBaby.category || ''}
                readOnly
                variant="filled"
              />
              <Select
                disabled={isAborted}
                label="Sex of Baby"
                placeholder="Select..."
                data={['Male', 'Female']}
                value={currentBaby.sex || ''}
                onChange={(val) => handleBabySexChange(val, effectiveIndex)}
              />
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder radius="md" overflow="hidden" h="100%" style={{ opacity: isAborted ? 0.5 : 1 }}>
            <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
              <Text size="sm" fw={700} c="blue.9" align="center">Date/Time of Delivery</Text>
            </Box>
            <Stack p="sm" gap="xs">
              <Input.Wrapper label="Date"><Input type="date" disabled={isAborted} value={formData.delivery_date || ''} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} /></Input.Wrapper>
              <Input.Wrapper label="Time"><input type="time" disabled={isAborted} style={{ width: '100%', padding: '6px', border: '1px solid #ced4da', borderRadius: '4px' }} value={formData.delivery_time || ''} onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })} /></Input.Wrapper>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={6}>
          <Paper withBorder radius="md" overflow="hidden" style={{ opacity: isAborted ? 0.5 : 1 }}>
            <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
              <Text size="sm" fw={700} c="blue.9" align="center">Delivery Type</Text>
            </Box>
            <Stack p="sm">
              <Input.Wrapper error={formErrors?.delivery_mode} description={formErrors?.delivery_mode ? null : undefined}>
                <Stack gap="xs">
                  {[
                    { value: 'CS', label: 'CS - Cesarean Section' },
                    { value: 'VD', label: 'VD - Vaginal Delivery' },
                    { value: 'CVCD', label: 'CVCD - Combined Vaginal-Cesarean' },
                  ].map(({ value, label }) => (
                    <Checkbox
                      key={value}
                      disabled={isAborted}
                      checked={(formData.delivery_mode || '') === value}
                      label={label}
                      onChange={() => setFormData({ ...formData, delivery_mode: (formData.delivery_mode || '') === value ? '' : value })}
                    />
                  ))}
                </Stack>
              </Input.Wrapper>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={6}>
          <Paper withBorder radius="md" overflow="hidden" h="100%" style={{ opacity: isAborted ? 0.5 : 1 }}>
            <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
              <Text size="sm" fw={700} c="blue.9" align="center">Birth Attendant</Text>
            </Box>
            <Stack p="sm">
              <Select disabled={isAborted} placeholder="Select Attendant" data={[{ value: 'MD', label: 'MD - Doctor' }, { value: 'RN', label: 'RN - Nurse' }, { value: 'MW', label: 'MW - Midwife' }, { value: 'Others', label: 'Others' }]} value={formData.delivery_attendant || ''} onChange={(val) => setFormData({ ...formData, delivery_attendant: val })} />
              {formData.delivery_attendant === 'Others' && (<TextInput disabled={isAborted} placeholder="Please specify..." value={formData.delivery_attendant_specify || ''} onChange={(e) => setFormData({ ...formData, delivery_attendant_specify: e.target.value })} />)}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder radius="md" overflow="hidden" mt="md" style={{ opacity: isAborted ? 0.5 : 1 }}>
        <Box bg="blue.1" p="xs" style={{ borderBottom: '1px solid #dee2e6' }}>
          <Text size="sm" fw={700} c="blue.9" align="center">Place of Delivery</Text>
        </Box>
        <Grid p="sm">
          <Grid.Col span={4}>
            <Select disabled={isAborted} label="Place (Specific)" placeholder="Select Place..." data={['BHS', 'RHU/UHU', 'Govt Hospital', 'Public Infirmary', 'Ambulance', 'Others']} value={formData.delivery_place || ''} onChange={(val) => setFormData({ ...formData, delivery_place: val })} />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select disabled={isAborted} label="Facility Type" placeholder="Select Type..." data={['Public', 'Private', 'Non-Health Facility']} value={formData.delivery_facility_type || ''} onChange={(val) => setFormData({ ...formData, delivery_facility_type: val })} />
            {formData.delivery_facility_type === 'Non-Health Facility' && (
              <TextInput disabled={isAborted} mt="xs" placeholder="Specify (e.g. Home, En Route)" value={formData.delivery_place_specify || ''} onChange={(e) => setFormData({ ...formData, delivery_place_specify: e.target.value })} />
            )}
          </Grid.Col>
          <Grid.Col span={4}>
            <Select disabled={isAborted} label="BEmONC/CEmONC Capable?" placeholder="--" data={['Yes', 'No']} value={formData.delivery_place_capable || ''} onChange={(val) => setFormData({ ...formData, delivery_place_capable: val })} />
          </Grid.Col>
        </Grid>
      </Paper>

      <Group justify="flex-end" mt="md">
        <Button rightSection={<ArrowRight size={16} />} onClick={() => nextTab('postnatal')}>Next Section</Button>
      </Group>
    </>
  );
}
