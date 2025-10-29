function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function transformKeys<T = unknown>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item)) as T
  }

  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        const camelKey = snakeToCamel(key)
        acc[camelKey] = transformKeys(value)
        return acc
      },
      {} as Record<string, unknown>
    ) as T
  }

  return obj as T
}

export function transformApiResponse<T>(data: unknown): T {
  return transformKeys<T>(data)
}
