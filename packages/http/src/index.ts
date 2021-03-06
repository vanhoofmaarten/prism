import { factory } from '@stoplight/prism-core';
import { IHttpOperation } from '@stoplight/types';
import { defaults } from 'lodash';
import mock from './mocker';
import route from './router';
import { validateInput, validateOutput } from './validator';
export * from './types';
export * from './getHttpOperations';

import { IHttpConfig, IHttpRequest, IHttpResponse, PickRequired, PrismHttpComponents } from './types';

export const createInstance = (
  defaultConfig: IHttpConfig,
  components?: PickRequired<Partial<PrismHttpComponents>, 'logger'>,
) =>
  factory<IHttpOperation, IHttpRequest, IHttpResponse, IHttpConfig>(
    defaultConfig,
    defaults(components, { route, validateInput, validateOutput, mock }),
  );
