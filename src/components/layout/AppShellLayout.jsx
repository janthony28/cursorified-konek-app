import { AppShell, Burger, Group, NavLink, Text, Button } from '@mantine/core';
import { LogOut, LayoutDashboard, FileText, Activity, Info, Plus, Copyright, BarChart3, BookOpen } from 'lucide-react';

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
  showStatisticsTab = false,
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderBottom: '2px solid #22B14C',
          background: '#22B14C',
          color: 'white',
        }}
      >
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0, alignItems: 'center' }}>
            <Burger 
              opened={mobileOpened} 
              onClick={toggleMobile} 
              hiddenFrom="sm" 
              size="sm"
              color="white"
            />
            <Burger 
              opened={desktopOpened} 
              onClick={toggleDesktop} 
              visibleFrom="sm" 
              size="sm"
              color="white"
            />
            <Group gap={4} wrap="nowrap" style={{ alignItems: 'center' }}>
              <img 
                src="/batangas-city-seal.png" 
                alt="Batangas City Official Seal" 
                style={{ 
                  height: 44, 
                  width: 'auto', 
                  flexShrink: 0,
                  display: 'block',
                }} 
              />
              <img 
                src="/konek-logo.png" 
                alt="KONEK Logo" 
                style={{ 
                  height: 44, 
                  width: 'auto', 
                  flexShrink: 0,
                  display: 'block',
                }} 
              />
            </Group>
            <Text fw={700} size="md" component="span" c="white" style={{ letterSpacing: '-0.02em', marginLeft: 4 }}>
              <Text component="span" c="white" fw={700}>KO</Text>
              <Text component="span" c="white" opacity={0.9}>munidad </Text>
              <Text component="span" c="white" fw={700}>NE</Text>
              <Text component="span" c="white" opacity={0.9}>twork for </Text>
              <Text component="span" c="white" fw={700}>K</Text>
              <Text component="span" c="white" opacity={0.9}>alusugan</Text>
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
                color: 'white',
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
          borderRight: '1px solid rgba(34, 177, 76, 0.2)',
          background: '#ffffff',
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
            boxShadow: '0 4px 14px 0 rgba(34, 177, 76, 0.25)',
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
        {showStatisticsTab && (
          <NavLink
            label="Statistics"
            leftSection={<BarChart3 size={18} />}
            active={activePage === 'statistics'}
            onClick={() => handleNavClick('statistics')}
            variant="light"
            color="teal"
            style={{
              borderRadius: '8px',
              marginBottom: '4px',
              fontWeight: activePage === 'statistics' ? 600 : 500,
            }}
          />
        )}
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
        <NavLink 
          label="About" 
          leftSection={<BookOpen size={18} />} 
          active={activePage === 'about'} 
          onClick={() => handleNavClick('about')} 
          variant="light" 
          color="teal"
          style={{
            borderRadius: '8px',
            marginBottom: '4px',
            fontWeight: activePage === 'about' ? 600 : 500,
          }}
        />
        </div>
        <Group gap={2} wrap="wrap" mt="auto" pt="sm" style={{ borderTop: '1px solid rgba(34, 177, 76, 0.2)' }}>
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
          background: '#f5f5e8',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
