import { Card, CardContent, Grid, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
	const [stats, setStats] = useState<{ totalIn: number; totalOut: number; balance: number } | null>(null);
	const [low, setLow] = useState<any[]>([]);
	useEffect(() => {
		(async () => {
			const products = (await api.get('/products')).data;
			const totalIn = products.reduce((s: number, p: any) => s + (p.totalIn || 0), 0);
			const totalOut = products.reduce((s: number, p: any) => s + (p.totalOut || 0), 0);
			const balance = products.reduce((s: number, p: any) => s + (p.balance || 0), 0);
			setStats({ totalIn, totalOut, balance });
			setLow(products.filter((p: any) => p.balance < p.min_stock));
		})();
	}, []);
	const data = stats ? [
		{ name: 'Inbound', value: stats.totalIn },
		{ name: 'Outbound', value: stats.totalOut },
		{ name: 'Balance', value: stats.balance },
	] : [];
	const colors = ['#1e88e5', '#90caf9', '#1565c0'];
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={6}>
				<Card>
					<CardContent>
						<Typography variant="h6">Overview</Typography>
						<div style={{ width: '100%', height: 300 }}>
							<ResponsiveContainer>
								<PieChart>
									<Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={100} label>
										{data.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</Grid>
			<Grid item xs={12} md={6}>
				<Card>
					<CardContent>
						<Typography variant="h6">Low Stock</Typography>
						<Typography variant="body2" color="text.secondary">{low.length} item(s) below minimum</Typography>
						<List dense sx={{ maxHeight: 220, overflow: 'auto', mt: 1 }}>
							{low.map((p) => (
								<ListItem key={p.product_code} disableGutters>
									<ListItemText primary={`${p.product_code} - ${p.product_name}`} secondary={`Balance ${p.balance} ${p.unit} / Min ${p.min_stock}`} />
								</ListItem>
							))}
						</List>
						<Button sx={{ mt: 1 }} variant="contained" onClick={async () => { await api.post('/alerts/low-stock'); }}>Email notify</Button>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
}