import * as faker from 'faker';
import { cloneDeep } from 'lodash';
import { IHttpOperationDynamicConfig, IJsonSchemaFakerOptions, JSONSchema, PayloadGenerator } from '../../types';

// @ts-ignore
import * as jsf from 'json-schema-faker';
// @ts-ignore
import * as sampler from 'openapi-sampler';

export function generate(config: IHttpOperationDynamicConfig = {}): PayloadGenerator {
  const { customFormats, extensions, options } = config;

  if (customFormats) customFormats.forEach(({ keyword, value }) => jsf.format(keyword, value));
  if (extensions) extensions.forEach(({ keyword, value }) => jsf.extend(keyword, value));

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
    options,
  });

  return (source: JSONSchema): unknown => jsf.generate(cloneDeep(source));
}

export function generateStatic(source: JSONSchema): unknown {
  return sampler.sample(source);
}
