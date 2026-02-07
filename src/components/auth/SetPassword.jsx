import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Container,
  Paper,
  Text,
  PasswordInput,
  Button,
  Group,
  Stack,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

const MIN_PASSWORD_LENGTH = 6;

export default function SetPassword({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notifications.show({ title: 'Passwords do not match', message: 'Please re-enter your password.', color: 'red' });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      notifications.show({
        title: 'Password too short',
        message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
        color: 'red',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      notifications.show({ title: 'Could not set password', message: error.message, color: 'red' });
      setLoading(false);
      return;
    }

    notifications.show({ title: 'Password set', message: 'You can now sign in with your email and password.', color: 'teal' });
    setLoading(false);
    onSuccess();
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
          <Group justify="center" mb="xl">
            <img
              src="/konek-logo.png"
              alt="KONEK – KOmunidad NEtwork for Kalusugan"
              style={{ width: 180, height: 'auto' }}
            />
          </Group>

          <Text ta="center" fw={700} size="lg" c="dark.8" mb="xs">
            Set your password
          </Text>
          <Text ta="center" size="sm" c="dimmed" mb="xl">
            Choose a password to sign in to KONEK next time.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <PasswordInput
                label="New password"
                placeholder="At least 6 characters"
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="md"
                radius="md"
                styles={{ input: { transition: 'all 0.2s ease' } }}
              />
              <PasswordInput
                label="Confirm password"
                placeholder="Re-enter your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="md"
                radius="md"
                styles={{ input: { transition: 'all 0.2s ease' } }}
              />
              <Button
                fullWidth
                mt="xl"
                color="teal"
                type="submit"
                loading={loading}
                size="md"
                radius="md"
                style={{ fontWeight: 600, boxShadow: '0 4px 14px 0 rgba(12, 166, 120, 0.25)' }}
              >
                Set password & continue
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
