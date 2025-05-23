import { createFileRoute } from '@tanstack/react-router'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

export const Route = createFileRoute('/demo/mui')({
  component: MUIDemo,
})

function MUIDemo() {
  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Button variant="contained">Hello world</Button>
    </Box>
  )
}
