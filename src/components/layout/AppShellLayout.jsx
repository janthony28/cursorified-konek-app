import { AppShell, Burger, Group, NavLink, Text, Button } from '@mantine/core';
import { Stethoscope, LogOut, LayoutDashboard, FileText, Activity, Users, Info, Plus } from 'lucide-react';

export default function AppShellLayout({
  mobileOpened,
  toggleMobile,
  desktopOpened,
  toggleDesktop,
  activePage,
  handleNavClick,
  handleAddClick,
  handleLogout,
  isAdmin,
  filterStatus,
  setFilterStatus,
  modalOpened,
  children,
}) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !mobileOpened, desktop: !desktopOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Stethoscope color="#0ca678" size={28} />
            <Text fw={800} size="xl" variant="gradient" gradient={{ from: 'teal', to: 'lime', deg: 45 }}>KONEK Health</Text>
          </Group>
          <Group><Button variant="subtle" color="red" size="xs" leftSection={<LogOut size={14} />} onClick={handleLogout}>Logout</Button></Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Button fullWidth size="md" color="teal" leftSection={<Plus size={20} />} onClick={handleAddClick} mb="lg" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} disabled={modalOpened}>
          Add New Record
        </Button>

        <Text c="dimmed" size="xs" fw={700} mb="sm">MAIN MENU</Text>
        <NavLink label="Dashboard" leftSection={<LayoutDashboard size={16} />} active={activePage === 'dashboard'} onClick={() => handleNavClick('dashboard')} variant="light" color="teal" />
        <NavLink label="Maternal Records" leftSection={<FileText size={16} />} active={activePage === 'records'} onClick={() => { setFilterStatus('all'); handleNavClick('records'); }} variant="light" color="teal" />
        <NavLink label="Reports" leftSection={<Activity size={16} />} active={activePage === 'reports'} onClick={() => handleNavClick('reports')} variant="light" color="teal" />
        <Text c="dimmed" size="xs" fw={700} mt="xl" mb="sm">SYSTEM</Text>
        {isAdmin && <NavLink label="Manage Accounts" leftSection={<Users size={16} />} active={activePage === 'accounts'} onClick={() => handleNavClick('accounts')} variant="light" color="teal" />}
        <NavLink label="Help Center" leftSection={<Info size={16} />} active={activePage === 'help'} onClick={() => handleNavClick('help')} variant="light" color="teal" />
      </AppShell.Navbar>

      <AppShell.Main bg="#f8f9fa">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
