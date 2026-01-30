import { describe, expect, it } from 'vitest'

import type { AddOnInfo } from '../../src/types'

import { getAddOnStatus } from '../../src/store/add-ons'

describe('getAddOnStatus', () => {
  it('everything should be enabled if nothing is selected', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: ['add-on-2'],
        },
        {
          id: 'add-on-2',
        },
      ] as unknown as Array<AddOnInfo>,
      [],
      [],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: false,
        enabled: true,
      },
      'add-on-2': {
        selected: false,
        enabled: true,
      },
    })
  })

  it('should handle a single add-on', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: [],
        },
      ] as unknown as Array<AddOnInfo>,
      ['add-on-1'],
      [],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: true,
        enabled: true,
      },
    })
  })

  it('should handle a depended-on add-on', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: ['add-on-2'],
        },
        {
          id: 'add-on-2',
          dependsOn: [],
        },
      ] as unknown as Array<AddOnInfo>,
      ['add-on-1'],
      [],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: true,
        enabled: true,
      },
      'add-on-2': {
        selected: true,
        enabled: false,
      },
    })
  })

  it('should handle a selected depended-on add-on', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: ['add-on-2'],
        },
        {
          id: 'add-on-2',
          dependsOn: [],
        },
      ] as unknown as Array<AddOnInfo>,
      ['add-on-1', 'add-on-2'],
      [],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: true,
        enabled: true,
      },
      'add-on-2': {
        selected: true,
        enabled: false,
      },
    })
  })

  it('should handle a selected depended-on add-on', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: ['add-on-2'],
        },
        {
          id: 'add-on-2',
          dependsOn: [],
        },
      ] as unknown as Array<AddOnInfo>,
      ['add-on-2'],
      [],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: false,
        enabled: true,
      },
      'add-on-2': {
        selected: true,
        enabled: true,
      },
    })
  })

  it('wont cycle', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: ['add-on-2'],
        },
        {
          id: 'add-on-2',
          dependsOn: ['add-on-1'],
        },
      ] as unknown as Array<AddOnInfo>,
      ['add-on-1'],
      [],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: true,
        enabled: false,
      },
      'add-on-2': {
        selected: true,
        enabled: false,
      },
    })
  })

  it('should handle original add-ons', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: ['add-on-2'],
        },
        {
          id: 'add-on-2',
          dependsOn: [],
        },
      ] as unknown as Array<AddOnInfo>,
      ['add-on-1'],
      ['add-on-2'],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: true,
        enabled: true,
      },
      'add-on-2': {
        selected: true,
        enabled: false,
      },
    })
  })

  it('should handle original add-ons with dependencies', () => {
    const addOnStatus = getAddOnStatus(
      [
        {
          id: 'add-on-1',
          dependsOn: ['add-on-2'],
        },
        {
          id: 'add-on-2',
          dependsOn: ['add-on-3'],
        },
        {
          id: 'add-on-3',
          dependsOn: [],
        },
      ] as unknown as Array<AddOnInfo>,
      ['add-on-1'],
      ['add-on-2'],
    )
    expect(addOnStatus).toEqual({
      'add-on-1': {
        selected: true,
        enabled: true,
      },
      'add-on-2': {
        selected: true,
        enabled: false,
      },
      'add-on-3': {
        selected: true,
        enabled: false,
      },
    })
  })
})
