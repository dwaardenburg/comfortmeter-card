/** The value, or a failed test when it is missing. Stands in for `!` in tests. */
export function defined<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("expected a value, got none");
  return value;
}
