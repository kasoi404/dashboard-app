import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../api';

export default function Outbound() {
	const [rows, setRows] = useState<any[]>([]);
	const [products, setProducts] = useState<any[]>([]);
	const [employees, setEmployees] = useState<any[]>([]);
	const [form, setForm] = useState<any>({ transaction_no: '', outbound_date: '', outbound_time: '', product_code: '', quantity: 0, requester: '', recorder: '' });
	async function load() {
		const [out, prods, emps] = await Promise.all([api.get('/outbound'), api.get('/products'), api.get('/employees').catch(() => ({ data: [] }))]);
		setRows(out.data.map((r: any) => ({ id: r.id, ...r })));
		setProducts(prods.data);
		setEmployees(emps.data || []);
	}
	useEffect(() => { load(); }, []);
	const cols: GridColDef[] = useMemo(() => [
		{ field: 'transaction_no', headerName: 'Transaction No', width: 160 },
		{ field: 'outbound_date', headerName: 'Outbound Date', width: 140 },
		{ field: 'outbound_time', headerName: 'Outbound Time', width: 140 },
		{ field: 'product_code', headerName: 'Product Code', width: 140 },
		{ field: 'product_name', headerName: 'Product List', width: 200 },
		{ field: 'quantity', headerName: 'Outbound Quantity', width: 150 },
		{ field: 'unit', headerName: 'Unit', width: 100 },
		{ field: 'requester', headerName: 'Requester', width: 140 },
		{ field: 'recorder', headerName: 'Recorder', width: 140 },
		{ field: 'record_time', headerName: 'Record Time', width: 160 },
	], []);
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		await api.post('/outbound', form);
		setForm({ transaction_no: '', outbound_date: '', outbound_time: '', product_code: '', quantity: 0, requester: '', recorder: '' });
		await load();
	}
	async function downloadOutboundPdf() {
		const res = await api.get('/exports/outbound.pdf', { responseType: 'blob' });
		const blob = new Blob([res.data]);
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'outbound.pdf';
		link.click();
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>Outbound</Typography>
				<Button variant="outlined" onClick={downloadOutboundPdf}>Export PDF</Button>
			</Grid>
			<Grid item xs={12}>
				<Box sx={{ height: 400, background: '#fff' }}>
					<DataGrid rows={rows} columns={cols} disableRowSelectionOnClick />
				</Box>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1">Add Outbound</Typography>
				<Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
					<TextField size="small" label="Transaction No" value={form.transaction_no} onChange={(e) => setForm({ ...form, transaction_no: e.target.value })} required />
					<TextField size="small" label="Outbound Date" type="date" InputLabelProps={{ shrink: true }} value={form.outbound_date} onChange={(e) => setForm({ ...form, outbound_date: e.target.value })} required />
					<TextField size="small" label="Outbound Time" type="time" InputLabelProps={{ shrink: true }} value={form.outbound_time} onChange={(e) => setForm({ ...form, outbound_time: e.target.value })} required />
					<TextField size="small" select label="Product Code" value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} required>
						{products.map((p) => (<MenuItem key={p.product_code} value={p.product_code}>{p.product_code} - {p.product_name}</MenuItem>))}
					</TextField>
					<TextField size="small" type="number" label="Outbound Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
					<TextField size="small" select label="Requester" value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })}>
						{employees.map((emp) => (<MenuItem key={emp.name} value={emp.name}>{emp.name}</MenuItem>))}
					</TextField>
					<TextField size="small" select label="Recorder" value={form.recorder} onChange={(e) => setForm({ ...form, recorder: e.target.value })}>
						{employees.map((emp) => (<MenuItem key={emp.name} value={emp.name}>{emp.name}</MenuItem>))}
					</TextField>
					<Button type="submit" variant="contained">Save</Button>
				</Box>
			</Grid>
		</Grid>
	);
}