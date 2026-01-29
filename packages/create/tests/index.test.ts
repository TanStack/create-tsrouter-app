import { describe, expect, it } from 'vitest'

import { createApp } from '../src/index.js'

describe('index', () => {
  it('should be a test', () => {
    expect(createApp).toBeDefined()
  })
})
