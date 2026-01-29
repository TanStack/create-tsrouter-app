import { describe, it, expect, vi } from 'vitest'

import * as clack from '@clack/prompts'

import { createUIEnvironment } from '../src/ui-environment.js'

vi.mock('@clack/prompts')

// @ts-expect-error
vi.spyOn(process, 'exit').mockImplementation(() => {})

describe('createUIEnvironment', () => {
  it('should create a silent UI environment', () => {
    const environment = createUIEnvironment('test', true)
    expect(environment.appName).toBe('test')
  })

  it('should handle intro', () => {
    const environment = createUIEnvironment('test', false)
    const spy = vi
      .spyOn(clack, 'intro')
      .mockImplementation(async () => undefined)
    environment.intro('test')
    expect(spy).toHaveBeenCalledWith('test')
  })

  it('should handle outro', () => {
    const environment = createUIEnvironment('test', false)
    const spy = vi
      .spyOn(clack, 'outro')
      .mockImplementation(async () => undefined)
    environment.outro('test')
    expect(spy).toHaveBeenCalledWith('test')
  })

  it('should handle info', () => {
    const environment = createUIEnvironment('test', false)
    const spy = vi
      .spyOn(clack.log, 'info')
      .mockImplementation(async () => undefined)
    environment.info('test')
    expect(spy).toHaveBeenCalled()
  })

  it('should handle error', () => {
    const environment = createUIEnvironment('test', false)
    const spy = vi
      .spyOn(clack.log, 'error')
      .mockImplementation(async () => undefined)
    environment.error('test')
    expect(spy).toHaveBeenCalled()
  })

  it('should handle warn', () => {
    const environment = createUIEnvironment('test', false)
    const spy = vi
      .spyOn(clack.log, 'warn')
      .mockImplementation(async () => undefined)
    environment.warn('test')
    expect(spy).toHaveBeenCalled()
  })

  it('should handle confirm', async () => {
    const environment = createUIEnvironment('test', false)
    const spy = vi.spyOn(clack, 'confirm').mockImplementation(async () => true)
    const isCancelSpy = vi
      .spyOn(clack, 'isCancel')
      .mockImplementation(() => false)
    const result = await environment.confirm('test')
    expect(spy).toHaveBeenCalled()
    expect(isCancelSpy).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('should handle confirm', async () => {
    const environment = createUIEnvironment('test', false)
    const spy = vi.spyOn(clack, 'confirm').mockImplementation(async () => true)
    const isCancelSpy = vi
      .spyOn(clack, 'isCancel')
      .mockImplementation(() => true)
    await environment.confirm('test')
    expect(spy).toHaveBeenCalled()
    expect(isCancelSpy).toHaveBeenCalled()
  })

  it('should handle spinner', async () => {
    const environment = createUIEnvironment('test', false)
    // @ts-expect-error
    const spy = vi.spyOn(clack, 'spinner').mockImplementation(async () => ({
      start: (_msg?: string) => {},
      stop: (_msg?: string) => {},
      message: (_msg?: string) => {},
    }))
    const result = await environment.spinner()
    expect(spy).toHaveBeenCalled()
  })
})
