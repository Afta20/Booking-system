export function cn(...classes: (string | boolean | undefined | null | number)[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' ');
}
