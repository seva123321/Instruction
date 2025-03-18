import { Link } from 'react-router-dom'
import { ListItem, ListItemIcon } from '@mui/material'

import style from './MenuItem.module.scss'

function MenuItem({ item, isOpen, onToggle }) {
  return (
    <ListItem component="div">
      {item.children ? (
        <div className={style.dropdown}>
          {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          <button type="button" className={style.dropbtn} onClick={onToggle}>
            {item.title}
          </button>
          {isOpen && (
            <div className={style.dropdownContent}>
              {item.children.map((child) => (
                <Link key={child.path} to={child.path}>
                  {/* {child.icon && <ListItemIcon>{child.icon}</ListItemIcon>} */}
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <Link to={item.path}>{item.title}</Link>
        </>
      )}
    </ListItem>
  )
}

export default MenuItem
