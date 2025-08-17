import { useEffect, useMemo, useState } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../api';

export default function Inbound() {
	const [rows, setRows] = useState<any[]>([]);
	const [products, setProducts] = useState<any[]>([]);
	const [employees, setEmployees] = useState<any[]>([]);
	const [form, setForm] = useState<any>({ transaction_no: '', inbound_date: '', inbound_time: '', product_code: '', quantity: 0, requester: '', recorder: '' });
	async function load() {
		const [inb, prods, emps] = await Promise.all([api.get('/inbound'), api.get('/products'), api.get('/employees').catch(() => ({ data: [] }))]);
		setRows(inb.data.map((r: any) => ({ id: r.id, ...r })));
		setProducts(prods.data);
		setEmployees(emps.data || []);
	}
	useEffect(() => { load(); }, []);
	const cols: GridColDef[] = useMemo(() => [
		{ field: 'transaction_no', headerName: 'Transaction No', width: 160 },
		{ field: 'inbound_date', headerName: 'Inbound Date', width: 140 },
		{ field: 'inbound_time', headerName: 'Inbound Time', width: 140 },
		{ field: 'product_code', headerName: 'Product Code', width: 140 },
		{ field: 'product_name', headerName: 'Product List', width: 200 },
		{ field: 'quantity', headerName: 'Inbound Quantity', width: 150 },
		{ field: 'unit', headerName: 'Unit', width: 100 },
		{ field: 'requester', headerName: 'Requester', width: 140 },
		{ field: 'recorder', headerName: 'Recorder', width: 140 },
		{ field: 'record_time', headerName: 'Record Time', width: 160 },
	], []);
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		await api.post('/inbound', form);
		setForm({ transaction_no: '', inbound_date: '', inbound_time: '', product_code: '', quantity: 0, requester: '', recorder: '' });
		await load();
	}
	async function downloadInboundPdf() {
		const res = await api.get('/exports/inbound.pdf', { responseType: 'blob' });
		const blob = new Blob([res.data]);
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'inbound.pdf';
		link.click();
	}
	return (
		<Box sx={{ display: 'grid', gap: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>Inbound</Typography>
				<Button variant="outlined" onClick={downloadInboundPdf}>Export PDF</Button>
			</Box>
			<Box sx={{ height: 400, background: '#fff' }}>
				<DataGrid rows={rows} columns={cols} disableRowSelectionOnClick />
			</Box>
			<Typography variant="subtitle1">Add Inbound</Typography>
			<Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
				<TextField size="small" label="Transaction No" value={form.transaction_no} onChange={(e) => setForm({ ...form, transaction_no: e.target.value })} required />
				<TextField size="small" label="Inbound Date" type="date" InputLabelProps={{ shrink: true }} value={form.inbound_date} onChange={(e) => setForm({ ...form, inbound_date: e.target.value })} required />
				<TextField size="small" label="Inbound Time" type="time" InputLabelProps={{ shrink: true }} value={form.inbound_time} onChange={(e) => setForm({ ...form, inbound_time: e.target.value })} required />
				<TextField size="small" select label="Product Code" value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} required>
					{products.map((p) => (<MenuItem key={p.product_code} value={p.product_code}>{p.product_code} - {p.product_name}</MenuItem>))}
				</TextField>
				<TextField size="small" type="number" label="Inbound Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
				<TextField size="small" select label="Requester" value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })}>
					{employees.map((emp) => (<MenuItem key={emp.name} value={emp.name}>{emp.name}</MenuItem>))}
				</TextField>
				<TextField size="small" select label="Recorder" value={form.recorder} onChange={(e) => setForm({ ...form, recorder: e.target.value })}>
					{employees.map((emp) => (<MenuItem key={emp.name} value={emp.name}>{emp.name}</MenuItem>))}
				</TextField>
				<Button type="submit" variant="contained">Save</Button>
			</Box>
		</Box>
	);
}