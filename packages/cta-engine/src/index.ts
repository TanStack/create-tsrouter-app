export { createApp } from './create-app.js'
export { computeAttribution } from './attribution.js'
export { addToApp } from './add-to-app.js'

export {
  finalizeAddOns,
  getAllAddOns,
  populateAddOnOptionsDefaults,
} from './add-ons.js'

export { loadRemoteAddOn } from './custom-add-ons/add-on.js'
export { loadStarter } from './custom-add-ons/starter.js'

export {
  createMemoryEnvironment,
  createDefaultEnvironment,
} from './environment.js'

export { CONFIG_FILE } from './constants.js'

export {
  DEFAULT_PACKAGE_MANAGER,
  SUPPORTED_PACKAGE_MANAGERS,
  getPackageManager,
} from './package-manager.js'

export {
  registerFramework,
  getFrameworkById,
  getFrameworkByName,
  getFrameworks,
  scanProjectDirectory,
  scanAddOnDirectories,
} from './frameworks.js'

export {
  writeConfigFileToEnvironment,
  readConfigFileFromEnvironment,
  readConfigFile,
} from './config-file.js'

export {
  cleanUpFiles,
  cleanUpFileArray,
  readFileHelper,
  getBinaryFile,
  recursivelyGatherFiles,
  relativePath,
} from './file-helpers.js'

export { formatCommand, handleSpecialURL } from './utils.js'

export { initStarter, compileStarter } from './custom-add-ons/starter.js'
export { initAddOn, compileAddOn } from './custom-add-ons/add-on.js'
export {
  createAppOptionsFromPersisted,
  createSerializedOptionsFromPersisted,
} from './custom-add-ons/shared.js'

export { createSerializedOptions } from './options.js'

export {
  getRawRegistry,
  getRegistry,
  getRegistryAddOns,
  getRegistryStarters,
} from './registry.js'

export {
  StarterCompiledSchema,
  StatusEvent,
  StatusStepType,
  StopEvent,
  AddOnCompiledSchema,
  AddOnInfoSchema,
  IntegrationSchema,
} from './types.js'

export type {
  AddOn,
  AddOnOption,
  AddOnOptions,
  AddOnSelectOption,
  AddOnSelection,
  Environment,
  FileBundleHandler,
  Framework,
  FrameworkDefinition,
  Options,
  SerializedOptions,
  Starter,
  StarterCompiled,
  LineAttribution,
  FileProvenance,
  AttributedFile,
  DependencyAttribution,
} from './types.js'
export type { AttributionInput, AttributionOutput } from './attribution.js'
export type { MemoryEnvironmentOutput } from './environment.js'
export type { PersistedOptions } from './config-file.js'
export type { PackageManager } from './package-manager.js'
