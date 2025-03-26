import { Box, Grid2 } from '@mui/material'
import PropTypes from 'prop-types'
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'

function OneInstructionPage({ data }) {
  const {
    text: instructionMarkdown,
    instruction_agreement: agreements,
    name: header,
  } = data

  const styles = {
    root: {
      width: '100%',
    },
    formContainer: {
      width: '100%',
      p: { xs: 2, md: 3 },
    },
  }

  return (
    <Box sx={styles.root}>
      <MarkdownContext
        markdown={instructionMarkdown}
        header={`Инструктаж ${header}`}
      />

      <Grid2 container spacing={0}>
        <Grid2 size={{ xs: 12 }}>
          <Box sx={styles.formContainer}>
            <CheckboxFields agreements={agreements} />
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  )
}

OneInstructionPage.propTypes = {
  data: PropTypes.shape({
    text: PropTypes.string.isRequired,
    instruction_agreement: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
      })
    ).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
}

export default OneInstructionPage
// // OneInstructionPage.js
// import { Grid2, Container } from '@mui/material'
// import PropTypes from 'prop-types'
// import CheckboxFields from '@/models/CheckboxFields'
// import MarkdownContext from '@/models/MarkdownContext'

// function OneInstructionPage({ data }) {
//   const {
//     text: instructionMarkdown,
//     instruction_agreement: agreements,
//     name: header,
//   } = data

//   return (
//     <div>
//       <MarkdownContext
//         markdown={instructionMarkdown}
//         header={`Инструктаж ${header}`}
//       />

//       <Grid2 container spacing={2}>
//         <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
//           <Container maxWidth="lg" sx={{ padding: 3 }}>
//             <CheckboxFields agreements={agreements} />
//           </Container>
//         </Grid2>
//         <Grid2
//           size={{ xs: 12, sm: 3 }}
//           sx={{ display: { xs: 'none', sm: 'flex' } }}
//         />
//       </Grid2>
//     </div>
//   )
// }

// OneInstructionPage.propTypes = {
//   data: PropTypes.shape({
//     text: PropTypes.string.isRequired,
//     instruction_agreement: PropTypes.arrayOf(
//       PropTypes.shape({
//         name: PropTypes.string.isRequired,
//         text: PropTypes.string.isRequired,
//       })
//     ).isRequired,
//     name: PropTypes.string.isRequired,
//   }).isRequired,
// }

// export default OneInstructionPage
