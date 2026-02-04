import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Group, Anchor, Stack, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Stethoscope } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(165deg, #e6fcf5 0%, #b2f2e2 30%, #f0f4f8 70%, #fff 100%)',
        padding: 24,
      }}
    >
      <Container size={420} style={{ flex: '0 1 auto' }}>
        <Paper className="login-card-reveal" withBorder shadow="xl" p={30} radius="lg" style={{ borderColor: 'rgba(12, 166, 120, 0.2)' }}>
        {/* LOGO SECTION [Source: PDF Page 2] */}
        <Group justify="center" mb="md">
          <Stethoscope size={64} color="#0ca678" strokeWidth={1.5} />
        </Group>
        
        <Title align="center" order={2} mb="xs">
          KONEK
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          Komunidad Network for Kalusugan
        </Text>

        <form onSubmit={handleLogin}>
          <Stack>
            <TextInput 
              label="Email" 
              placeholder="midwife@konek.ph" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <PasswordInput 
              label="Password" 
              placeholder="Your password" 
              required 
              mt="md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Group justify="space-between" mt="lg">
              <Anchor component="button" size="sm" type="button">
                Forgot password?
              </Anchor>
            </Group>

            <Button fullWidth mt="xl" color="teal" type="submit" loading={loading}>
              Login
            </Button>
            
            <Text c="dimmed" size="xs" ta="center" mt="md">
                By clicking Login, you agree to our Terms of Use and Privacy Policy.
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
    </Box>
  );
}