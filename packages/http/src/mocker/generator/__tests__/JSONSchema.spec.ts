import { defaultsDeep, get } from 'lodash';
import {
  IHttpOperationDynamicConfig,
  IJsonSchemaFakerCustomGenerator,
  IJsonSchemaGeneratorArgs,
  JSONSchema,
} from '../../../types';
import { defaultJsonSchemaGeneratorArgs, generate } from '../JSONSchema';

describe('JSONSchema generator', () => {
  const ipRegExp = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
  const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  describe('generate()', () => {
    describe('when used with a schema with a custom formats', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, format: 'name' },
          description: { type: 'string', minLength: 1, format: 'description' },
          number: { type: 'integer', minLength: 1, format: 'fixedNumber' },
        },
        required: ['name'],
      };

      const config: IJsonSchemaGeneratorArgs = defaultsDeep(
        {
          customFormats: {
            name: 'this is a name',
            description: () => 'this is a description',
            fixedNumber: '100',
          },
        },
        defaultJsonSchemaGeneratorArgs,
      );

      it('will format a string value', () => {
        const instance = generate(config)(schema);
        expect(instance).toHaveProperty('name');
        const name = get(instance, 'name');
        expect(name).toBe('this is a name');
      });

      it('will format a function value', () => {
        const instance = generate(config)(schema);
        expect(instance).toHaveProperty('description');
        const description = get(instance, 'description');
        expect(description).toBe('this is a description');
      });

      // JSON Schema Faker doen not (yet) support custom formats
      // on primitives on other than string types
      it.skip('will format a number value', () => {
        const instance = generate(config)(schema);
        expect(instance).toHaveProperty('number');
        const description = get(instance, 'number');
        expect(description).toBe(100);
      });
    });

    describe('when used with a schema with external generators', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          externalGeneratedProperty: { type: 'string', minLength: 1, 'x-external': 'generator' },
        },
        required: ['externalGeneratedProperty'],
      };

      function ExternalGeneratorModule() {
        // @ts-ignore
        this.generator = () => 'this is a external generator';
      }

      // @ts-ignore
      const externalGenerator = new ExternalGeneratorModule();

      const config: IJsonSchemaGeneratorArgs = defaultsDeep(
        {
          externalGenerators: {
            external: () => externalGenerator,
          },
        },
        defaultJsonSchemaGeneratorArgs,
      );

      it('will have the result of the external generators', () => {
        const instance = generate(config)(schema);
        expect(instance).toHaveProperty('externalGeneratedProperty');
        const property = get(instance, 'externalGeneratedProperty');
        expect(property).toBe(externalGenerator.generator());
      });
    });

    // Allow full usage of OpenAPI Specification Extensions
    // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#specification-extensions
    describe('when used with a schema with custom generators', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          customGeneratedStringProperty: { type: 'string', minLength: 1, 'x-fnctn': '3' },
          customGeneratedNumberProperty: { type: 'number', minLength: 1, 'x-fnctn': 3 },
          customGeneratedBooleanProperty: { type: 'boolean', minLength: 1, 'x-fnctn': false },
          customGeneratedArrayProperty: {
            type: 'string',
            minLength: 1,
            'x-fnctn': ['this', 'is', 'an', 'array'],
          },
          customGeneratedObjectProperty: {
            type: 'string',
            minLength: 1,
            'x-fnctn': { an: 'an', object: 'object' },
          },
        },
        required: ['customGeneratedProperty'],
      };

      const fnctn: IJsonSchemaFakerCustomGenerator = value => value;

      const config: IJsonSchemaGeneratorArgs = defaultsDeep(
        {
          customGenerators: {
            fnctn,
          },
        },
        defaultJsonSchemaGeneratorArgs,
      );

      const instance = generate(config)(schema);

      it('will have the result of the custom generated function with a string value', () => {
        expect(instance).toHaveProperty('customGeneratedStringProperty');
        const property = get(instance, 'customGeneratedStringProperty');
        expect(property).toBe(fnctn('3'));
      });

      it('will have the result of the custom generated function with a number value', () => {
        expect(instance).toHaveProperty('customGeneratedNumberProperty');
        const property = get(instance, 'customGeneratedNumberProperty');
        expect(property).toBe(fnctn(3));
      });

      it('will have the result of the custom generated function with a boolean value', () => {
        expect(instance).toHaveProperty('customGeneratedBooleanProperty');
        const property = get(instance, 'customGeneratedBooleanProperty');
        expect(property).toBe(fnctn(false));
      });

      // JSON Schema Faker only returns strings from arrays of custom generators
      it('will have the result of the custom generated function with an array value', () => {
        expect(instance).toHaveProperty('customGeneratedArrayProperty');
        const property = get(instance, 'customGeneratedArrayProperty');
        expect(property).toBe(fnctn(['this', 'is', 'an', 'array'].toString()));
      });

      // JSON Schema Faker only returns strings from objects of custom generators
      it('will have the result of the custom generated function with an object value', () => {
        expect(instance).toHaveProperty('customGeneratedObjectProperty');
        const property = get(instance, 'customGeneratedObjectProperty');
        expect(property).toBe(fnctn({ an: 'an', object: 'object' }).toString());
      });
    });

    describe('when used with a schema with a simple string property', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
        },
        required: ['name'],
      };

      it('will have a string property not matching anything in particular', () => {
        const instance = generate()(schema);
        expect(instance).toHaveProperty('name');
        const name = get(instance, 'name');

        expect(ipRegExp.test(name)).toBeFalsy();
        expect(emailRegExp.test(name)).toBeFalsy();
      });
    });

    describe('when used with a schema with a string and email as format', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
        required: ['email'],
      };

      it('will have a string property matching the email regex', () => {
        const instance = generate()(schema);
        expect(instance).toHaveProperty('email');
        const email = get(instance, 'email');

        expect(ipRegExp.test(email)).toBeFalsy();
        expect(emailRegExp.test(email)).toBeTruthy();
      });
    });

    describe('when used with a schema with a string property and x-faker property', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          ip: { type: 'string', format: 'ip', 'x-faker': 'internet.ip' },
        },
        required: ['ip'],
      };

      it('will have a string property matching the ip regex', () => {
        const instance = generate()(schema);
        expect(instance).toHaveProperty('ip');
        const ip = get(instance, 'ip');

        expect(ipRegExp.test(ip)).toBeTruthy();
        expect(emailRegExp.test(ip)).toBeFalsy();
      });
    });

    it('operates on sealed schema objects', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      };

      Object.defineProperty(schema.properties, 'name', { writable: false });

      return expect(generate()(schema)).toBeTruthy();
    });
  });
});
