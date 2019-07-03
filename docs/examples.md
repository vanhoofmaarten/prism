# Examples generation

Prism will try to generate meaningful examples for all the responses and use some fallback mechanisms in case the generation was not possible. This document outlines how the process works so that you will understand why Prism has responded with such example.

By default, Prism will use a **static generation strategy**, which is outlined below. You can enable the dynamic examples generation by using the `-d` flag in the command line.

`prism mock api.oas3.yaml` -> Static example generation

`prism mock -d api.oas3.yaml` -> Dynamic example generation

## Foreword

We will assume you're already familiar with the mocking flow. In case you're not, you can consult [our diagram][diagram]. This document describes fundamentally what happens once we have enough data to return a meaningful payload (aka: the last green circle).

When the negotiator has sorted out the response to return to the client and has selected the appropiate `content` according to the `Accept` header, but there's no element in the `examples` property, then the example generation kicks in.

Both Dynamic and Static generation almost follow the same path, which forks in the final behaviour in case anything else fails.


## Use the Faker extension for more meaningful examples

In case you're using dynamic examples, you can instruct with a simple extension what kind of data you're looking for, even if the official JSON Schema does not support such values.

[diagram]: ./packages/http/docs/images/mock-server-dfd.png
