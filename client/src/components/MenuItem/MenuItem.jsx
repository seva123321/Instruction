import * as React from 'react'
import {
  Divider,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Collapse,
} from '@mui/material'
import {
  School as SchoolIcon,
  FactCheck as FactCheckIcon,
  EmojiEvents as EmojiEventsIcon,
  Headphones as HeadphonesIcon,
  SmartDisplay as SmartDisplayIcon,
  ImportContacts as ImportContactsIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  NoteAlt as NoteAltIcon,
} from '@mui/icons-material'

import CustomLink from '../CustomLink/CustomLink'

export default function MenuItem() {
  const [open, setOpen] = React.useState(true)

  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      // subheader={
      //   <ListSubheader component="div" id="nested-list-subheader">
      //     Nested List Items
      //   </ListSubheader>
      // }
    >
      <ListItemButton>
        <ListItemIcon>
          <NoteAltIcon />
        </ListItemIcon>
        <CustomLink to="/instruction">Инструктаж</CustomLink>
      </ListItemButton>

      <ListItemButton>
        <ListItemIcon>
          <FactCheckIcon />
        </ListItemIcon>
        <CustomLink to="/test">Тестирование</CustomLink>
        {/* <ListItemText primary="Drafts" /> */}
      </ListItemButton>

      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <SchoolIcon />
        </ListItemIcon>
        <ListItemText primary="База знаний" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <ImportContactsIcon />
            </ListItemIcon>
            <CustomLink to="/knowladge/nla">Правовые документы</CustomLink>
          </ListItemButton>
        </List>

        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <HeadphonesIcon />
            </ListItemIcon>
            <CustomLink to="/knowladge/audio">Аудио</CustomLink>
          </ListItemButton>
        </List>

        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <SmartDisplayIcon />
            </ListItemIcon>
            <CustomLink to="/knowladge/video">Видео</CustomLink>
          </ListItemButton>
        </List>
      </Collapse>
      <Divider />
      <ListItemButton>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <CustomLink to="/profile">Профиль</CustomLink>
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <EmojiEventsIcon />
        </ListItemIcon>
        <CustomLink to="/mysuccess">Мои успехи</CustomLink>
      </ListItemButton>
    </List>
  )
}
