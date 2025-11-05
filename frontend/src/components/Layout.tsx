import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material'

const drawerWidth = 260

interface MenuItem {
  text: string
  icon: JSX.Element
  path: string
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Pre-Delivery', icon: <BusinessIcon />, path: '/pre-delivery' },
  { text: 'Post Delivery', icon: <DeliveryIcon />, path: '/post-delivery' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawer = (
    <Box sx={{ height: '100%' }}>
      <Toolbar
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E2E8F0',
          minHeight: 80,
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          py: 2.5,
          px: 3,
        }}
      >
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: 0.5,
            color: '#111827',
          }}
        >
          Deep Research
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#6B7280',
            fontWeight: 300,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.6875rem',
          }}
        >
          Task metrics dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 3, px: 2.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    backgroundColor: '#fef5e7',
                    color: '#f39c12',
                    borderLeft: '3px solid #f39c12',
                    '&:hover': {
                      backgroundColor: '#fdebd0',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#f39c12',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'inherit' : '#6B7280',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '-0.01em',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          display: { xs: 'block', sm: 'none' },
        }}
      >
        <Toolbar sx={{ minHeight: 56, backgroundColor: 'transparent' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              color: '#475569',
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'white',
              borderRight: '1px solid #E2E8F0',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'white',
              borderRight: '1px solid #E2E8F0',
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          pt: { xs: 10, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#FFFFFF',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

