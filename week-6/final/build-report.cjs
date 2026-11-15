/** Build the separate final report. Existing technical reports are never written. */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const workspaceRoot = path.resolve(__dirname, '../../..');
const requireApp = createRequire(path.join(workspaceRoot, 'erusentia-app/package.json'));
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, WidthType, BorderStyle, PageNumber,
  ShadingType, ExternalHyperlink,
} = requireApp('docx');

const basename = 'NguyenTienTuan_BaoCaoTongKet_TYP2026_Final';
const source = fs.readFileSync(path.join(__dirname, 'REPORT_FINAL.md'), 'utf8');
const font = 'Times New Roman';
const color = '17324D';

function runs(text, options = {}) {
  return text.split(/(\*\*.*?\*\*|`[^`]+`)/g).filter(Boolean).map(part => {
    const bold = part.startsWith('**');
    const code = part.startsWith('`');
    const content = bold ? part.slice(2, -2) : code ? part.slice(1, -1) : part;
    if (content === 'github.com/Tunhoclaptrinh/EruSentia-Server') {
      return new ExternalHyperlink({
        link: 'https://github.com/Tunhoclaptrinh/EruSentia-Server',
        children: [new TextRun({ text: content, font, color, underline: {}, ...options })],
      });
    }
    return new TextRun({ text: content, font, ...(bold ? { bold: true } : {}), ...options });
  });
}

const border = { style: BorderStyle.SINGLE, size: 4, color: 'C7CED5' };
function table(lines) {
  const data = lines.map(line => line.trim().slice(1, -1).split('|').map(cell => cell.trim()));
  const rows = [data[0], ...data.slice(2)];
  return new Table({
    width: { size: 9638, type: WidthType.DXA },
    columnWidths: [2180, 7458],
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: rows.map((row, index) => new TableRow({
      tableHeader: index === 0,
      cantSplit: true,
      children: row.map((text, column) => new TableCell({
        width: { size: column === 0 ? 2180 : 7458, type: WidthType.DXA },
        margins: { top: 85, bottom: 85, left: 110, right: 110 },
        ...(index === 0 ? { shading: { type: ShadingType.CLEAR, fill: 'EAF0F5' } } : {}),
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 0, line: 252 },
          children: runs(text, { size: 23, ...(index === 0 ? { bold: true, color } : {}) }),
        })],
      })),
    })),
  });
}

const lines = source.split(/\r?\n/);
const children = [];
let breakBefore = false;
for (let index = 0; index < lines.length; index++) {
  const line = lines[index].trim();
  if (!line) continue;
  if (line === '<!-- pagebreak -->') { breakBefore = true; continue; }
  if (line.startsWith('|')) {
    const block = [line];
    while (index + 1 < lines.length && lines[index + 1].trim().startsWith('|')) block.push(lines[++index]);
    children.push(table(block));
    continue;
  }
  const heading = /^(#{1,4}) (.*)$/.exec(line);
  if (heading) {
    const level = heading[1].length;
    const settings = {
      1: { size: 31, before: 40, after: 65, bold: true, alignment: AlignmentType.CENTER },
      2: { size: 26, before: 0, after: 190, bold: true, alignment: AlignmentType.CENTER },
      3: { size: 26, before: 165, after: 80, bold: true, alignment: AlignmentType.LEFT },
      4: { size: 24, before: 110, after: 65, bold: true, alignment: AlignmentType.LEFT },
    }[level];
    children.push(new Paragraph({
      alignment: settings.alignment,
      pageBreakBefore: breakBefore,
      keepNext: true,
      keepLines: true,
      outlineLevel: Math.max(0, level - 2),
      spacing: { before: breakBefore ? 0 : settings.before, after: settings.after, line: 260 },
      children: [new TextRun({ text: heading[2], font, size: settings.size, bold: settings.bold, color })],
    }));
    breakBefore = false;
    continue;
  }
  const metadata = /^\*\*(Học viên|Chương trình|Ngày báo cáo):/.test(line);
  const reference = line.startsWith('**Tài liệu bổ trợ:**');
  children.push(new Paragraph({
    alignment: metadata || reference ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
    widowControl: true,
    keepNext: metadata,
    spacing: { before: 0, after: metadata ? 30 : 95, line: reference ? 250 : 276 },
    children: runs(line, { size: reference ? 22 : 24 }),
  }));
}

const document = new Document({
  creator: 'Nguyễn Tiến Tuấn',
  lastModifiedBy: 'Nguyễn Tiến Tuấn',
  title: 'Báo cáo tổng kết đào tạo Backend – EruSentia',
  subject: 'Backend Training TYP 2026',
  description: 'Tổng kết kiến thức, ứng dụng vào dự án, hai chức năng khó và kết quả thực hiện.',
  styles: {
    default: {
      document: {
        run: { font, size: 24, color: '171717', language: { value: 'vi-VN' } },
        paragraph: { spacing: { line: 276, after: 95 }, widowControl: true },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 510, footer: 510 },
      },
    },
    headers: { default: new Header({ children: [new Paragraph({
      spacing: { after: 0 },
      children: [new TextRun({ text: 'TYP 2026  |  BÁO CÁO TỔNG KẾT ĐÀO TẠO', font, size: 18, color: '647180' })],
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'Nguyễn Tiến Tuấn  •  Trang ', font, size: 19, color: '647180' }),
        new TextRun({ children: [PageNumber.CURRENT], font, size: 19, color: '647180' }),
        new TextRun({ text: ' / ', font, size: 19, color: '647180' }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font, size: 19, color: '647180' }),
      ],
    })] }) },
    children,
  }],
});

Packer.toBuffer(document).then(buffer => {
  const output = path.join(__dirname, basename + '.docx');
  fs.writeFileSync(output, buffer);
  console.log(JSON.stringify({ output, bytes: buffer.length, sourceWords: source.split(/\s+/).filter(Boolean).length }));
}).catch(error => { console.error(error); process.exitCode = 1; });
