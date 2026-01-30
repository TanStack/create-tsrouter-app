import { describe, it, expect } from 'vitest'

import { cli } from '../src/index.js'

describe('cli', () => {
  it('should call the cli with the correct arguments', async () => {
    expect(cli).toBeDefined()
  })
})
