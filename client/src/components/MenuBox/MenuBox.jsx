import { useState, useEffect } from 'react'
import {
  Divider,
  IconButton,
  List as MuiList,
  Drawer as MuiDrawer,
  ListItemText as MuiListItemText,
  ListItemIcon as MuiListItemIcon,
  ListItemButton as MuiListItemButton,
  Collapse,
} from '@mui/material'
import {
  School as SchoolIcon,
  Person as PersonIcon,
  NoteAlt as NoteAltIcon,
  MenuOpen as MenuOpenIcon,
  FactCheck as FactCheckIcon,
  EmojiEvents as EmojiEventsIcon,
  Headphones as HeadphonesIcon,
  SmartDisplay as SmartDisplayIcon,
  ImportContacts as ImportContactsIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

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
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 800px)')

    const handleMediaQueryChange = (event) => {
      setOpen(event.matches) // Устанавливаем open в true, если ширина >= 800px
    }

    // Устанавливаем начальное состояние
    setOpen(mediaQuery.matches)

    // Добавляем слушатель
    mediaQuery.addEventListener('change', handleMediaQueryChange)

    // Убираем слушатель при размонтировании
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }
  }, [])
  const handleDrawerClick = () => {
    setOpen(!open)
  }

  const handleClick = () => {
    setOpenSubMenu(!openSubMenu)
  }

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClick}>
          {open ? <MenuOpenIcon /> : <KeyboardArrowRightIcon />}
        </IconButton>
      </DrawerHeader>

      <List component="nav" aria-labelledby="nested-list-subheader">
        <ListItemButton component={CustomLink} to="/instruction">
          <ListItemIcon open={open}>
            <NoteAltIcon />
          </ListItemIcon>
          <ListItemText open={open} primary="Инструктаж" />
        </ListItemButton>

        <ListItemButton component={CustomLink} to="/test">
          <ListItemIcon open={open}>
            <FactCheckIcon />
          </ListItemIcon>
          <ListItemText open={open} primary="Тестирование" />
        </ListItemButton>

        <ListItemButton onClick={handleClick}>
          <ListItemIcon open={open}>
            <SchoolIcon />
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
                <ImportContactsIcon />
              </ListItemIcon>
              <ListItemText open={open} primary="Документы" />
            </ListItemButtonSubMenu>
            <ListItemButtonSubMenu
              open={open}
              component={CustomLink}
              to="/knowladge/audio"
            >
              <ListItemIcon open={open}>
                <HeadphonesIcon />
              </ListItemIcon>
              <ListItemText open={open} primary="Аудио" />
            </ListItemButtonSubMenu>
            <ListItemButtonSubMenu
              open={open}
              component={CustomLink}
              to="/knowladge/video"
            >
              <ListItemIcon open={open}>
                <SmartDisplayIcon />
              </ListItemIcon>
              <ListItemText open={open} primary="Видео" />
            </ListItemButtonSubMenu>
          </List>
        </Collapse>

        <Divider />

        <ListItemButton component={CustomLink} to="/profile">
          <ListItemIcon open={open}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText open={open} primary="Профиль" />
        </ListItemButton>

        <ListItemButton component={CustomLink} to="/mysuccess">
          <ListItemIcon open={open}>
            <EmojiEventsIcon />
          </ListItemIcon>
          <ListItemText open={open} primary="Мои успехи" />
        </ListItemButton>
      </List>
    </Drawer>
  )
}
