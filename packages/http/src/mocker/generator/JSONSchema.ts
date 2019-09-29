import * as faker from 'faker';
import { cloneDeep } from 'lodash';
import { defaultExtensions } from '../../getMockExtensions';
import { IJsonSchemaFakerOptions, IJsonSchemaGeneratorArgs, JSONSchema, PayloadGenerator } from '../../types';

// @ts-ignore
import * as jsf from 'json-schema-faker';
// @ts-ignore
import * as sampler from 'openapi-sampler';

export const defaultJsonSchemaGeneratorArgs: IJsonSchemaGeneratorArgs = {
  options: {},
  ...defaultExtensions,
};

export function generate(config: IJsonSchemaGeneratorArgs = defaultJsonSchemaGeneratorArgs): PayloadGenerator {
  const { customGenerators, customFormats, externalGenerators, options } = config;

  const jsfDefaultOptions: IJsonSchemaFakerOptions = {
    failOnInvalidTypes: false,
    failOnInvalidFormat: false,
    alwaysFakeOptionals: true,
    optionalsProbability: 1,
    fixedProbabilities: true,
    ignoreMissingRefs: true,
    maxItems: 20,
    maxLength: 100,
  };

  jsf.extend('faker', () => faker);

  jsf.option({
    ...jsfDefaultOptions,
    ...options,
  });

  // OpenAPI Spec: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#data-types
  // JSON Schema Faker: https://github.com/json-schema-faker/json-schema-faker/blob/master/docs/USAGE.md#custom-formats
  Object.keys(customFormats).forEach(keyword => {
    const value = customFormats[keyword];
    if (typeof value === 'string' || typeof value === 'number') jsf.format(keyword, () => value);
    if (typeof value === 'function') jsf.format(keyword, value);
  });

  // JSON Schema Faker: https://github.com/json-schema-faker/json-schema-faker/blob/master/docs/USAGE.md#extending-dependencies
  Object.keys(externalGenerators).forEach(keyword => {
    const value = externalGenerators[keyword];
    if (typeof value === 'function') jsf.extend(keyword, value);
  });

  // Allow full usage of OpenAPI Specification Extensions
  // OpenAPI Spec: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#specification-extensions
  Object.keys(customGenerators).forEach(keyword => {
    const value = customGenerators[keyword];
    if (typeof value === 'function') jsf.define(keyword, value);
  });

  return (source: JSONSchema): unknown => jsf.generate(cloneDeep(source));
}

export function generateStatic(source: JSONSchema): unknown {
  return sampler.sample(source);
}
