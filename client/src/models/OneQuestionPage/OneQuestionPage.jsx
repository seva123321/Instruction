import { Box, List, ListItem, ListItemText, Typography } from '@mui/material'

function OneQuestionPage({ data }) {
  //   console.log(data)

  const { question_text: questionText, options, image } = data

  return (
    <>
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {image && (
          <img
            src={image}
            alt="Иллюстрация к вопросу"
            style={{ height: 'auto', maxWidth: '400px' }}
          />
        )}
      </Box>
      <Typography variant="h5">{questionText}</Typography>

      <List>
        {options?.map((question) => (
          <ListItem
            key={question.option_id}
            sx={{
              textAlign: 'center',
              mb: 2,
              bgcolor: 'background.paper',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <ListItemText>{question.option_text}</ListItemText>
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default OneQuestionPage

// import { List, ListItem, ListItemText } from '@mui/material'

// const OneQuestionPage = ({ data }) => {
//   console.log(data)

//   return (
//     <>
//       <List>
//         {data?.map((test) => {
//           return (
//             <ListItem
//               sx={{
//                 textAlign: 'center',
//                 mb: 2,
//                 bgcolor: 'background.paper',
//                 borderRadius: '10px',
//                 boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//               }}
//             >
//               <ListItemText>{test.name}</ListItemText>
//             </ListItem>
//           )
//         })}
//       </List>

//     </>
//   )
// }

// export default OneQuestionPage
