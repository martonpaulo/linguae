/**
 * Values a catalogue cell shows before "and N more". Measured on the published data at 1280px:
 * three nation names keep a row within two lines in the table's narrowest multi-value column.
 */
export const VALUE_LIST_LIMIT = 3;

/**
 * Splits a multi-value field into what a cell shows and what it clamps. The matched value, when
 * present, moves to the front; every other value keeps the data's order. A clamp never hides a
 * single value, since "and 1 more" is no shorter than the value itself.
 */
export function orderValues(
  values: string[],
  matched: string | undefined,
  limit: number
): { shown: string[]; rest: string[] } {
  const ordered =
    matched && values.includes(matched)
      ? [matched, ...values.filter((value) => value !== matched)]
      : values;

  if (ordered.length <= limit + 1) return { shown: ordered, rest: [] };
  return { shown: ordered.slice(0, limit), rest: ordered.slice(limit) };
}
