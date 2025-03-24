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
} from '@mui/material'
import {
  School as SchoolIcon,
  Person as PersonIcon,
  NoteAlt as NoteAltIcon,
  MenuOpen as MenuOpenIcon,
  FactCheck as FactCheckIcon,
  EmojiEvents as EmojiEventsIcon,
  Headphones as HeadphonesIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  SmartDisplay as SmartDisplayIcon,
  ImportContacts as ImportContactsIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

import useAuth from '@/hook/useAuth'

import CustomLink from '../CustomLink/CustomLink'

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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open ? openedMixin(theme) : closedMixin(theme)),
  '& .MuiDrawer-paper': open ? openedMixin(theme) : closedMixin(theme),
}))

const List = styled(MuiList)(({ theme }) => ({
  width: '100%',
  maxWidth: 360,
  bgcolor: theme.palette.background.paper,
}))

const ListItemButton = styled(MuiListItemButton)(({ theme, open }) => ({
  minHeight: 48,
  paddingLeft: theme.spacing(2.5),
  paddingRight: theme.spacing(2.5),
  justifyContent: open ? 'initial' : 'center',
}))

const ListItemButtonSubMenu = styled(MuiListItemButton)(({ theme, open }) => ({
  minHeight: 48,
  paddingLeft: theme.spacing(2.5),
  paddingRight: theme.spacing(2.5),
  justifyContent: open ? 'initial' : 'center',
  ...(open && {
    paddingLeft: theme.spacing(4),
  }),
}))

const ListItemIcon = styled(MuiListItemIcon)(({ theme, open }) => ({
  minWidth: 0,
  justifyContent: 'center',
  marginRight: open ? theme.spacing(3) : 'auto',
}))

const ListItemText = styled(MuiListItemText)(({ open }) => ({
  opacity: open ? 1 : 0,
}))

export default function MenuBox() {
  const [openSubMenu, setOpenSubMenu] = useState(false)
  const [open, setOpen] = useState(false)
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 800px)')

    const handleMediaQueryChange = (event) => {
      setOpen(event.matches) // Устанавливаем open в true, если ширина >= 800px
    }

    setOpen(mediaQuery.matches)

    mediaQuery.addEventListener('change', handleMediaQueryChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }
  }, [])
  const handleDrawerClick = () => {
    setOpen(!open)
  }

  const handleSubMenuClick = () => {
    setOpenSubMenu(!openSubMenu)
  }

  const handleSignOutClick = () => {
    signOut(() => navigate('/', { replace: true }))
  }

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClick}>
          {open ? <MenuOpenIcon /> : <KeyboardArrowRightIcon />}
        </IconButton>
      </DrawerHeader>

      <Divider />

      <List component="nav" aria-labelledby="nested-list-subheader">
        <ListItemButton component={CustomLink} to="/instruction">
          <ListItemIcon open={open}>
            <Tooltip title="Инструктаж">
              <NoteAltIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText open={open} primary="Инструктаж" />
        </ListItemButton>

        <ListItemButton component={CustomLink} to="/tests">
          <ListItemIcon open={open}>
            <Tooltip title="Тестирование">
              <FactCheckIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText open={open} primary="Тестирование" />
        </ListItemButton>

        <ListItemButton onClick={handleSubMenuClick}>
          <ListItemIcon open={open}>
            <Tooltip title="База знаний">
              <SchoolIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText open={open} primary="База знаний" />
          {openSubMenu ? open && <ExpandLess /> : open && <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSubMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButtonSubMenu
              open={open}
              component={CustomLink}
              to="/knowladge/nla"
            >
              <ListItemIcon open={open}>
                <Tooltip title="Документы">
                  <ImportContactsIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText open={open} primary="Документы" />
            </ListItemButtonSubMenu>
            <ListItemButtonSubMenu
              open={open}
              component={CustomLink}
              to="/knowladge/audio"
            >
              <ListItemIcon open={open}>
                <Tooltip title="Аудио">
                  <HeadphonesIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText open={open} primary="Аудио" />
            </ListItemButtonSubMenu>
            <ListItemButtonSubMenu
              open={open}
              component={CustomLink}
              to="/knowladge/video"
            >
              <ListItemIcon open={open}>
                <Tooltip title="Видео">
                  <SmartDisplayIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText open={open} primary="Видео" />
            </ListItemButtonSubMenu>
          </List>
        </Collapse>

        <Divider />

        <ListItemButton component={CustomLink} to="/profile">
          <ListItemIcon open={open}>
            <Tooltip title="Профиль">
              <PersonIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText open={open} primary="Профиль" />
        </ListItemButton>

        <ListItemButton component={CustomLink} to="/mysuccess">
          <ListItemIcon open={open}>
            <Tooltip title="Мои успехи">
              <EmojiEventsIcon />
            </Tooltip>
          </ListItemIcon>
          <ListItemText open={open} primary="Мои успехи" />
        </ListItemButton>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <ListItem onClick={handleSignOutClick} sx={{ mb: 3, p: 0 }}>
        <ListItemButton>
          <ListItemIcon open={open}>
            <Tooltip title="Выйти">
              {user ? <LogoutIcon /> : <LoginIcon />}
            </Tooltip>
          </ListItemIcon>
          <ListItemText open={open} primary="Выйти" />
        </ListItemButton>
      </ListItem>
    </Drawer>
  )
}
