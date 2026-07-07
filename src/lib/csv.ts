export function createCsv(rows: Array<Array<string | number>>) {
  const body = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\n");

  return `\uFEFF${body}`;
}
