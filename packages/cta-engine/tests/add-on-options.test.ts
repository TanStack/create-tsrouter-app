import { describe, expect, it } from 'vitest'
import { populateAddOnOptionsDefaults } from '../src/add-ons.js'
import { AddOnOptionSchema, AddOnOptionsSchema, AddOnSelectOptionSchema } from '../src/types.js'
import type { AddOn } from '../src/types.js'

// Helper function to create test AddOn objects
function createTestAddOn(overrides: Partial<AddOn>): AddOn {
  return {
    id: 'test-addon',
    name: 'Test Addon',
    description: 'Test addon description',
    type: 'add-on',
    modes: ['file-router'],
    phase: 'add-on',
    files: {},
    deletedFiles: [],
    getFiles: () => Promise.resolve([]),
    getFileContents: () => Promise.resolve(''),
    getDeletedFiles: () => Promise.resolve([]),
    ...overrides
  }
}

describe('Add-on Options', () => {
  describe('Option Schema Validation', () => {
    it('should validate a valid select option', () => {
      const validSelectOption = {
        type: 'select',
        label: 'Database Provider',
        description: 'Choose your database provider',
        default: 'postgres',
        options: [
          { value: 'postgres', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'sqlite', label: 'SQLite' }
        ]
      }

      expect(() => AddOnSelectOptionSchema.parse(validSelectOption)).not.toThrow()
    })

    it('should reject select option without required fields', () => {
      const invalidSelectOption = {
        type: 'select',
        // Missing required 'label' field
        options: [{ value: 'test', label: 'Test' }]
      }

      expect(() => AddOnSelectOptionSchema.parse(invalidSelectOption)).toThrow()
    })

    it('should reject select option with invalid option format', () => {
      const invalidSelectOption = {
        type: 'select',
        label: 'Test',
        options: [
          { value: 'test' } // Missing 'label' field
        ]
      }

      expect(() => AddOnSelectOptionSchema.parse(invalidSelectOption)).toThrow()
    })

    it('should reject select option with empty options array', () => {
      const invalidSelectOption = {
        type: 'select',
        label: 'Test',
        options: []
      }

      expect(() => AddOnSelectOptionSchema.parse(invalidSelectOption)).toThrow()
    })

    it('should validate AddOnOption discriminated union', () => {
      const validOption = {
        type: 'select',
        label: 'Theme',
        default: 'dark',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' }
        ]
      }

      expect(() => AddOnOptionSchema.parse(validOption)).not.toThrow()
    })

    it('should validate AddOnOptions record', () => {
      const validOptions = {
        database: {
          type: 'select',
          label: 'Database Provider',
          default: 'postgres',
          options: [
            { value: 'postgres', label: 'PostgreSQL' },
            { value: 'mysql', label: 'MySQL' }
          ]
        },
        theme: {
          type: 'select',
          label: 'Theme',
          default: 'dark',
          options: [
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' }
          ]
        }
      }

      expect(() => AddOnOptionsSchema.parse(validOptions)).not.toThrow()
    })
  })

  describe('populateAddOnOptionsDefaults', () => {
    it('should populate defaults for add-ons with options', () => {
      const addOns = [
        createTestAddOn({
          id: 'testAddon',
          name: 'Test Addon',
          options: {
            database: {
              type: 'select' as const,
              label: 'Database Provider',
              default: 'postgres',
              options: [
                { value: 'postgres', label: 'PostgreSQL' },
                { value: 'mysql', label: 'MySQL' },
                { value: 'sqlite', label: 'SQLite' }
              ]
            }
          }
        }),
        createTestAddOn({
          id: 'shadcn',
          name: 'shadcn/ui',
          options: {
            theme: {
              type: 'select' as const,
              label: 'Theme',
              default: 'neutral',
              options: [
                { value: 'neutral', label: 'Neutral' },
                { value: 'slate', label: 'Slate' }
              ]
            }
          }
        })
      ]

      const result = populateAddOnOptionsDefaults(addOns)

      expect(result).toEqual({
        testAddon: {
          database: 'postgres'
        },
        shadcn: {
          theme: 'neutral'
        }
      })
    })

    it('should handle add-ons without options', () => {
      const addOns = [
        createTestAddOn({
          id: 'simple-addon',
          name: 'Simple Add-on'
          // No options property
        })
      ]

      const result = populateAddOnOptionsDefaults(addOns)

      expect(result).toEqual({})
    })

    it('should only populate defaults for enabled add-ons', () => {
      const addOns = [
        createTestAddOn({
          id: 'testAddon',
          name: 'Test Addon',
          options: {
            database: {
              type: 'select' as const,
              label: 'Database Provider',
              default: 'postgres',
              options: [
                { value: 'postgres', label: 'PostgreSQL' },
                { value: 'mysql', label: 'MySQL' }
              ]
            }
          }
        }),
        createTestAddOn({
          id: 'shadcn',
          name: 'shadcn/ui',
          options: {
            theme: {
              type: 'select' as const,
              label: 'Theme',
              default: 'neutral',
              options: [
                { value: 'neutral', label: 'Neutral' },
                { value: 'slate', label: 'Slate' }
              ]
            }
          }
        })
      ]

      const enabledAddOns = [addOns[0]] // Only testAddon
      const result = populateAddOnOptionsDefaults(enabledAddOns)

      expect(result).toEqual({
        testAddon: {
          database: 'postgres'
        }
        // shadcn should not be included
      })
    })

    it('should handle empty enabled add-ons array', () => {
      const enabledAddOns: Array<any> = []
      const result = populateAddOnOptionsDefaults(enabledAddOns)

      expect(result).toEqual({})
    })

    it('should handle add-ons with multiple options', () => {
      const addOns = [
        createTestAddOn({
          id: 'complex-addon',
          name: 'Complex Add-on',
          options: {
            database: {
              type: 'select' as const,
              label: 'Database',
              default: 'postgres',
              options: [
                { value: 'postgres', label: 'PostgreSQL' },
                { value: 'mysql', label: 'MySQL' }
              ]
            },
            theme: {
              type: 'select' as const,
              label: 'Theme',
              default: 'dark',
              options: [
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' }
              ]
            }
          }
        })
      ]

      const result = populateAddOnOptionsDefaults(addOns)

      expect(result).toEqual({
        'complex-addon': {
          database: 'postgres',
          theme: 'dark'
        }
      })
    })

    it('should handle options without default values', () => {
      const addOns = [
        createTestAddOn({
          id: 'no-default',
          name: 'No Default Add-on',
          options: {
            database: {
              type: 'select' as const,
              label: 'Database',
              default: 'postgres', // We need a default for valid schema
              options: [
                { value: 'postgres', label: 'PostgreSQL' },
                { value: 'mysql', label: 'MySQL' }
              ]
            }
          }
        })
      ]

      // Test the case where an addon has no default by manually modifying the option
      if (addOns[0].options?.database) {
        delete (addOns[0].options.database as any).default
      }

      const result = populateAddOnOptionsDefaults(addOns)

      expect(result).toEqual({
        'no-default': {
          database: undefined
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed option definitions gracefully', () => {
      const malformedOptions = {
        invalid: {
          type: 'unknown-type', // Invalid type
          label: 'Test'
        }
      }

      expect(() => AddOnOptionsSchema.parse(malformedOptions)).toThrow()
    })

    it('should validate option value types', () => {
      const invalidOption = {
        type: 'select',
        label: 123, // Should be string
        options: [{ value: 'test', label: 'Test' }]
      }

      expect(() => AddOnSelectOptionSchema.parse(invalidOption)).toThrow()
    })

    it('should require non-empty option arrays', () => {
      const emptyOptionsArray = {
        type: 'select',
        label: 'Test',
        options: []
      }

      expect(() => AddOnSelectOptionSchema.parse(emptyOptionsArray)).toThrow()
    })
  })
})