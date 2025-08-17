import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: { main: '#1565c0' },
		secondary: { main: '#1e88e5' },
		background: { default: '#f5f8ff', paper: '#ffffff' },
	},
	shape: { borderRadius: 10 },
	typography: { fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif' },
	components: {
		MuiAppBar: { styleOverrides: { root: { background: 'linear-gradient(90deg,#1565c0,#1e88e5)' } } },
	}
});