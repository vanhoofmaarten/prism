export function parseSpecFile(spec: string) {
  const marker = '=====';

  const [test, file, runCommand, clientCommand, expect] = spec.split(marker).map(t => t.trim());

  return { test: test, file: file, runCommand: runCommand.split(' ').map(t => t.trim()), clientCommand: clientCommand, expect: expect }
}
