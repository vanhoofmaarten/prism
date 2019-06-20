export function parseSpecFile(spec: string): any {
  const regex = /====(server|test|spec|command|expect)====\n(([^=])*)/gi

  const obj = {}
  let m;

  while ((m = regex.exec(spec)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    obj[m[1]] = m[2].trim()
    // The result can be accessed through the `m`-variable.
  }

  return obj;

}
