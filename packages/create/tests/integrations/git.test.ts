import { describe, expect, it } from 'vitest'

import { createMemoryEnvironment } from '../../src/environment.js'
import { setupGit } from '../../src/integrations/git.js'

describe('git', () => {
  it('should create a git repository', async () => {
    const { environment, output } = createMemoryEnvironment()
    environment.startRun()
    await setupGit(environment, '/test')
    environment.finishRun()

    expect(output.commands).toEqual([
      {
        command: 'git',
        args: ['init'],
      },
    ])
  })
})
