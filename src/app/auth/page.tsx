'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  useTheme,
  useMediaQuery,
  CssBaseline,
  GlobalStyles,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useUserApi } from '@/wrappers/UserApiWrapper';

export default function LoginForm() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
  });
  const userApi = useUserApi();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user = await userApi.login(formData);
      if(!user) throw "Неудачная авторизация"
      router.push('/');
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={{
        body: { 
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }
      }} />
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          p: isMobile ? 2 : 0,
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: isMobile ? '100%' : 400,
              p: isMobile ? 3 : 4,
              bgcolor: 'background.paper',
              borderRadius: isMobile ? 0 : 2,
              boxShadow: isMobile ? 'none' : theme.shadows[3],
            }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              gutterBottom 
              sx={{ 
                textAlign: 'center',
                fontWeight: 500,
                mb: 3,
              }}
            >
              Вход в систему
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Никнейм"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  size={isMobile ? 'small' : 'medium'}
                />

                <TextField
                  required
                  fullWidth
                  type="password"
                  label="Пароль"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  size={isMobile ? 'small' : 'medium'}
                />

                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  loading={loading}
                  sx={{ mt: 1 }}
                >
                  Войти
                </LoadingButton>
              </Box>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Нет аккаунта?{' '}
                <Link 
                  href="/register" 
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}