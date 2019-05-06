import { IPrism } from '@stoplight/prism-core';
import { IHttpOperation } from '@stoplight/types/http-spec';
import { omit } from 'lodash';
import { relative, resolve } from 'path';
import { createInstance, IHttpConfig, IHttpRequest, IHttpResponse } from '../';
import { forwarder } from '../forwarder';
import { NO_PATH_MATCHED_ERROR } from '../router/errors';

describe('Http Prism Instance function tests', () => {
  let prism: IPrism<IHttpOperation, IHttpRequest, IHttpResponse, IHttpConfig, { path: string }>;

  beforeAll(async () => {
    prism = createInstance({ mock: true }, {});
    await prism.load({
      path: relative(
        process.cwd(),
        resolve(__dirname, 'fixtures', 'no-refs-petstore-minimal.oas2.json')
      ),
    });
  });

  test('keeps the instances separate', async () => {
    const second_prism = createInstance({ mock: true }, {});
    await second_prism.load({
      path: relative(
        process.cwd(),
        resolve(__dirname, 'fixtures', 'no-refs-petstore-minimal.oas2.json')
      ),
    });

    expect(prism.resources).toStrictEqual(second_prism.resources);
  });

  test('given incorrect route should throw error', () => {
    return expect(
      prism.process({
        method: 'get',
        url: {
          path: '/invalid-route',
        },
      })
    ).rejects.toThrowError(NO_PATH_MATCHED_ERROR);
  });

  test('given correct route should return correct response', async () => {
    const response = await prism.process({
      method: 'get',
      url: {
        path: '/pet/findByStatus',
        query: {
          status: ['available', 'pending'],
        },
      },
    });
    const parsedBody = JSON.parse(response!.output!.body);
    expect(parsedBody.length).toBeGreaterThan(0);
    parsedBody.forEach((element: any) => {
      expect(typeof element.name).toEqual('string');
      expect(Array.isArray(element.photoUrls)).toBeTruthy();
      expect(element.photoUrls.length).toBeGreaterThan(0);
    });
    // because body is generated randomly
    expect(omit(response, 'output.body')).toMatchSnapshot();
  });

  test('given route with invalid param should return a validation error', async () => {
    const response = await prism.process({
      method: 'get',
      url: {
        path: '/pet/findByStatus',
      },
    });
    expect(response).toMatchSnapshot();
  });

  test('should support collection format multi', async () => {
    const response = await prism.process({
      method: 'get',
      url: {
        path: '/pet/findByStatus',
        query: {
          status: ['sold', 'available'],
        },
      },
    });
    expect(response.validations).toEqual({
      input: [],
      output: [],
    });
  });

  test('support param in body', async () => {
    const response = await prism.process({
      method: 'post',
      url: {
        path: '/store/order',
      },
      body: {
        id: 1,
        petId: 2,
        quantity: 3,
        shipDate: '12-01-2018',
        status: 'placed',
        complete: true,
      },
    });
    expect(response.validations).toEqual({
      input: [],
      output: [],
    });
  });

  test("should forward the request correctly even if resources haven't been provided", async () => {
    // Recreate Prism with no loaded document
    prism = createInstance(undefined, { forwarder, router: undefined, mocker: undefined });

    const response = await prism.process({
      method: 'post',
      url: {
        path: '/store/order',
        baseUrl: 'https://petstore.swagger.io',
      },
      body: {
        id: 1,
        petId: 2,
        quantity: 3,
        shipDate: '12-01-2018',
        status: 'placed',
        complete: true,
      },
    });

    expect(response.validations).toEqual({
      input: [],
      output: [],
    });
  });

  test('loads spec provided in yaml', async () => {
    prism = createInstance();
    await prism.load({
      path: relative(process.cwd(), resolve(__dirname, 'fixtures', 'petstore.oas2.yaml')),
    });

    expect(prism.resources).toHaveLength(3);
  });

  test('returns stringified static example when one defined in spec', async () => {
    prism = createInstance();
    await prism.load({
      path: relative(process.cwd(), resolve(__dirname, 'fixtures', 'static-examples.oas2.json')),
    });

    const response = await prism.process({
      method: 'get',
      url: {
        path: '/todos',
      },
    });

    expect(response.output).toBeDefined();
    expect(typeof response.output!.body).toBe('string');
  });
});
