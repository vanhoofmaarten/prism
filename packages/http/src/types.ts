import { IPrism, IPrismComponents, IPrismConfig, IPrismDiagnostic } from '@stoplight/prism-core';
import { Dictionary, HttpMethod, IHttpOperation, INodeExample, INodeExternalExample } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';

export type TPrismHttpInstance = IPrism<IHttpOperation, IHttpRequest, IHttpResponse, IHttpConfig>;

export type TPrismHttpComponents = Partial<IPrismComponents<IHttpOperation, IHttpRequest, IHttpResponse, IHttpConfig>>;

// TODO: should be complete | and in the @stoplight/types repo
export type IHttpMethod = HttpMethod | 'trace';

// TODO: Replace with official JSON Schema Faker types
// https://github.com/json-schema-faker/json-schema-faker/issues/516
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

export interface IJsonSchemaFakerNullableExtension {
  keyword: string;
  value: any;
}

export interface IJsonSchemaFakerExtension extends IJsonSchemaFakerNullableExtension {
  value: Function;
}

export interface IHttpOperationDynamicConfig {
  options?: IJsonSchemaFakerOptions;
  customFormats?: IJsonSchemaFakerNullableExtension[];
  extensions?: IJsonSchemaFakerExtension[];
}

export interface IHttpOperationConfig {
  mediaTypes?: string[];
  code?: string;
  exampleKey?: string;
  dynamic: boolean | IHttpOperationDynamicConfig;
}

export interface IHttpConfig extends IPrismConfig {
  mock: false | IHttpOperationConfig;

  validate?: {
    request?:
      | boolean
      | {
          hijack?: boolean;
          headers?: boolean;
          query?: boolean;
          body?: boolean;
        };

    response?:
      | boolean
      | {
          headers?: boolean;
          body?: boolean;
        };
  };
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
  body?: any;
}

export interface IHttpResponse {
  statusCode: number;
  headers?: IHttpNameValue;
  body?: any;
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
export type NonEmptyArray<T> = T[] & { 0: T };
export type PayloadGenerator = (f: JSONSchema) => unknown;

export type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
