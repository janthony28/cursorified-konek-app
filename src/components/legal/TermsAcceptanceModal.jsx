import { useState } from 'react';
import { Modal, Tabs, Text, Title, Stack, Checkbox, Button, Box, ScrollArea } from '@mantine/core';
import { TERMS_EN, TERMS_TL } from '../../lib/termsContent';

function TermsBody({ content }) {
  return (
    <Stack gap="md">
      {content.sections.map((section, i) => (
        <Box key={i}>
          <Title order={5} c="teal.8" mb="xs">{section.heading}</Title>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{section.body}</Text>
        </Box>
      ))}
    </Stack>
  );
}

export default function TermsAcceptanceModal({ opened, onAccept }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [activeTab, setActiveTab] = useState('en');

  const handleAccept = () => {
    if (!acknowledged) return;
    onAccept?.();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      title="Terms and Conditions"
      size={900}
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      styles={{
        title: { fontWeight: 700, fontSize: '1.25rem' },
        body: { overflow: 'hidden', display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          height: '70vh',
        }}
      >
        <Tabs value={activeTab} onChange={setActiveTab} color="teal" variant="pills" radius="md" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <Tabs.List mb="md" style={{ flexShrink: 0 }}>
            <Tabs.Tab value="en">English</Tabs.Tab>
            <Tabs.Tab value="tl">Tagalog</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="en" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ScrollArea h="100%" type="scroll">
              <TermsBody content={TERMS_EN} />
            </ScrollArea>
          </Tabs.Panel>
          <Tabs.Panel value="tl" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ScrollArea h="100%" type="scroll">
              <TermsBody content={TERMS_TL} />
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>

        <Stack mt="md" gap="sm" style={{ flexShrink: 0 }}>
          <Checkbox
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.currentTarget.checked)}
            label={activeTab === 'tl' ? TERMS_TL.acknowledgment : TERMS_EN.acknowledgment}
            color="teal"
            size="sm"
          />
          <Button
            color="teal"
            onClick={handleAccept}
            disabled={!acknowledged}
            fullWidth
            size="md"
          >
            I Accept / Tinatanggap ko
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
