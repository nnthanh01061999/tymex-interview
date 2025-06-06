export function debounce<F extends (...args: any[]) => void>(
  func?: F,
  wait?: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout
  return function (...args: Parameters<F>) {
    if (!func || wait == null) return
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function isEmpty(value: any): boolean {
  if (value == null) return true

  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === "object") {
    if (value instanceof Date || value instanceof Map || value instanceof Set)
      return false

    return Object.keys(value).every((key) => isEmpty(value[key]))
  }

  return false
}

export const cleanObject = (object: any) => {
  Object.entries(object).forEach(([k, v]: [k: any, v: any]) => {
    if (v && typeof v === "object") cleanObject(v)

    if (
      (v && typeof v === "object" && !Object.keys(v).length) ||
      v === null ||
      v === undefined ||
      v.length === 0
    ) {
      if (Array.isArray(object)) object.splice(k, 1)
      else if (!(v instanceof Date)) delete object[k]
    }
  })
  return object
}
