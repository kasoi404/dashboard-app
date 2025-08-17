import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function TopRightActions() {
	const navigate = useNavigate();
	function logout() {
		localStorage.removeItem('token');
		navigate('/login');
	}
	return (
		<Stack direction="row" spacing={1}>
			<Button variant="outlined" onClick={logout}>Logout</Button>
		</Stack>
	);
}