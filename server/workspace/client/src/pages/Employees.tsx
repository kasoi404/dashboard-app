import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../api';

export default function Employees() {
	const [rows, setRows] = useState<any[]>([]);
	const [form, setForm] = useState<any>({ employee_code: '', name: '', position: '', email: '', picture: null as File | null });
	async function load() {
		const data = (await api.get('/employees')).data;
		setRows(data.map((r: any) => ({ id: r.id, ...r })));
	}
	useEffect(() => { load(); }, []);
	const cols: GridColDef[] = useMemo(() => [
		{ field: 'employee_code', headerName: 'Employee Code', width: 160 },
		{ field: 'name', headerName: 'Name', width: 180 },
		{ field: 'position', headerName: 'Position', width: 140 },
		{ field: 'email', headerName: 'Employee Email', width: 200 },
		{ field: 'picture', headerName: 'Employee Picture', width: 160, renderCell: (params) => params.value ? <img src={params.value} alt="pic" style={{ height: 40, borderRadius: 6 }} /> : null },
	], []);
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const fd = new FormData();
		Object.entries(form).forEach(([k, v]) => { if (k === 'picture') { if (v) fd.append('picture', v); } else { fd.append(k, String(v ?? '')); } });
		await api.post('/employees', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
		setForm({ employee_code: '', name: '', position: '', email: '', picture: null });
		await load();
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Typography variant="h6">Employees</Typography>
			</Grid>
			<Grid item xs={12}>
				<Box sx={{ height: 400, background: '#fff' }}>
					<DataGrid rows={rows} columns={cols} disableRowSelectionOnClick />
				</Box>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1">Add Employee</Typography>
				<Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
					<TextField size="small" label="Employee Code" value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} required />
					<TextField size="small" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
					<TextField size="small" label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
					<TextField size="small" label="Employee Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
					<Button variant="outlined" component="label">Picture<input type="file" hidden onChange={(e) => setForm({ ...form, picture: e.target.files?.[0] || null })} /></Button>
					<Button type="submit" variant="contained">Save</Button>
				</Box>
			</Grid>
		</Grid>
	);
}