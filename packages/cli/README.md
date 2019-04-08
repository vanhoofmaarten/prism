prism-cli
=========

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/prism-cli.svg)](https://npmjs.org/package/prism-cli)
[![Downloads/week](https://img.shields.io/npm/dw/prism-cli.svg)](https://npmjs.org/package/prism-cli)
[![License](https://img.shields.io/npm/l/prism-cli.svg)](https://github.com/chris-miaskowski/prism-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @stoplight/prism-cli
$ prism COMMAND
running command...
$ prism (-v|--version|version)
@stoplight/prism-cli/3.0.0 darwin-x64 node-v11.13.0
$ prism --help [COMMAND]
USAGE
  $ prism COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`prism help [COMMAND]`](#prism-help-command)
* [`prism serve`](#prism-serve)

## `prism help [COMMAND]`

display help for prism

```
USAGE
  $ prism help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `prism serve`

Start a server with the given spec file

```
USAGE
  $ prism serve

OPTIONS
  -m, --mock       Turn global mocking on or off
  -p, --port=port  (required) [default: 4010] Port that Prism will run on.
  -s, --spec=spec  (required) Path to a spec file
```

_See code: [src/commands/serve.ts](https://github.com/stoplightio/prism/blob/v3.0.0/src/commands/serve.ts)_
<!-- commandsstop -->

## Development

### Running

1. Run `tsc -b` before executing the script
2. Run `yarn link` to enjoin `prism` command in your global env.

### Debugging

1. `node --inspect ./bin/run run`
2. .vscode/launch.json
```
{
  "type": "node",
  "request": "attach",
  "name": "Attach",
  "port": 9229
},
```
3. Run VSCode debugger
4. Enjoy breakpoints in VSCode :)
