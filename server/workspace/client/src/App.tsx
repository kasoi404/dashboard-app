import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { theme } from './theme';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import Employees from './pages/Employees';
import Users from './pages/Users';
import Login from './pages/Login';
import { SnackbarProvider } from 'notistack';
import { CssBaseline } from '@mui/material';
import type { ReactElement } from 'react';

function PrivateRoute({ children }: { children: ReactElement }) {
	const token = localStorage.getItem('token');
	return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
	return (
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<SnackbarProvider maxSnack={3} autoHideDuration={3000}>
					<BrowserRouter>
						<Routes>
							<Route path="/login" element={<Login />} />
							<Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
							<Route path="/stock" element={<PrivateRoute><AppLayout><Stock /></AppLayout></PrivateRoute>} />
							<Route path="/inbound" element={<PrivateRoute><AppLayout><Inbound /></AppLayout></PrivateRoute>} />
							<Route path="/outbound" element={<PrivateRoute><AppLayout><Outbound /></AppLayout></PrivateRoute>} />
							<Route path="/employees" element={<PrivateRoute><AppLayout><Employees /></AppLayout></PrivateRoute>} />
							<Route path="/users" element={<PrivateRoute><AppLayout><Users /></AppLayout></PrivateRoute>} />
						</Routes>
					</BrowserRouter>
				</SnackbarProvider>
			</ThemeProvider>
		</StyledEngineProvider>
	);
}
