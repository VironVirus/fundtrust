type ExcelCellValue = string | number | boolean | null | undefined;

type ExcelSheet = {
  name: string;
  rows: ExcelCellValue[][];
};

function escapeXml(value: ExcelCellValue) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getCellType(value: ExcelCellValue) {
  return typeof value === "number" ? "Number" : "String";
}

export function createExcelWorkbook(sheets: ExcelSheet[]) {
  const worksheetXml = sheets
    .map((sheet) => {
      const rows = sheet.rows
        .map((row, rowIndex) => {
          const cells = row
            .map((cell) => {
              const style = rowIndex === 0 ? ' ss:StyleID="Header"' : "";
              return `<Cell${style}><Data ss:Type="${getCellType(cell)}">${escapeXml(cell)}</Data></Cell>`;
            })
            .join("");

          return `<Row>${cells}</Row>`;
        })
        .join("");

      return `<Worksheet ss:Name="${escapeXml(sheet.name)}"><Table>${rows}</Table></Worksheet>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" />
    </Style>
  </Styles>
  ${worksheetXml}
</Workbook>`;
}
