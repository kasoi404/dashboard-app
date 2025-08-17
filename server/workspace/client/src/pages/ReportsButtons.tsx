import { Button, Stack } from '@mui/material';
import api from '../api';

export default function ReportsButtons() {
	async function download(url: string, filename: string) {
		const res = await api.get(url, { responseType: 'blob' });
		const blob = new Blob([res.data]);
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
	}
	return (
		<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
			<Button variant="outlined" onClick={() => download('/exports/products.xlsx', 'products.xlsx')}>Export Products (Excel)</Button>
			<Button variant="outlined" onClick={() => download('/exports/inbound.pdf', 'inbound.pdf')}>Export Inbound (PDF)</Button>
			<Button variant="outlined" onClick={() => download('/exports/outbound.pdf', 'outbound.pdf')}>Export Outbound (PDF)</Button>
		</Stack>
	);
}