import React, { memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
  Box,
  styled,
} from '@mui/material'

const StyledMediaContainer = styled(Box)({
  width: '100%',
  '& > *': {
    width: '100%',
    maxHeight: 300,
    objectFit: 'cover',
    borderRadius: 4,
  },
})

const MediaRenderer = memo(({ media, mediaType, alt }) => {
  if (!media) return null

  switch (mediaType) {
    case 'image':
      return <img src={media} alt={alt} />
    case 'video':
      return <video controls src={media} />
    case 'audio':
      return <audio controls src={media} />
    case 'custom':
      return media // Прямая вставка кастомного компонента
    default:
      return null
  }
})

const ListItemContent = memo(
  ({
    item,
    primaryKey,
    secondaryKey,
    mediaKey,
    mediaType = 'image',
    avatarKey,
    iconKey,
    customContent,
    listItemButtonSx,
    listItemTextSx,
  }) => (
    <>
      {(mediaKey || customContent) && (
        <StyledMediaContainer sx={{ mb: 1 }}>
          {customContent ? (
            customContent(item)
          ) : (
            <MediaRenderer
              media={item[mediaKey]}
              mediaType={mediaType}
              alt={item[primaryKey]}
            />
          )}
        </StyledMediaContainer>
      )}

      <ListItemButton sx={{ width: '100%', ...listItemButtonSx }}>
        {avatarKey && item[avatarKey] && (
          <Avatar alt={item[primaryKey]} src={item[avatarKey]} sx={{ mr: 2 }} />
        )}

        {iconKey && item[iconKey] && <Box sx={{ mr: 2 }}>{item[iconKey]}</Box>}

        <ListItemText
          primary={item[primaryKey]}
          secondary={secondaryKey ? item[secondaryKey] : null}
          slotProps={{
            primary: {
              sx: { fontWeight: 'medium', ...listItemTextSx?.primary },
            },
            secondary: {
              sx: { color: 'text.secondary', ...listItemTextSx?.secondary },
            },
          }}
          sx={listItemTextSx?.root}
        />
      </ListItemButton>
    </>
  )
)

const GenericListItem = memo(
  ({
    item,
    onClick,
    listItemSx,
    linkKey,
    linkPrefix,
    linkComponent,
    ...contentProps
  }) => {
    const handleClick = useCallback(() => onClick?.(item), [item, onClick])

    return (
      <ListItem
        disablePadding
        onClick={handleClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          flexDirection: 'column',
          alignItems: 'stretch',
          '&:hover': { backgroundColor: onClick ? 'action.hover' : 'inherit' },
          ...listItemSx,
        }}
        component={linkKey ? linkComponent : 'div'}
        {...(linkKey && {
          to: `${linkPrefix}${item[linkKey]}`,
          style: { textDecoration: 'none', color: 'inherit' },
        })}
      >
        <ListItemContent item={item} {...contentProps} />
      </ListItem>
    )
  }
)

function GenericList({
  data,
  primaryKey = 'title',
  secondaryKey,
  mediaKey,
  mediaType = 'image',
  avatarKey,
  iconKey,
  customContent,
  onClick,
  dividers = true,
  dense = false,
  listItemSx = {},
  listItemButtonSx = {},
  listItemTextSx = {},
  linkKey,
  linkPrefix = '/',
  linkComponent = Link,
}) {
  return (
    <List dense={dense}>
      {data.map((item, index) => (
        <React.Fragment key={item.id || index}>
          <GenericListItem
            item={item}
            onClick={onClick}
            listItemSx={listItemSx}
            linkKey={linkKey}
            linkPrefix={linkPrefix}
            linkComponent={linkComponent}
            primaryKey={primaryKey}
            secondaryKey={secondaryKey}
            mediaKey={mediaKey}
            mediaType={mediaType}
            avatarKey={avatarKey}
            iconKey={iconKey}
            customContent={customContent}
            listItemButtonSx={listItemButtonSx}
            listItemTextSx={listItemTextSx}
          />
          {dividers && index < data.length - 1 && <Divider sx={{ my: 1 }} />}
        </React.Fragment>
      ))}
    </List>
  )
}

export default memo(GenericList)
