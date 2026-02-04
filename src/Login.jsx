import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Group, Anchor, Stack } from '@mantine/core';
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
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
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
  );
}