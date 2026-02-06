import { AppShell, Burger, Group, NavLink, Text, Button } from '@mantine/core';
import { LogOut, LayoutDashboard, FileText, Activity, Info, Plus, Copyright } from 'lucide-react';

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
      header={{ height: 64 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !mobileOpened, desktop: !desktopOpened } }}
      padding="md"
    >
      <AppShell.Header
        style={{
          boxShadow: '0 2px 12px rgba(12, 166, 120, 0.08)',
          borderBottom: '1px solid rgba(12, 166, 120, 0.12)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger 
              opened={mobileOpened} 
              onClick={toggleMobile} 
              hiddenFrom="sm" 
              size="sm"
              color="teal"
            />
            <Burger 
              opened={desktopOpened} 
              onClick={toggleDesktop} 
              visibleFrom="sm" 
              size="sm"
              color="teal"
            />
            <img 
              src="/konek-logo.png" 
              alt="KONEK" 
              style={{ 
                height: 36, 
                width: 'auto', 
                flexShrink: 0,
              }} 
            />
            <Text fw={700} size="md" component="span" style={{ letterSpacing: '-0.02em' }}>
              <Text component="span" c="#0ca678" fw={700}>KO</Text>
              <Text component="span" c="dark.6">munidad </Text>
              <Text component="span" c="#0ca678" fw={700}>NE</Text>
              <Text component="span" c="dark.6">twork for </Text>
              <Text component="span" c="#0ca678" fw={700}>K</Text>
              <Text component="span" c="dark.6">alusugan</Text>
            </Text>
          </Group>
          <Group>
            <Button 
              variant="subtle" 
              color="red" 
              size="sm" 
              leftSection={<LogOut size={14} />} 
              onClick={handleLogout}
              style={{
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar 
        p="md" 
        style={{ 
          borderRight: '1px solid rgba(12, 166, 120, 0.1)',
          background: 'rgba(255, 255, 255, 0.98)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
        <Button 
          fullWidth 
          size="md" 
          color="teal" 
          leftSection={<Plus size={20} />} 
          onClick={handleAddClick} 
          mb="lg" 
          style={{ 
            boxShadow: '0 4px 14px 0 rgba(12, 166, 120, 0.25)',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }} 
          disabled={modalOpened}
        >
          Add New Record
        </Button>

        <Text 
          c="dimmed" 
          size="xs" 
          fw={700} 
          mb="sm"
          style={{
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          MAIN MENU
        </Text>
        <NavLink 
          label="Dashboard" 
          leftSection={<LayoutDashboard size={18} />} 
          active={activePage === 'dashboard'} 
          onClick={() => handleNavClick('dashboard')} 
          variant="light" 
          color="teal"
          style={{
            borderRadius: '8px',
            marginBottom: '4px',
            fontWeight: activePage === 'dashboard' ? 600 : 500,
          }}
        />
        <NavLink 
          label="Maternal Records" 
          leftSection={<FileText size={18} />} 
          active={activePage === 'records'} 
          onClick={() => { setFilterStatus('all'); handleNavClick('records'); }} 
          variant="light" 
          color="teal"
          style={{
            borderRadius: '8px',
            marginBottom: '4px',
            fontWeight: activePage === 'records' ? 600 : 500,
          }}
        />
        <NavLink 
          label="Reports" 
          leftSection={<Activity size={18} />} 
          active={activePage === 'reports'} 
          onClick={() => handleNavClick('reports')} 
          variant="light" 
          color="teal"
          style={{
            borderRadius: '8px',
            marginBottom: '4px',
            fontWeight: activePage === 'reports' ? 600 : 500,
          }}
        />
        <Text 
          c="dimmed" 
          size="xs" 
          fw={700} 
          mt="xl" 
          mb="sm"
          style={{
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          SYSTEM
        </Text>
        <NavLink 
          label="Help Center" 
          leftSection={<Info size={18} />} 
          active={activePage === 'help'} 
          onClick={() => handleNavClick('help')} 
          variant="light" 
          color="teal"
          style={{
            borderRadius: '8px',
            marginBottom: '4px',
            fontWeight: activePage === 'help' ? 600 : 500,
          }}
        />
        </div>
        <Group gap={2} wrap="wrap" mt="auto" pt="sm" style={{ borderTop: '1px solid rgba(12, 166, 120, 0.1)' }}>
          <Group gap={2} wrap="nowrap">
            <Copyright size={10} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed" fw={500} style={{ fontSize: '10px', lineHeight: 1.3 }}>
              All rights reserved
            </Text>
          </Group>
          <Text size="xs" c="dimmed" fw={600} style={{ fontSize: '10px', lineHeight: 1.3 }}>
            PANALIGAN, AQUINO, BAUAN, CABRERA, PALBACAL, SEBUC
          </Text>
        </Group>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          background: 'linear-gradient(180deg, #f8fbfa 0%, #f0f4f8 100%)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
