import { existsSync, readdirSync } from 'fs';
import { defaults, defaultsDeep, pick } from 'lodash';
import { basename, extname, join, resolve } from 'path';

import {
  IHttpOperationDynamicConfig,
  IJsonSchemaFakerExtensionConfigDefaults,
  IJsonSchemaFakerExtensionDirectories,
  IJsonSchemaFakerExtensionDirectoryNames,
  IJsonSchemaFakerExtensions,
  IJsonSchemaFakerExtensionsReturnValue,
  JsonSchemaFakerCustomFormatExtension,
  JsonSchemaFakerCustomGeneratorExtension,
  JsonSchemaFakerExtension,
  JsonSchemaFakerExtensionConfig,
  JsonSchemaFakerExtensionValidator,
  JsonSchemaFakerExternalGeneratorExtension,
} from './types';

export const defaultDirectories: IJsonSchemaFakerExtensionDirectories = {
  baseDirectory: `${process.cwd()}/prism`,
  customFormatsDirectory: 'custom-formats',
  externalGeneratorsDirectory: 'external-generators',
  customGeneratorsDirectory: 'custom-generators',
};

export const defaultExtensions: IJsonSchemaFakerExtensionsReturnValue = {
  customFormats: {},
  externalGenerators: {},
  customGenerators: {},
};

export const defaultConfig: IJsonSchemaFakerExtensionConfigDefaults = {
  watchDirectories: true,
  directories: defaultDirectories,
  ...defaultExtensions,
};

// Check the extension type against the given operands
const typesValidator = (extension: JsonSchemaFakerExtension, types: string[]) =>
  types.some(type => {
    if (typeof extension === 'object') {
      return Object.keys(extension).length > 0;
    } else {
      return typeof extension === type;
    }
  });

const customFormatExtensionValidator = (
  extension: JsonSchemaFakerExtension,
): extension is JsonSchemaFakerCustomFormatExtension => typesValidator(extension, ['number', 'string', 'function']);

const externalGeneratorExtensionValidator = (
  extension: JsonSchemaFakerExtension,
): extension is JsonSchemaFakerExternalGeneratorExtension => typesValidator(extension, ['function']);

const customGeneratorExtensionValidator = (
  extension: JsonSchemaFakerExtension,
): extension is JsonSchemaFakerCustomGeneratorExtension => typesValidator(extension, ['number', 'string', 'object']);

const validateExtensions = <T>(extensions: T, validator: JsonSchemaFakerExtensionValidator): T =>
  Object.keys(extensions).reduce((acc, extensionKey) => {
    const extension = extensions[extensionKey];
    if (validator(extension)) {
      return {
        ...acc,
        [extensionKey]: extension,
      };
    } else {
      // TODO: Use Prism logging to warn use about the invalid module
      console.warn(
        `'${extensionKey} has type ${typeof extension}. Tis is an invalid type for this type of extension. It will not be included.`,
      );
      return acc;
    }
  }, {}) as T;

const importExtensionType = <T>(
  directories: IJsonSchemaFakerExtensionDirectories,
  directoryKey: string,
): IJsonSchemaFakerExtensions<T> | undefined => {
  // Check and read the filesystem
  const folderPath = resolve(directories.baseDirectory, directories[directoryKey]);
  if (!existsSync(folderPath)) return;
  const files = readdirSync(folderPath);
  if (files.length === 0) return;

  // Filter out non-JS files
  const jsFiles = files.filter(file => extname(file) === '.js');
  if (jsFiles.length === 0) return;

  // Reduce the files to an object
  const extensions = jsFiles.reduce((acc, file): IJsonSchemaFakerExtensions<T> => {
    const key = basename(file, extname(file));
    const extension = require(join(folderPath, file));
    return {
      ...acc,
      [key]: extension,
    };
  }, {});

  // Return undefined if no extensions are imported
  if (Object.keys(extensions).length === 0) return;

  return extensions;
};

const getExtensions = (configArg: JsonSchemaFakerExtensionConfig): IJsonSchemaFakerExtensionsReturnValue => {
  const config: IJsonSchemaFakerExtensionConfigDefaults = defaultsDeep(configArg, defaultConfig);

  // Get the extensions
  const extensions = {
    customFormats: validateExtensions<IJsonSchemaFakerExtensions<JsonSchemaFakerCustomFormatExtension>>(
      defaultsDeep(
        config.customFormats,
        importExtensionType<JsonSchemaFakerCustomFormatExtension>(
          config.directories,
          IJsonSchemaFakerExtensionDirectoryNames.customFormats,
        ),
      ),
      customFormatExtensionValidator,
    ),
    externalGenerators: validateExtensions<IJsonSchemaFakerExtensions<JsonSchemaFakerExternalGeneratorExtension>>(
      defaultsDeep(
        config.externalGenerators,
        importExtensionType<JsonSchemaFakerExternalGeneratorExtension>(
          config.directories,
          IJsonSchemaFakerExtensionDirectoryNames.externalGenerators,
        ),
      ),
      externalGeneratorExtensionValidator,
    ),
    customGenerators: validateExtensions<IJsonSchemaFakerExtensions<JsonSchemaFakerCustomGeneratorExtension>>(
      defaultsDeep(
        config.customGenerators,
        importExtensionType<JsonSchemaFakerCustomGeneratorExtension>(
          config.directories,
          IJsonSchemaFakerExtensionDirectoryNames.customGenerators,
        ),
      ),
      customGeneratorExtensionValidator,
    ),
  };

  return defaultsDeep(extensions, defaultExtensions);
};

export default (config: true | JsonSchemaFakerExtensionConfig): IJsonSchemaFakerExtensionsReturnValue =>
  // Just return the filesystem-based extensions if there are no programmatically extensions defined.
  getExtensions(config === true ? defaultConfig : config);
