import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../api';
import ReportsButtons from './ReportsButtons';

export default function Stock() {
	const [rows, setRows] = useState<any[]>([]);
	const [employees, setEmployees] = useState<any[]>([]);
	const [form, setForm] = useState<any>({ product_code: '', product_name: '', unit: '', min_stock: 0, barcode: '', picture: null as File | null, verify_by: '', verify_time: '' });
	async function load() {
		const [productsRes, employeesRes] = await Promise.all([api.get('/products'), api.get('/employees').catch(() => ({ data: [] }))]);
		setRows(productsRes.data.map((r: any) => ({ id: r.id, ...r })));
		setEmployees(employeesRes.data || []);
	}
	useEffect(() => { load(); }, []);
	const cols: GridColDef[] = useMemo(() => [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'product_code', headerName: 'Product Code', width: 140 },
		{ field: 'product_name', headerName: 'Product List', width: 200 },
		{ field: 'unit', headerName: 'Unit', width: 100 },
		{ field: 'totalIn', headerName: 'Total Inbound', width: 130 },
		{ field: 'totalOut', headerName: 'Total Outbound', width: 140 },
		{ field: 'balance', headerName: 'Balance', width: 110 },
		{ field: 'min_stock', headerName: 'Min Stock', width: 120 },
		{ field: 'barcode', headerName: 'Barcode', width: 140 },
		{ field: 'picture', headerName: 'Picture', width: 110, renderCell: (p) => p.value ? <img src={p.value} style={{ height: 40, borderRadius: 6 }} /> : null },
		{ field: 'verify_by', headerName: 'Verify By', width: 140 },
		{ field: 'verify_time', headerName: 'Verify Time', width: 160 },
		{ field: 'low', headerName: 'Low Stock?', width: 120, valueGetter: (v, r) => (r.balance < r.min_stock ? 'YES' : 'NO') },
		{ field: 'lastIn', headerName: 'Last Inbound Date', width: 160 },
		{ field: 'lastOut', headerName: 'Last Outbound Date', width: 160 },
	], []);
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const fd = new FormData();
		Object.entries(form).forEach(([k, v]) => { if (k === 'picture') { if (v) fd.append('picture', v as File); } else { fd.append(k, String(v ?? '')); } });
		await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
		setForm({ product_code: '', product_name: '', unit: '', min_stock: 0, barcode: '', picture: null, verify_by: '', verify_time: '' });
		await load();
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Typography variant="h6">Current Stock</Typography>
				<ReportsButtons />
			</Grid>
			<Grid item xs={12}>
				<Box sx={{ height: 400, background: '#fff' }}>
					<DataGrid rows={rows} columns={cols} disableRowSelectionOnClick />
				</Box>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1">Add Product</Typography>
				<Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
					<TextField size="small" label="Product Code" value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} required />
					<TextField size="small" label="Product List" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required />
					<TextField size="small" label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
					<TextField size="small" type="number" label="Min Stock" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} />
					<TextField size="small" label="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
					<Button variant="outlined" component="label">Picture<input type="file" hidden onChange={(e) => setForm({ ...form, picture: e.target.files?.[0] || null })} /></Button>
					<TextField size="small" select label="Verify By" value={form.verify_by} onChange={(e) => setForm({ ...form, verify_by: e.target.value })}>
						{employees.map((emp) => (<MenuItem key={emp.name} value={emp.name}>{emp.name}</MenuItem>))}
					</TextField>
					<TextField size="small" label="Verify Time" value={form.verify_time} onChange={(e) => setForm({ ...form, verify_time: e.target.value })} />
					<Button type="submit" variant="contained">Save</Button>
				</Box>
			</Grid>
		</Grid>
	);
}