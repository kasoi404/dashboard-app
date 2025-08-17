import { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
	const [form, setForm] = useState({ username: '', password: '' });
	const [error, setError] = useState('');
	const navigate = useNavigate();
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		try {
			const res = await api.post('/auth/login', form);
			localStorage.setItem('token', res.data.token);
			navigate('/');
		} catch (err: any) {
			setError(err?.response?.data?.message || 'Login failed');
		}
	}
	return (
		<Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#1565c0 0%, #1e88e5 100%)' }}>
			<Card sx={{ minWidth: 360 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>Sign in</Typography>
					<Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
						<TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
						<TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
						{error && <Typography color="error" variant="body2">{error}</Typography>}
						<Button type="submit" variant="contained">Login</Button>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}