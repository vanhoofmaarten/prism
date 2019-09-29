import { existsSync, readdirSync } from 'fs';
import { defaults, defaultsDeep, pick } from 'lodash';
import { basename, extname, join, resolve } from 'path';

import {
  IJsonSchemaFakerExtensionConfig,
  IJsonSchemaFakerExtensionDirectories,
  IJsonSchemaFakerExtensionDirectoryNames,
  IJsonSchemaFakerExtensions,
  IJsonSchemaFakerExtensionTypeKey,
  IJsonSchemaFakerExtensionTypes,
  JsonSchemaFakerCustomFormatExtension,
  JsonSchemaFakerCustomGeneratorExtension,
  JsonSchemaFakerExtension,
  JsonSchemaFakerExtensionValidator,
  JsonSchemaFakerExternalGeneratorExtension,
} from './types';

export const defaultDirectories: IJsonSchemaFakerExtensionDirectories = {
  baseDirectory: `${process.cwd()}/prism`,
  customFormatsDirectory: 'custom-formats',
  externalGeneratorsDirectory: 'external-generators',
  customGeneratorsDirectory: 'custom-generators',
};

export const defaultExtensions: IJsonSchemaFakerExtensionTypes = {
  customFormats: {},
  externalGenerators: {},
  customGenerators: {},
};

export const defaultConfig: IJsonSchemaFakerExtensionConfig = {
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

const getExtensions = (configArg: IJsonSchemaFakerExtensionConfig): IJsonSchemaFakerExtensionTypes => {
  const config: IJsonSchemaFakerExtensionConfig = defaultsDeep(configArg, defaultConfig);

  const getExtension = <T>(
    key: IJsonSchemaFakerExtensionTypeKey,
    validator: JsonSchemaFakerExtensionValidator,
  ): IJsonSchemaFakerExtensions<T> =>
    // Validate both programmatic and file-based extensions
    validateExtensions<IJsonSchemaFakerExtensions<T>>(
      // Merge programmatic and file-based extensions. Prioritize programmatic extensions.
      defaultsDeep(
        config[key],
        // Import file-based extensions.
        importExtensionType<JsonSchemaFakerCustomFormatExtension>(
          config.directories,
          IJsonSchemaFakerExtensionDirectoryNames[key],
        ),
      ),
      validator,
    );

  // Get the extensions
  const extensions = {
    customFormats: getExtension<JsonSchemaFakerCustomFormatExtension>(
      IJsonSchemaFakerExtensionTypeKey.customFormats,
      customFormatExtensionValidator,
    ),
    externalGenerators: getExtension<JsonSchemaFakerExternalGeneratorExtension>(
      IJsonSchemaFakerExtensionTypeKey.externalGenerators,
      externalGeneratorExtensionValidator,
    ),
    customGenerators: getExtension<JsonSchemaFakerExternalGeneratorExtension>(
      IJsonSchemaFakerExtensionTypeKey.customGenerators,
      customGeneratorExtensionValidator,
    ),
  };

  // Provide non-declared extensions with empty extensions objects
  return defaultsDeep(extensions, defaultExtensions);
};

export default (config: true | IJsonSchemaFakerExtensionConfig): IJsonSchemaFakerExtensionTypes =>
  // Just return the filesystem-based extensions if there are no programmatically extensions defined.
  getExtensions(config === true ? defaultConfig : config);
