import { AppBar, Box, CssBaseline, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Sidebar } from './Sidebar';
import type { PropsWithChildren } from 'react';
import TopRightActions from '../components/TopRightActions';

const drawerWidth = 240;

export function AppLayout({ children }: PropsWithChildren) {
	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
				<Toolbar>
					<IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						Stock Management
					</Typography>
					<TopRightActions />
				</Toolbar>
			</AppBar>
			<Sidebar />
			<Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
				<Toolbar />
				{children}
			</Box>
		</Box>
	);
}