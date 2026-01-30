import type { Options, SerializedOptions } from './types'

export const createSerializedOptions = (options: Options) => {
  const serializedOptions: SerializedOptions = {
    ...options,
    chosenAddOns: options.chosenAddOns.map((addOn) => addOn.id),
    framework: options.framework.id,
    starter: options.starter?.id,
  }
  return serializedOptions
}
