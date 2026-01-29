export function sortObject(
  obj: Record<string, string>,
): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
}

export function jsSafeName(name: string) {
  return name
    .split(/[^a-zA-Z0-9]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export function formatCommand({
  command,
  args,
}: {
  command: string
  args: Array<string>
}) {
  return `${command} ${args.join(' ')}`.trim()
}

// Turn GitHub URLs into raw URLs
export function handleSpecialURL(url: string) {
  if (url.startsWith('https://github.com/') && url.includes('blob')) {
    return url
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/refs/heads/')
  }
  if (url.startsWith('https://github.com/') && url.includes('tree')) {
    return url
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/tree/', '/refs/heads/')
  }
  return url
}
