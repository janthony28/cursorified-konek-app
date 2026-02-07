import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Container, Paper, Text, TextInput, PasswordInput, Button, Group, Stack, Box, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import LegalPage from './components/legal/LegalPage';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLegalPage, setShowLegalPage] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // This talks to Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      notifications.show({ title: 'Login failed', message: error.message, color: 'red' });
    }
    setLoading(false);
  };

  if (showLegalPage) {
    return <LegalPage onBack={() => setShowLegalPage(false)} />;
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(165deg, #e6fcf5 0%, #b2f2e2 30%, #f0f4f8 70%, #fff 100%)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
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
      
      <Container size={420} style={{ flex: '0 1 auto', position: 'relative', zIndex: 1 }}>
        <Paper 
          className="login-card-reveal" 
          withBorder 
          shadow="xl" 
          p={40} 
          radius="xl" 
          style={{ 
            borderColor: 'rgba(12, 166, 120, 0.2)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(12, 166, 120, 0.05)',
          }}
        >
          {/* LOGO */}
          <Group justify="center" mb="xl">
            <img 
              src="/konek-logo.png" 
              alt="KONEK – KOmunidad NEtwork for Kalusugan" 
              style={{ 
                width: 180, 
                height: 'auto',
              }} 
            />
          </Group>

          <form onSubmit={handleLogin}>
            <Stack gap="md">
              <TextInput 
                label="Email" 
                placeholder="midwife@konek.ph" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="md"
                radius="md"
                styles={{
                  input: {
                    transition: 'all 0.2s ease',
                  }
                }}
              />
              
              <PasswordInput 
                label="Password" 
                placeholder="Your password" 
                required 
                mt="md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="md"
                radius="md"
                styles={{
                  input: {
                    transition: 'all 0.2s ease',
                  }
                }}
              />

              <Button 
                fullWidth 
                mt="xl" 
                color="teal" 
                type="submit" 
                loading={loading}
                size="md"
                radius="md"
                style={{
                  fontWeight: 600,
                  boxShadow: '0 4px 14px 0 rgba(12, 166, 120, 0.25)',
                }}
              >
                Login
              </Button>
              
              <Text c="dimmed" size="xs" ta="center" mt="md" style={{ lineHeight: 1.6 }}>
                By clicking Login, you agree to our{' '}
                <Anchor component="button" type="button" size="xs" c="teal.7" fw={600} onClick={() => setShowLegalPage(true)}>
                  Terms of Use
                </Anchor>
                {' '}and{' '}
                <Anchor component="button" type="button" size="xs" c="teal.7" fw={600} onClick={() => setShowLegalPage(true)}>
                  Privacy Policy
                </Anchor>.
              </Text>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}