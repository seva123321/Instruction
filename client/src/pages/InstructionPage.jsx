import { Grid2, Container } from '@mui/material'

import { agreements, instructionMarkdown } from '@/service/constValues' // @TODO from server
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'

function InstructionPage() {
  return (
    <div>
      <MarkdownContext markdown={instructionMarkdown} header="Инструктаж" />

      {/* повтор стиля контейнера MarkdownContext */}
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
          <Container maxWidth="lg" sx={{ padding: 3 }}>
            <CheckboxFields agreements={agreements} />
          </Container>
        </Grid2>
        <Grid2
          item
          size={{ xs: 12, sm: 3 }}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
      </Grid2>
    </div>
  )
}

export default InstructionPage
