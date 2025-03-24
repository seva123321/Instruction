import { Grid2, Container } from '@mui/material'
import { agreements, instructionMarkdown } from '@/service/constValues'
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'

function OneInstructionPage() {
  return (
    <div>
      <MarkdownContext markdown={instructionMarkdown} header="Инструктаж" />

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
          <Container maxWidth="lg" sx={{ padding: 3 }}>
            <CheckboxFields agreements={agreements} />
          </Container>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 3 }}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
      </Grid2>
    </div>
  )
}

export default OneInstructionPage
