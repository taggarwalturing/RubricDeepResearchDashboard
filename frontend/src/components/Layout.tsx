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
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Business as BusinessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'

const drawerWidth = 260
const collapsedDrawerWidth = 72

interface MenuItem {
  text: string
  icon: JSX.Element
  path: string
}

const menuItems: MenuItem[] = [
  { text: 'Pre-Delivery', icon: <BusinessIcon />, path: '/pre-delivery' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const currentDrawerWidth = collapsed ? collapsedDrawerWidth : drawerWidth

  const drawer = (
    <Box sx={{ position: 'relative', height: '100%', overflow: 'visible' }}>
      {/* Collapse Toggle Button - Floating at Divider Line */}
      <IconButton
        onClick={handleCollapseToggle}
        sx={{
          position: 'absolute',
          top: 70,
          right: -20,
          width: 40,
          height: 40,
          backgroundColor: 'white',
          border: '2px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1300,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#4F7DF3',
            borderColor: '#4F7DF3',
            boxShadow: '0 4px 12px rgba(79, 125, 243, 0.3)',
            '& svg': {
              color: 'white',
            },
          },
          '& svg': {
            color: '#6B7280',
            transition: 'color 0.2s ease',
          },
        }}
      >
        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      <Toolbar
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E2E8F0',
          minHeight: 80,
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'flex-start',
          justifyContent: 'center',
          py: 2.5,
          px: collapsed ? 1.5 : 3,
          transition: 'all 0.3s ease',
        }}
      >
        {!collapsed ? (
          <>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: '-0.02em',
                mb: 0.5,
                background: 'linear-gradient(135deg, #4F7DF3 0%, #6B8AFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Delivery Analytics
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6B7280',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
              }}
            >
              Professional Dashboard
            </Typography>
          </>
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #4F7DF3 0%, #6B8AFF 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            DA
          </Box>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ pt: 3, px: collapsed ? 1.5 : 2.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          const button = (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  px: collapsed ? 1.5 : 2,
                  transition: 'all 0.3s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '&.Mui-selected': {
                    backgroundColor: 'linear-gradient(135deg, #4F7DF3 0%, #6B8AFF 100%)',
                    background: 'linear-gradient(135deg, #4F7DF3 0%, #6B8AFF 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(79, 125, 243, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4169E1 0%, #6B8AFF 100%)',
                      boxShadow: '0 4px 12px rgba(79, 125, 243, 0.4)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                    transform: collapsed ? 'scale(1.05)' : 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'inherit' : '#6B7280',
                    minWidth: collapsed ? 'auto' : 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9375rem',
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: '-0.01em',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
          
          return collapsed ? (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              {button}
            </Tooltip>
          ) : (
            button
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
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: 72, backgroundColor: 'transparent' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: '#475569',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)',
                border: '1px solid #DBEAFE',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Live Dashboard
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 } }}
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
              width: currentDrawerWidth,
              backgroundColor: 'white',
              borderRight: '1px solid #E2E8F0',
              boxShadow: 'none',
              transition: 'width 0.3s ease',
              overflow: 'visible',
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
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          backgroundColor: '#FFFFFF',
          minHeight: '100vh',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: 72 }} />
        {children}
      </Box>
    </Box>
  )
}

