import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Divider,
  IconButton,
  Tooltip,
  List as MuiList,
  Drawer as MuiDrawer,
  ListItemText as MuiListItemText,
  ListItemIcon as MuiListItemIcon,
  ListItemButton as MuiListItemButton,
  Collapse,
  Box,
  ListItem,
  useMediaQuery,
  SwipeableDrawer,
  Typography,
} from '@mui/material'
import {
  School as SchoolIcon,
  Person as PersonIcon,
  NoteAlt as NoteAltIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  FactCheck as FactCheckIcon,
  EmojiEvents as EmojiEventsIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  SmartDisplay as SmartDisplayIcon,
  ImportContacts as ImportContactsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material'
import { styled, useTheme } from '@mui/material/styles'

import useAuth from '@/hook/useAuth'
import CustomLink from '@/components/CustomLink'

const drawerWidth = 240

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open ? openedMixin(theme) : closedMixin(theme)),
  '& .MuiDrawer-paper': {
    ...(open ? openedMixin(theme) : closedMixin(theme)),
    overflowY: 'auto',
  },
}))

const List = styled(MuiList)({
  width: '100%',
})

const ListItemButton = styled(MuiListItemButton)(({ theme, open }) => ({
  minHeight: 48,
  justifyContent: open ? 'initial' : 'center',
  px: 2.5,
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
  },
}))

const ListItemButtonSubMenu = styled(MuiListItemButton)(({ theme, open }) => ({
  minHeight: 48,
  justifyContent: open ? 'initial' : 'center',
  ...(open && {
    paddingLeft: theme.spacing(4),
  }),
}))

const ListItemIcon = styled(MuiListItemIcon)(({ theme, open }) => ({
  minWidth: 0,
  justifyContent: 'center',
  paddingRight: open && 10,
  mr: open ? theme.spacing(3) : 'auto',
}))

const ListItemText = styled(MuiListItemText)(({ open, isMobile }) => ({
  opacity: open || isMobile === 'true' ? 1 : 0,
  whiteSpace: 'normal',
}))

export default function MenuBox() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [openSubMenu, setOpenSubMenu] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(!isMobile)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setDrawerOpen(!isMobile)
  }, [isMobile])

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setDrawerOpen(!drawerOpen)
      if (drawerOpen) {
        setOpenSubMenu(false)
      }
    }
  }

  const handleSubMenuClick = () => {
    setOpenSubMenu(!openSubMenu)
  }

  const handleSignOutClick = () => {
    signOut(() => navigate('/auth/login', { replace: true }))
  }

  const handleMobileItemClick = () => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawerContent = (isDrawerOpen) => (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isDrawerOpen ? 'space-between' : 'center',
          alignItems: 'center',
          p: 1,
          gap: 1,
          minHeight: 48,
        }}
      >
        {isDrawerOpen && (
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'calc(100% - 48px)',
              fontWeight: 500,
            }}
            title={`Привет, ${user?.first_name}`}
          >
            <Box component="span">{'Привет, '}</Box>
            <Box component="span" color="primary.main">
              {user?.first_name}
            </Box>
          </Typography>
        )}
        <Tooltip
          title={isDrawerOpen ? 'Закрыть меню' : 'Открыть меню'}
          placement="right"
        >
          <IconButton onClick={handleDrawerToggle}>
            {isDrawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />

      {/* Остальной код меню без изменений */}
      <List component="nav">
        <ListItemButton
          component={CustomLink}
          to="/instructions"
          open={isDrawerOpen}
          onClick={handleMobileItemClick}
        >
          <ListItemIcon open={isDrawerOpen}>
            <Tooltip title="Инструктаж" placement="right">
              <NoteAltIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText
            open={isDrawerOpen}
            ismobile={isMobile.toString()}
            primary="Инструктаж"
          />
        </ListItemButton>

        <ListItemButton
          component={CustomLink}
          to="/tests"
          open={isDrawerOpen}
          onClick={handleMobileItemClick}
        >
          <ListItemIcon open={isDrawerOpen}>
            <Tooltip title="Тестирование" placement="right">
              <FactCheckIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText
            open={isDrawerOpen}
            ismobile={isMobile.toString()}
            primary="Тестирование"
          />
        </ListItemButton>

        {isDrawerOpen && (
          <ListItemButton onClick={handleSubMenuClick} open={isDrawerOpen}>
            <ListItemIcon open={isDrawerOpen}>
              <Tooltip title="База знаний" placement="right">
                <SchoolIcon />
              </Tooltip>
            </ListItemIcon>
            <ListItemText
              open={isDrawerOpen}
              ismobile={isMobile.toString()}
              primary="База знаний"
            />
            {isDrawerOpen && (openSubMenu ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        )}

        <Collapse
          in={!isDrawerOpen ? true : openSubMenu}
          timeout="auto"
          unmountOnExit
        >
          <List component="div" disablePadding>
            <ListItemButtonSubMenu
              open={isDrawerOpen}
              component={CustomLink}
              to="/knowladge/nlas"
              onClick={handleMobileItemClick}
            >
              <ListItemIcon open={isDrawerOpen}>
                <Tooltip title="Документы" placement="right">
                  <ImportContactsIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText
                open={isDrawerOpen}
                ismobile={isMobile.toString()}
                primary="Документы"
              />
            </ListItemButtonSubMenu>

            <ListItemButtonSubMenu
              open={isDrawerOpen}
              component={CustomLink}
              to="/knowladge/videos"
              onClick={handleMobileItemClick}
            >
              <ListItemIcon open={isDrawerOpen}>
                <Tooltip title="Видео" placement="right">
                  <SmartDisplayIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText
                open={isDrawerOpen}
                ismobile={isMobile.toString()}
                primary="Видео"
              />
            </ListItemButtonSubMenu>
          </List>
        </Collapse>

        <Divider />

        <ListItemButton
          component={CustomLink}
          to="/profile"
          open={isDrawerOpen}
          onClick={handleMobileItemClick}
        >
          <ListItemIcon open={isDrawerOpen}>
            <Tooltip title="Профиль" placement="right">
              <PersonIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText
            open={isDrawerOpen}
            ismobile={isMobile.toString()}
            primary="Профиль"
          />
        </ListItemButton>

        <ListItemButton
          component={CustomLink}
          to="/success"
          open={isDrawerOpen}
          onClick={handleMobileItemClick}
        >
          <ListItemIcon open={isDrawerOpen}>
            <Tooltip title="Мои достижения" placement="right">
              <EmojiEventsIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText
            open={isDrawerOpen}
            ismobile={isMobile.toString()}
            primary="Мои достижения"
          />
        </ListItemButton>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <ListItem onClick={handleSignOutClick} sx={{ p: 0, mb: 2 }}>
        <ListItemButton open={isDrawerOpen} onClick={handleMobileItemClick}>
          <ListItemIcon open={isDrawerOpen}>
            <Tooltip title={user ? 'Выйти' : 'Войти'} placement="right">
              {user ? <LogoutIcon /> : <LoginIcon />}
            </Tooltip>
          </ListItemIcon>
          <ListItemText
            open={isDrawerOpen}
            ismobile={isMobile.toString()}
            primary={user ? 'Выйти' : 'Войти'}
          />
        </ListItemButton>
      </ListItem>
    </>
  )

  return (
    <>
      {isMobile && !mobileOpen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            left: 30,
            top: 20,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 1,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              invisible: false,
            },
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent(true)}
        </SwipeableDrawer>
      ) : (
        <StyledDrawer variant="permanent" open={drawerOpen}>
          {drawerContent(drawerOpen)}
        </StyledDrawer>
      )}
    </>
  )
}
