import { IPrism, IPrismComponents, IPrismConfig } from '@stoplight/prism-core';
import { Dictionary, HttpMethod, IHttpOperation, INodeExample, INodeExternalExample } from '@stoplight/types';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';

export type PrismHttpInstance = IPrism<IHttpOperation, IHttpRequest, IHttpResponse, IHttpConfig>;

export type PrismHttpComponents = IPrismComponents<IHttpOperation, IHttpRequest, IHttpResponse, IHttpConfig>;

// TODO: should be complete | and in the @stoplight/types repo
export type IHttpMethod = HttpMethod | 'trace';

export interface IJsonSchemaFakerOptions {
  defaultInvalidTypeProduct?: string | null;
  defaultRandExpMax?: number;
  ignoreProperties?: string[];
  ignoreMissingRefs?: boolean;
  failOnInvalidTypes?: boolean;
  failOnInvalidFormat?: boolean;
  alwaysFakeOptionals?: boolean;
  optionalsProbability?: number;
  fixedProbabilities?: boolean;
  useExamplesValue?: boolean;
  useDefaultValue?: boolean;
  requiredOnly?: boolean;
  minItems?: number;
  maxItems?: number | null;
  minLength?: number;
  maxLength?: number | null;
  resolveJsonPath?: boolean;
  reuseProperties?: boolean;
  fillProperties?: boolean;
  random?: Function;
}

export type IOpenAPIPrimitive = string | number | boolean;

export interface ISpecificationExtensionValueArray extends Array<ISpecificationExtensionValue> {}
export interface ISpecificationExtensionValueObject {
  [key: string]: ISpecificationExtensionValue;
}
export type ISpecificationExtensionValue =
  | null
  | IOpenAPIPrimitive
  | ISpecificationExtensionValueArray
  | ISpecificationExtensionValueObject;

export type IJsonSchemaFakerCustomGenerator = (value: ISpecificationExtensionValue) => any;

export type JsonSchemaFakerExtensionValidator = (extension: JsonSchemaFakerExtension) => boolean;

export type JsonSchemaFakerCustomFormatExtension = number | string | Function;

export type JsonSchemaFakerExternalGeneratorExtension = Function;

export type JsonSchemaFakerCustomGeneratorExtension = number | string | IJsonSchemaFakerCustomGenerator;

export enum IJsonSchemaFakerExtensionTypeKey {
  customFormats = 'customFormats',
  externalGenerators = 'externalGenerators',
  customGenerators = 'customGenerators',
}

export type JsonSchemaFakerExtension =
  | JsonSchemaFakerCustomFormatExtension
  | JsonSchemaFakerExternalGeneratorExtension
  | JsonSchemaFakerCustomGeneratorExtension;

export interface IJsonSchemaFakerExtensions<T> {
  [keyword: string]: T;
}

export enum IJsonSchemaFakerExtensionDirectoryNames {
  base = 'baseDirectory',
  customFormats = 'customFormatsDirectory',
  externalGenerators = 'externalGeneratorsDirectory',
  customGenerators = 'customGeneratorsDirectory',
}

export type IJsonSchemaFakerExtensionDirectories = Record<IJsonSchemaFakerExtensionDirectoryNames, string>;

export interface IJsonSchemaFakerExtensionConfig extends IJsonSchemaFakerExtensionTypes {
  watchDirectories: boolean;
  directories: IJsonSchemaFakerExtensionDirectories;
}

export type IJsonSchemaFakerExtensionTypes = Record<
  IJsonSchemaFakerExtensionTypeKey,
  IJsonSchemaFakerExtensions<JsonSchemaFakerExtension>
>;

export interface IJsonSchemaFakerExtensionType {
  validator: JsonSchemaFakerExtensionValidator;
  importedExtensions: IJsonSchemaFakerExtensions<JsonSchemaFakerExtension> | undefined;
}

export interface IJsonSchemaGeneratorArgs extends Required<IJsonSchemaFakerExtensionTypes> {
  options: IJsonSchemaFakerOptions;
}

export interface IHttpOperationDynamicConfig
  extends Partial<IJsonSchemaFakerExtensionConfig>,
    Partial<IJsonSchemaGeneratorArgs> {}

export interface IHttpOperationConfig {
  mediaTypes?: string[];
  code?: string;
  exampleKey?: string;
  dynamic: boolean | IHttpOperationDynamicConfig;
}

export interface IHttpConfig extends IPrismConfig {
  mock: IHttpOperationConfig;
}

export type IHttpNameValues = Dictionary<string | string[]>;

export type IHttpNameValue = Dictionary<string>;

export interface IHttpUrl {
  baseUrl?: string;
  path: string;
  query?: IHttpNameValues;
}

export interface IHttpRequest {
  method: IHttpMethod;
  url: IHttpUrl;
  headers?: IHttpNameValue;
  body?: unknown;
}

export interface IHttpResponse {
  statusCode: number;
  headers?: IHttpNameValue;
  body?: unknown;
  responseType?: XMLHttpRequestResponseType;
}

export type ProblemJson = {
  type: string;
  title: string;
  status: number;
  detail: any;
};

export class ProblemJsonError extends Error {
  public static fromTemplate(
    template: Omit<ProblemJson, 'detail'>,
    detail?: string,
    additional?: Dictionary<unknown>,
  ): ProblemJsonError {
    const error = new ProblemJsonError(
      `https://stoplight.io/prism/errors#${template.type}`,
      template.title,
      template.status,
      detail || '',
      additional,
    );
    Error.captureStackTrace(error, ProblemJsonError);

    return error;
  }

  public static fromPlainError(
    error: Error & { detail?: string; status?: number; additional?: Dictionary<unknown> },
  ): ProblemJson {
    return {
      type: error.name && error.name !== 'Error' ? error.name : 'https://stoplight.io/prism/errors#UNKNOWN',
      title: error.message,
      status: error.status || 500,
      detail: error.detail || '',
      ...error.additional,
    };
  }

  constructor(
    readonly name: string,
    readonly message: string,
    readonly status: number,
    readonly detail: string,
    readonly additional?: Dictionary<unknown>,
  ) {
    super(message);
    Error.captureStackTrace(this, ProblemJsonError);
  }
}

export type ContentExample = INodeExample | INodeExternalExample;
export type PayloadGenerator = (f: JSONSchema) => unknown;

export type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
