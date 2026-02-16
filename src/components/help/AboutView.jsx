import { Stack, Title, Text, Paper, List } from '@mantine/core';

export default function AboutView() {
  return (
    <Stack>
      <Title order={3}>About KONEK</Title>
      <Text c="dimmed" size="sm" mb="md">
        KOmunidad Network for Kalusugan - a barangay-based Health Information System for the City of Batangas.
      </Text>

      <Paper p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="sm">
            <Text component="span" fw={700}>KOmunidad Network for Kalusugan (KONEK)</Text> is a barangay-based Health Information System developed for the City of Batangas to support maternal health services at the community level.
          </Text>

          <Text size="sm">
            KONEK is a <Text component="span" fw={700}>student-led capstone project of Batangas State University - The National Engineering University College of Medicine.</Text> It was conceptualized, designed, and implemented by a team of medical students, <Text component="span" fw={700}>Alyssa Jane G. Panaligan, Abygael Victoria L. Aquino, Marian B. Bauan, Jonna Mae O. Cabrera, Ysabela Marie M. Palbacal, and Meliah Isabel P. Sebuc</Text>, as part of their training in community health, innovation, and digital solutions for primary care. Guided by principles of community-oriented primary care, the team led stakeholder coordination, needs assessment, system design, pilot testing, and evaluation of the application.
          </Text>

          <Text size="sm">
            The system was developed in partnership with the <Text component="span" fw={700}>Batangas City Local Government Unit</Text>, working closely with the <Text component="span" fw={700}>City Health Office</Text> and designated <Text component="span" fw={700}>healthcare personnel</Text> to address real-world challenges faced by barangay health workers.
          </Text>

          <Text size="sm">
            The project responds to the challenges faced by barangay health centers, where maternal records are often documented using paper forms or spreadsheets. These manual processes can be time-consuming, prone to errors, and difficult to access when needed.
          </Text>

          <Text size="sm" fw={600}>KONEK provides a lightweight and user-friendly digital platform designed to support the daily work of midwives and primary health workers. The system aims to:</Text>
          <List size="sm" spacing="xs" withPadding>
            <List.Item>Simplify maternal health data recording</List.Item>
            <List.Item>Improve accuracy and completeness of reports</List.Item>
            <List.Item>Speed up data retrieval and report generation</List.Item>
            <List.Item>Support better planning and decision-making at the city level</List.Item>
          </List>

          <Text size="sm">
            KONEK is designed to fit existing workflows and infrastructure, ensuring sustainability and long-term use within Batangas City.
          </Text>

          <Text size="sm">
            KONEK reflects a shared commitment to strengthening primary healthcare and improving maternal health outcomes through practical, community-based digital solutions.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
