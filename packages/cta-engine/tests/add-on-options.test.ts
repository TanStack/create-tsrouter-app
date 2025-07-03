import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { AddOnSelectOptionSchema, AddOnOptionSchema, AddOnOptionsSchema } from '../src/types.js'
import { populateAddOnOptionsDefaults } from '../src/add-ons.js'

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
        {
          id: 'drizzle',
          name: 'Drizzle ORM',
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
        },
        {
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
        }
      ]

      const result = populateAddOnOptionsDefaults(addOns)

      expect(result).toEqual({
        drizzle: {
          database: 'postgres'
        },
        shadcn: {
          theme: 'neutral'
        }
      })
    })

    it('should handle add-ons without options', () => {
      const addOns = [
        {
          id: 'simple-addon',
          name: 'Simple Add-on'
          // No options property
        }
      ]

      const result = populateAddOnOptionsDefaults(addOns)

      expect(result).toEqual({})
    })

    it('should only populate defaults for enabled add-ons', () => {
      const addOns = [
        {
          id: 'drizzle',
          name: 'Drizzle ORM',
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
        },
        {
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
        }
      ]

      const enabledAddOns = [addOns[0]] // Only drizzle
      const result = populateAddOnOptionsDefaults(enabledAddOns)

      expect(result).toEqual({
        drizzle: {
          database: 'postgres'
        }
        // shadcn should not be included
      })
    })

    it('should handle empty enabled add-ons array', () => {
      const addOns = [
        {
          id: 'drizzle',
          name: 'Drizzle ORM',
          options: {
            database: {
              type: 'select' as const,
              label: 'Database Provider',
              default: 'postgres',
              options: [
                { value: 'postgres', label: 'PostgreSQL' }
              ]
            }
          }
        }
      ]

      const enabledAddOns: Array<any> = []
      const result = populateAddOnOptionsDefaults(enabledAddOns)

      expect(result).toEqual({})
    })

    it('should handle add-ons with multiple options', () => {
      const addOns = [
        {
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
        }
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
        {
          id: 'no-default',
          name: 'No Default Add-on',
          options: {
            database: {
              type: 'select' as const,
              label: 'Database',
              // No default property
              options: [
                { value: 'postgres', label: 'PostgreSQL' },
                { value: 'mysql', label: 'MySQL' }
              ]
            }
          }
        }
      ]

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