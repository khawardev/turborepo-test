'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    Document, 
    Packer, 
    Paragraph, 
    TextRun, 
    HeadingLevel, 
    Table, 
    TableRow, 
    TableCell, 
    WidthType, 
    AlignmentType, 
    BorderStyle,
    VerticalAlign,
    TableLayoutType,
    PageOrientation
} from 'docx';
import { saveAs } from 'file-saver';
import { marked } from 'marked';

const HEADING_COLOR = '#111827';
const TEXT_COLOR = '#111827';
const BORDER_COLOR = '#D1D5DB';

// Define base font sizes for consistency
const FONT_SIZE_TITLE = 26;
const FONT_SIZE_BODY = 11;
const FONT_SIZE_TABLE = 10;
const FONT_SIZE_DOCX_BODY = 24; // 12pt (half-points)
const FONT_SIZE_DOCX_TITLE = 36; // 18pt
const FONT_SIZE_DOCX_TABLE = 21; // 10.5pt

/**
 * Enhanced PDF Export using jsPDF and autoTable (Markdown Native)
 */
export async function exportToPDF(markdown: string, filename: string, title: string) {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const margin = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let yPosition = margin;

    const addPageIfNeeded = (spaceNeeded: number) => {
        if (yPosition + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    const cleanText = (text: any): string => {
        if (typeof text !== 'string') return '';
        return text.replace(/\*\*|\*/g, '').trim();
    };

    const preProcessedContent = markdown.replace(/(\n---\n|\n\*\*\*\n)/g, '\n');
    const tokens = marked.lexer(preProcessedContent);

    // Add Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SIZE_TITLE);
    doc.setTextColor(HEADING_COLOR);
    doc.text(title, margin, yPosition);
    yPosition += 18;

    tokens.forEach((token: any) => {
        addPageIfNeeded(12);

        switch (token.type) {
            case 'heading':
                doc.setFont('helvetica', 'bold');
                const fontSize = Math.max(12, 22 - (token.depth * 2));
                doc.setFontSize(fontSize);
                doc.setTextColor(HEADING_COLOR);
                const hLines = doc.splitTextToSize(cleanText(token.text), contentWidth);
                doc.text(hLines, margin, yPosition);
                yPosition += (hLines.length * (fontSize * 0.5)) + 6;
                break;

            case 'paragraph':
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(FONT_SIZE_BODY);
                doc.setTextColor(TEXT_COLOR);
                const pLines = doc.splitTextToSize(cleanText(token.text), contentWidth);
                doc.text(pLines, margin, yPosition);
                yPosition += (pLines.length * 5.5) + 5;
                break;

            case 'list':
                token.items.forEach((item: any) => {
                    addPageIfNeeded(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(FONT_SIZE_BODY);
                    doc.setTextColor(TEXT_COLOR);
                    const bullet = '• ';
                    const iLines = doc.splitTextToSize(cleanText(item.text), contentWidth - 8);
                    doc.text(bullet, margin, yPosition);
                    doc.text(iLines, margin + 5, yPosition);
                    yPosition += (iLines.length * 5.5) + 3;
                });
                yPosition += 4;
                break;

            case 'table':
                const head = [token.header.map((h: any) => cleanText(h.text))];
                const body = token.rows.map((row: any[]) => row.map((cell: any) => cleanText(cell.text)));

                autoTable(doc, {
                    head: head,
                    body: body,
                    startY: yPosition,
                    theme: 'grid',
                    margin: { left: margin, right: margin },
                    styles: {
                        fontSize: FONT_SIZE_TABLE,
                        textColor: TEXT_COLOR,
                        cellPadding: 4,
                        lineColor: BORDER_COLOR,
                        lineWidth: 0.1,
                    },
                    headStyles: {
                        fillColor: '#F3F4F6',
                        textColor: HEADING_COLOR,
                        fontStyle: 'bold',
                    },
                    didDrawPage: (data) => {
                        yPosition = data.cursor?.y || yPosition;
                    }
                });
                yPosition = (doc as any).lastAutoTable.finalY + 12;
                break;

            case 'hr':
                doc.setDrawColor(BORDER_COLOR);
                doc.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 12;
                break;

            default:
                break;
        }
    });

    doc.save(`${filename}.pdf`);
    return true;
}

/**
 * Enhanced DOCX Export incorporating the requested structured approach
 */
export async function exportToDocx(markdown: string, filename: string, title: string) {
    try {
        const tokens = marked.lexer(markdown);
        const docChildren: any[] = [];

        // Title/Header (similar to requested approach)
        docChildren.push(
            new Paragraph({
                children: [new TextRun({ text: title, bold: true, size: FONT_SIZE_DOCX_TITLE })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400, before: 200 }
            })
        );

        tokens.forEach((token: any) => {
            switch (token.type) {
                case 'heading':
                    docChildren.push(
                        new Paragraph({
                            children: parseInlineFormatting(token.text, true),
                            heading: getHeadingLevel(token.depth),
                            spacing: { before: 280, after: 140 },
                        })
                    );
                    break;

                case 'paragraph':
                    docChildren.push(
                        new Paragraph({
                            children: parseInlineFormatting(token.text),
                            spacing: { after: 180 },
                        })
                    );
                    break;

                case 'list':
                    token.items.forEach((item: any) => {
                        docChildren.push(
                            new Paragraph({
                                children: parseInlineFormatting(item.text),
                                bullet: { level: 0 },
                                spacing: { after: 100 },
                            })
                        );
                    });
                    break;

                case 'table':
                    const headerRow = new TableRow({
                        children: token.header.map((h: any) => 
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [new TextRun({ text: cleanText(h.text), bold: true, size: FONT_SIZE_DOCX_TABLE })],
                                        alignment: AlignmentType.CENTER
                                    }),
                                ],
                                shading: { fill: 'F3F4F6' },
                                verticalAlign: VerticalAlign.CENTER,
                            })
                        ),
                        tableHeader: true,
                    });

                    const bodyRows = token.rows.map((row: any[]) => 
                        new TableRow({
                            children: row.map((cell: any) => 
                                new TableCell({
                                    children: [new Paragraph({ children: parseInlineFormatting(cell.text, false, true) })],
                                    verticalAlign: VerticalAlign.CENTER,
                                })
                            ),
                        })
                    );

                    docChildren.push(
                        new Table({
                            rows: [headerRow, ...bodyRows],
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            layout: TableLayoutType.AUTOFIT,
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                                left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                                right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
                            },
                        })
                    );
                    docChildren.push(new Paragraph({ text: "", spacing: { after: 200 } }));
                    break;

                case 'space':
                    docChildren.push(new Paragraph({ text: "", spacing: { after: 140 } }));
                    break;

                case 'hr':
                    docChildren.push(new Paragraph({ 
                        border: { bottom: { color: "D1D5DB", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                        spacing: { after: 180, before: 180 }
                    }));
                    break;

                default:
                    if ('text' in token && token.text) {
                        docChildren.push(
                            new Paragraph({
                                children: parseInlineFormatting(token.text),
                                spacing: { after: 180 },
                            })
                        );
                    }
                    break;
            }
        });

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE,
                        },
                    },
                },
                children: docChildren,
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${filename}.docx`);
        return true;
    } catch (error) {
        console.error('Error generating DOCX:', error);
        throw error;
    }
}

/**
 * Parses inline markdown like **bold**, __bold__, *italic*, _italic_ into docx TextRuns
 */
function parseInlineFormatting(text: string, isHeading: boolean = false, isTable: boolean = false): TextRun[] {
    const runs: TextRun[] = [];
    
    // Pattern for bold and italic
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let lastIndex = 0;
    let match;

    const baseSize = isHeading ? undefined : (isTable ? FONT_SIZE_DOCX_TABLE : FONT_SIZE_DOCX_BODY);

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            runs.push(new TextRun({
                text: text.substring(lastIndex, match.index),
                size: baseSize
            }));
        }

        const isBold = !!(match[1]);
        const content = isBold ? match[2] : match[4];

        runs.push(new TextRun({
            text: content,
            bold: isBold,
            italics: !isBold,
            size: baseSize
        }));

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        runs.push(new TextRun({
            text: text.substring(lastIndex),
            size: baseSize
        }));
    }

    return runs.length > 0 ? runs : [new TextRun({ text, size: baseSize })];
}

function getHeadingLevel(depth: number): any {
    switch (depth) {
        case 1: return HeadingLevel.HEADING_1;
        case 2: return HeadingLevel.HEADING_2;
        case 3: return HeadingLevel.HEADING_3;
        case 4: return HeadingLevel.HEADING_4;
        default: return HeadingLevel.HEADING_5;
    }
}

function cleanText(text: string): string {
    return text.replace(/\*\*|\*/g, '').trim();
}
