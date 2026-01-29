import { describe, expect, it } from 'vitest'

import { camelCase } from '../../src/custom-add-ons/add-on.js'

describe('camelCase', () => {
  it('should convert a string to camel case', () => {
    expect(camelCase('test-case')).toBe('TestCase')
    expect(camelCase('demo.test-case')).toBe('DemoTestCase')
    expect(camelCase('demo/test-case')).toBe('DemoTestCase')
    expect(camelCase('demo/test/case')).toBe('DemoTestCase')
  })
})
