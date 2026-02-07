import { Box, Container, Paper, Title, Text, Stack, Button, Group, Divider } from '@mantine/core';

export default function LegalPage({ onBack }) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(165deg, #e6fcf5 0%, #b2f2e2 30%, #f0f4f8 70%, #fff 100%)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(12, 166, 120, 0.1) 0%, rgba(12, 166, 120, 0.05) 100%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(12, 166, 120, 0.08) 0%, rgba(12, 166, 120, 0.03) 100%)',
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />

      <Container size="md" style={{ flex: '1 1 auto', position: 'relative', zIndex: 1, marginTop: 24, marginBottom: 24 }}>
        <Paper
          withBorder
          shadow="xl"
          p={{ base: 24, md: 40 }}
          radius="xl"
          style={{
            borderColor: 'rgba(12, 166, 120, 0.2)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(12, 166, 120, 0.05)',
          }}
        >
          <Group justify="space-between" mb="xl">
            <Title order={2} c="teal.8">Terms of Use & Privacy Policy</Title>
            {onBack && (
              <Button variant="subtle" color="teal" onClick={onBack} size="sm">
                Back to login
              </Button>
            )}
          </Group>

          <Stack gap="xl">
            <section>
              <Title order={3} c="teal.7" mb="sm">Terms of Use</Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>
                <strong>1. Acceptance.</strong> KONEK (KOmunidad NEtwork for Kalusugan) is a community health records platform for authorized health workers and administrators. By logging in and using this service, you agree to these Terms of Use.
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>2. Purpose.</strong> This website is used to record, manage, and report maternal and child health data in support of local health programs. It supports prenatal care tracking, delivery and birth details, postnatal care (PNC), immunizations (e.g. Tetanus–Diptheria), supplementation (e.g. IFA, MMS, Calcium), lab logs, and related reporting consistent with field health service information systems (FHSIS).
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>3. Authorized use.</strong> You may use KONEK only for lawful, authorized health and administrative purposes. You must not share your login credentials, access the system from unauthorized devices, or use the data for purposes unrelated to community health.
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>4. Data accuracy and security.</strong> You are responsible for entering accurate information and for keeping your account secure. Do not enter data for persons without proper authorization or consent where required.
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>5. Changes.</strong> We may update these Terms of Use from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.
              </Text>
            </section>

            <Divider />

            <section>
              <Title order={3} c="teal.7" mb="sm">Privacy Policy</Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>
                <strong>1. Who we are.</strong> KONEK is a community health records application (“the Service”) that helps authorized users manage maternal and child health records for their communities.
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>2. What we collect.</strong> The Service collects and stores:
              </Text>
              <Text size="sm" c="dimmed" mt="xs" component="ul" style={{ lineHeight: 1.7, paddingLeft: 20 }}>
                <li><strong>Account information:</strong> email address and password (or equivalent credentials) used to sign in. This is processed by our authentication provider (Supabase) to identify you and protect your account.</li>
                <li><strong>Maternal and child health records:</strong> data you enter in the app, including but not limited to patient names, age, address, barangay and sitio, date of registration; pregnancy-related data (e.g. LMP, EDC, gravida, parity); prenatal visits (dates, weight, height, BMI, remarks); supplementation logs (IFA, MMS, Calcium); lab logs (e.g. CBC and results); delivery details (date, time, outcome, mode, attendant, place, facility type); baby details (e.g. birth weight, sex for single or multiple births); postnatal care contacts and postpartum supplementation logs; immunization data (e.g. TD doses); and other fields used for reporting and care tracking.</li>
                <li><strong>Usage and attribution:</strong> each record is associated with the user who created or last updated it (e.g. created_by / user identifier) for accountability and access control.</li>
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>3. How we use the data.</strong> We use the collected data to operate the Service: to store and display records, to generate reports and exports (e.g. for FHSIS or internal use), to enforce access controls (e.g. so users see only their own records unless they have admin rights), and to maintain security and integrity of the system.
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>4. Where data is stored.</strong> Data is stored and processed using Supabase (database and authentication). Supabase may store data in data centers as configured by the project; we do not sell your or your patients’ data to third parties for marketing.
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>5. Your responsibilities.</strong> You must comply with applicable health privacy and data protection laws (e.g. consent, confidentiality) when entering and handling patient data. You are responsible for ensuring that use of the Service is authorized by your organization and that patient information is used only for appropriate health and administrative purposes.
              </Text>
              <Text size="sm" c="dimmed" mt="xs" style={{ lineHeight: 1.7 }}>
                <strong>6. Updates to this policy.</strong> We may update this Privacy Policy from time to time. The current version will be available from the login screen. Continued use of the Service after changes constitutes acceptance of the updated policy.
              </Text>
            </section>

            <Text size="xs" c="dimmed" ta="center" mt="md">
              Last updated: February 2025. For questions about these terms or our privacy practices, contact your system administrator.
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
