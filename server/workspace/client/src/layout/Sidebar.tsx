import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LoginIcon from '@mui/icons-material/Login';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export function Sidebar() {
	const location = useLocation();
	const items = [
		{ to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
		{ to: '/stock', label: 'Current Stock', icon: <InventoryIcon /> },
		{ to: '/inbound', label: 'Inbound', icon: <CallReceivedIcon /> },
		{ to: '/outbound', label: 'Outbound', icon: <CallMadeIcon /> },
		{ to: '/employees', label: 'Employees', icon: <GroupIcon /> },
		{ to: '/users', label: 'User Management', icon: <SecurityIcon /> },
	];
	return (
		<Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
			<Toolbar />
			<List>
				{items.map((it) => (
					<ListItemButton key={it.to} component={Link} to={it.to} selected={location.pathname === it.to}>
						<ListItemIcon>{it.icon}</ListItemIcon>
						<ListItemText primary={it.label} />
					</ListItemButton>
				))}
			</List>
		</Drawer>
	);
}