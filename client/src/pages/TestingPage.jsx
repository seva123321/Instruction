import { useState, useEffect } from 'react'
import { List, ListItem, ListItemText } from '@mui/material'
import { Link } from 'react-router-dom'
// import GenericList from '@/components/GenericList'

// const testsList = [
//   { test_id: 1, test_title: 'Для сварки на высоте', test_result: 'не пройден' },
//   { test_id: 2, test_title: 'Для сварки под водой', test_result: 'не пройден' },
//   {
//     test_id: 3,
//     test_title: 'Для сварки под землей',
//     test_result: 'не пройден',
//   },
//   { test_id: 4, test_title: 'Для сварки под водой', test_result: 'не пройден' },
//   {
//     test_id: 5,
//     test_title: 'Для сварки под землей',
//     test_result: 'не пройден',
//   },
//   { test_id: 6, test_title: 'Для сварки под водой', test_result: 'не пройден' },
//   {
//     test_id: 7,
//     test_title: 'Для сварки под землей',
//     test_result: 'не пройден',
//   },
//   { test_id: 8, test_title: 'Для сварки под водой', test_result: 'не пройден' },
//   {
//     test_id: 9,
//     test_title: 'Для сварки под землей',
//     test_result: 'не пройден',
//   },
//   {
//     test_id: 10,
//     test_title: 'Для сварки под водой',
//     test_result: 'не пройден',
//   },
//   {
//     test_id: 11,
//     test_title: 'Для сварки под землей',
//     test_result: 'не пройден',
//   },
// ]

function TestingPage() {
  const [tests, setTests] = useState([])
  useEffect(() => {
    // fetch('https://jsonplaceholder.typicode.com/posts')
    fetch('https://jsonplaceholder.typicode.com/comments')
      .then((res) => res.json())
      .then((data) => setTests(data))
  }, [])

  // console.log('tests > ', tests.slice(0, 5))

  return (
    <>
      <h1> Список всех тестов</h1>

      <List sx={{ width: '70vw', maxWidth: 660 }}>
        {tests?.slice(0, 20).map((test) => (
          <Link key={test.id} to={`/tests/${test.id}`}>
            <ListItem
              sx={{
                textAlign: 'center',
                mb: 2,
                bgcolor: 'background.paper',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <ListItemText>{test.name}</ListItemText>
            </ListItem>
          </Link>
        ))}
      </List>
    </>
  )
  // return (
  //   <GenericList
  //   data={tests.slice(0, 20)}
  //   primaryKey="name"
  //   secondaryKey="body"
  //   linkKey="id"
  //   linkPrefix="/tests/"
  // />
  // )
}

export default TestingPage
