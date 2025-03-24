import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Typography,
  List,
  ListItem,
  Link,
  Grid2,
  Container,
} from '@mui/material'
import './Markdown.css'

const MarkdownComponents = {
  h1: (props) => {
    const id = props.children.toString().toLowerCase().replace(/\s+/g, '-')
    return (
      <Typography
        variant="h4"
        gutterBottom
        id={id}
        sx={{ textAlign: 'center' }}
        {...props}
      />
    )
  },
  h2: (props) => {
    const id = props.children.toString().toLowerCase().replace(/\s+/g, '-')
    return (
      <Typography
        variant="h5"
        gutterBottom
        id={id}
        sx={{ textAlign: 'center' }}
        {...props}
      />
    )
  },
  h3: (props) => {
    const id = props.children.toString().toLowerCase().replace(/\s+/g, '-')
    return <Typography variant="h6" gutterBottom id={id} {...props} />
  },
  p: (props) => (
    <Typography
      component="p"
      gutterBottom
      sx={{ textAlign: 'justify' }}
      {...props}
    />
  ),
  ul: (props) => <List {...props} />,
  li: (props) => <ListItem {...props} />,
}

function MarkdownContext({ markdown, header }) {
  const [headings, setHeadings] = useState([])
  const [currentHeading, setCurrentHeading] = useState(null)
  const headingRefs = useRef({})

  // Извлечение заголовков из markdown
  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.*)$/gm
    const matches = markdown.match(headingRegex)

    if (matches) {
      const extractedHeadings = matches.map((heading) => {
        const level = heading.match(/#/g).length
        const text = heading.replace(/^(#{1,3})\s+/, '')
        const id = text.toLowerCase().replace(/\s+/g, '-')
        return { level, text, id }
      })
      setHeadings(extractedHeadings)
    }
  }, [markdown])

  // Настройка IntersectionObserver для отслеживания видимости заголовков
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentHeading(entry.target.id)
          }
        })
      },
      {
        rootMargin: '0px 0px -90% 0px',
        threshold: 0.5, // Порог пересечения
      }
    )

    headingRefs.current = headings.map((heading) => {
      const value = document.getElementById(heading.id)

      return value
    })

    // Наблюдаем за всеми заголовками
    headingRefs.current.forEach((heading) => {
      if (heading) {
        observer.observe(heading)
      }
    })

    return () => {
      headingRefs.current.forEach((heading) => {
        if (heading) {
          observer.unobserve(heading)
        }
      })
    }
  }, [headings])

  // Прокрутка к заголовку
  const scrollToHeading = useCallback((id) => {
    const element = headingRefs.current[id]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom>
            {header}
          </Typography>
          <ReactMarkdown
            style={{ marginBottom: 20 }}
            components={MarkdownComponents}
          >
            {markdown}
          </ReactMarkdown>
        </Container>
      </Grid2>
      <Grid2
        size={{ xs: 12, sm: 3 }}
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        <div
          style={{
            position: 'fixed',
            top: 0,
            direction: 'rtl',
            overflowY: 'auto',
            maxHeight: '100vh',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography sx={{ textAlign: 'center', mt: 2 }} variant="h6">
            Содержание
          </Typography>
          <List sx={{ direction: 'ltr' }}>
            {headings.map((heading) => (
              <ListItem key={heading.id}>
                <Link
                  href={`#${heading.id}`}
                  className={`menu-item ${currentHeading === heading.id ? 'active' : ''}`}
                  sx={{
                    textAlign: 'left',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'flex-start',
                    paddingTop: 0.5,
                    textDecoration: 'none',
                    paddingBottom: 0.5,
                    paddingLeft: `${heading.level * 7}px`,
                    paddingRight: 0.5,
                    backgroundColor:
                      currentHeading === heading.id ? '#f0f0f0' : 'transparent',
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToHeading(heading.id)
                  }}
                >
                  {heading.text}
                </Link>
              </ListItem>
            ))}
          </List>
        </div>
      </Grid2>
    </Grid2>
  )
}

export default MarkdownContext
