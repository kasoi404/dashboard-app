import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../api';

export default function Users() {
	const [rows, setRows] = useState<any[]>([]);
	const [form, setForm] = useState<any>({ username: '', password: '', role: 'viewer', email: '' });
	async function load() {
		const data = (await api.get('/users')).data;
		setRows(data.map((r: any) => ({ id: r.id, ...r })));
	}
	useEffect(() => { load(); }, []);
	const cols: GridColDef[] = useMemo(() => [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'username', headerName: 'Username', width: 160 },
		{ field: 'role', headerName: 'Permission', width: 140 },
		{ field: 'email', headerName: 'Email', width: 200 },
	], []);
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		await api.post('/users', form);
		setForm({ username: '', password: '', role: 'viewer', email: '' });
		await load();
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Typography variant="h6">User Management</Typography>
			</Grid>
			<Grid item xs={12}>
				<Box sx={{ height: 400, background: '#fff' }}>
					<DataGrid rows={rows} columns={cols} disableRowSelectionOnClick />
				</Box>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1">Add User</Typography>
				<Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
					<TextField size="small" label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
					<TextField size="small" label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
					<TextField size="small" select label="Permission" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
						<MenuItem value="admin">admin</MenuItem>
						<MenuItem value="editor">editor</MenuItem>
						<MenuItem value="viewer">viewer</MenuItem>
					</TextField>
					<TextField size="small" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
					<Button type="submit" variant="contained">Save</Button>
				</Box>
			</Grid>
		</Grid>
	);
}