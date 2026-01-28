import PptxGenJS from 'pptxgenjs';
import { WebSynthesisExportData, WebSlideSection } from '@/lib/brandos-v2.1/markdownToWebSynthesisSlides';

const COLORS = {
    brandLime: '76ff03',
    brandDark: '222222',
    brandBlue: '0088cc',
    brandLight: 'f4f4f4',
    textMain: '333333',
    textLight: 'ffffff',
    textMuted: '888888',
    textGrey: 'aaaaaa',
    greyBox: 'e0e0e0',
    implicationBox: 'e6f7ff',
    implicationBorder: '0088cc',
    white: 'ffffff',
    black: '000000',
    tableBorder: '000000',
    headerLine: 'dddddd',
};

const FONTS = {
    main: 'Arial',
};

const SLIDE = {
    width: 10,
    height: 5.625,
    marginLeft: 0.5,
    marginRight: 0.5,
    marginTop: 0.7,
    contentWidth: 9,
    footerY: 5.3,
};

function cleanText(text: string): string {
    if (!text) return '';
    return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

function addSlideHeader(slide: any, isDark: boolean = false) {
    const logoColor = isDark ? COLORS.textLight : COLORS.black;
    slide.addText('⬡', { x: 0.3, y: 0.12, w: 0.3, h: 0.35, fontSize: 20, color: logoColor, fontFace: FONTS.main });
    slide.addText('Humanbrand AI', { x: 0.55, y: 0.18, w: 1.5, h: 0.25, fontSize: 12, bold: true, color: logoColor, fontFace: FONTS.main });
}

function addSlideFooter(slide: any) {
    const year = new Date().getFullYear();
    slide.addText(`©${year} Humanbrand AI LLC`, { x: 7.5, y: SLIDE.footerY, w: 2.2, h: 0.25, fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.main, align: 'right' });
}

function createTitleSlide(pptx: PptxGenJS, exportData: WebSynthesisExportData) {
    const slide = pptx.addSlide({ masterName: 'TITLE_SLIDE' });
    addSlideHeader(slide, true);

    slide.addText(exportData.title.toUpperCase(), {
        x: SLIDE.marginLeft, y: 1.5, w: 9, h: 1.5,
        fontSize: 44, bold: true, color: COLORS.textLight, fontFace: FONTS.main, valign: 'middle'
    });

    slide.addText(`Prepared by: ${exportData.prepared_by}`, {
        x: SLIDE.marginLeft, y: 3.2, w: 9, h: 0.4,
        fontSize: 24, color: COLORS.brandLime, fontFace: FONTS.main
    });
    
    slide.addText(exportData.analysis_date, {
        x: SLIDE.marginLeft, y: 3.7, w: 9, h: 0.4,
        fontSize: 18, color: COLORS.textGrey, fontFace: FONTS.main
    });

    slide.addText('An Outside-In Analysis of publicly available digital content', {
        x: SLIDE.marginLeft, y: 4.5, w: 9, h: 0.4,
        fontSize: 14, color: COLORS.textGrey, fontFace: FONTS.main, italic: true
    });

    addSlideFooter(slide);
}

function createSectionDividerSlide(pptx: PptxGenJS, title: string) {
    const slide = pptx.addSlide({ masterName: 'SECTION_DIVIDER' });
    slide.addText(title.toUpperCase(), {
        x: 0, y: 0, w: '100%', h: '100%',
        fontSize: 48, bold: true, color: COLORS.brandDark, fontFace: FONTS.main,
        align: 'center', valign: 'middle'
    });
    addSlideFooter(slide);
}

function createTextSlide(pptx: PptxGenJS, title: string, content: string, bullets?: string[]) {
    const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    addSlideHeader(slide, false);

    slide.addText(title.toUpperCase(), {
        x: SLIDE.marginLeft, y: 0.6, w: 9, h: 0.6,
        fontSize: 32, bold: true, color: COLORS.brandDark, fontFace: FONTS.main
    });

    let yPos = 1.4;

    if (content) {
        slide.addText(cleanText(content), {
            x: SLIDE.marginLeft, y: yPos, w: 9, h: 3.5,
            fontSize: 14, color: COLORS.textMain, fontFace: FONTS.main, valign: 'top'
        });
        yPos += 3.5; 
    }

    if (bullets && bullets.length > 0) {
        if (content) yPos = 3.5; 
        if (!content) yPos = 1.4;

        for (const bullet of bullets) {
            slide.addText(`• ${cleanText(bullet)}`, {
                x: SLIDE.marginLeft + 0.2, y: yPos, w: 8.5, h: 0.3,
                fontSize: 14, color: COLORS.textMain, fontFace: FONTS.main
            });
            yPos += 0.4;
        }
    }

    addSlideFooter(slide);
}

function createArchetypeSlide(pptx: PptxGenJS, section: WebSlideSection) {
    const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    addSlideHeader(slide, false);

    slide.addText(section.title.toUpperCase(), {
        x: SLIDE.marginLeft, y: 0.6, w: 9, h: 0.6,
        fontSize: 32, bold: true, color: COLORS.brandDark, fontFace: FONTS.main
    });
    
    if (section.content) {
         slide.addText(cleanText(section.content), {
            x: SLIDE.marginLeft, y: 1.3, w: 9, h: 1.0,
            fontSize: 12, italic: true, color: COLORS.textMain, fontFace: FONTS.main
        });
    }

    if (section.bullets && section.bullets.length > 0) {
        let xPos = 1.0;
        const width = 3.5;
        const yPos = 2.5;
        
        section.bullets.forEach((bullet, idx) => {
            if (idx > 1) return; 
            
            slide.addShape(pptx.ShapeType.roundRect, {
                x: xPos, y: yPos, w: width, h: 2.0,
                fill: { color: COLORS.brandBlue },
                rectRadius: 0.2
            });
            
            const text = cleanText(bullet);
            const parts = text.split(/[:\–\-\—]/);
            const label = parts[0]?.trim() || '';
            const value = parts.slice(1).join(':').trim() || text;

            slide.addText(label, {
                 x: xPos, y: yPos + 0.2, w: width, h: 0.4,
                 fontSize: 14, color: COLORS.textLight, fontFace: FONTS.main, align: 'center', bold: true
            });
            slide.addText(value, {
                 x: xPos + 0.2, y: yPos + 0.7, w: width - 0.4, h: 1.0,
                 fontSize: 20, color: COLORS.textLight, fontFace: FONTS.main, align: 'center', bold: true
            });

            xPos += width + 0.5;
        });
    }
    
    addSlideFooter(slide);
}

function createDetailedFindingSlide(pptx: PptxGenJS, section: WebSlideSection) {
    const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    addSlideHeader(slide, false);

    slide.addText(section.title.toUpperCase(), {
        x: SLIDE.marginLeft, y: 0.6, w: 8, h: 0.5,
        fontSize: 24, bold: true, color: COLORS.brandDark, fontFace: FONTS.main
    });
    
    if (section.subtitle) {
        slide.addText(section.subtitle, {
            x: SLIDE.marginLeft, y: 1.0, w: 8, h: 0.3,
            fontSize: 12, italic: true, color: COLORS.textMuted, fontFace: FONTS.main
        });
    }

    let yPos = section.subtitle ? 1.4 : 1.2;

    if (section.finding) {
        slide.addText('Synthesized Finding:', {
            x: SLIDE.marginLeft, y: yPos, w: 3, h: 0.3,
            fontSize: 11, bold: true, color: COLORS.brandBlue, fontFace: FONTS.main
        });
        const height = Math.min(1.2, Math.ceil(section.finding.length / 90) * 0.25 + 0.1);
        slide.addText(cleanText(section.finding), {
            x: SLIDE.marginLeft, y: yPos + 0.25, w: 9, h: height,
            fontSize: 14, bold: true, color: COLORS.black, fontFace: FONTS.main
        });
        yPos += height + 0.3;
    }

    if (section.rationale) {
        slide.addText('Deep Rationale:', {
            x: SLIDE.marginLeft, y: yPos, w: 3, h: 0.3,
            fontSize: 11, bold: true, color: COLORS.brandBlue, fontFace: FONTS.main
        });
        const height = Math.min(2.0, Math.ceil(section.rationale.length / 100) * 0.2 + 0.1);
        slide.addText(cleanText(section.rationale), {
            x: SLIDE.marginLeft, y: yPos + 0.25, w: 9, h: height,
            fontSize: 11, color: COLORS.textMain, fontFace: FONTS.main
        });
        yPos += height + 0.3;
    }

    if (section.implication) {
        const height = 1.2; 
        
        slide.addShape(pptx.ShapeType.rect, {
            x: SLIDE.marginLeft, y: yPos, w: 9, h: height,
            fill: { color: COLORS.greyBox },
        });

        slide.addText('Strategic Implication:', {
            x: SLIDE.marginLeft + 0.2, y: yPos + 0.1, w: 3, h: 0.2,
            fontSize: 10, bold: true, color: COLORS.brandBlue, fontFace: FONTS.main
        });
        
        slide.addText(cleanText(section.implication), {
            x: SLIDE.marginLeft + 0.2, y: yPos + 0.35, w: 8.6, h: height - 0.4,
            fontSize: 11, color: COLORS.brandDark, fontFace: FONTS.main
        });
    }
    
    addSlideFooter(slide);
}

function createTableSlide(pptx: PptxGenJS, section: WebSlideSection) {
    if (!section.table) return;

    const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    addSlideHeader(slide, false);

    slide.addText(section.title.toUpperCase(), {
        x: SLIDE.marginLeft, y: 0.6, w: 9, h: 0.6,
        fontSize: 26, bold: true, color: COLORS.black, fontFace: FONTS.main
    });

    const { headers, rows } = section.table;
    const tableData: any[][] = [];

    tableData.push(headers.map(h => ({
        text: h,
        options: { 
            fill: { color: COLORS.brandLime }, 
            color: COLORS.black, 
            bold: true, 
            fontSize: 12, 
            align: 'left',
            border: { type: 'solid', color: COLORS.black, pt: 1 }
        }
    })));

    const MAX_ROWS = 7; 
    const rowsToRender = rows.slice(0, MAX_ROWS);

    rowsToRender.forEach(row => {
        tableData.push(row.map((cell, i) => ({
            text: cleanText(cell),
            options: { 
                fill: { color: COLORS.white }, 
                color: COLORS.black,
                fontSize: 11,
                bold: i === 0, 
                border: { type: 'solid', color: COLORS.black, pt: 1 },
                valign: 'middle'
            }
        })));
    });

    slide.addTable(tableData, {
        x: SLIDE.marginLeft, y: 1.4, w: 9,
        border: { type: 'solid', pt: 1, color: COLORS.black },
        fontFace: FONTS.main
    });

    addSlideFooter(slide);
}

export function createWebSynthesisPresentation(exportData: WebSynthesisExportData): PptxGenJS {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    
    pptx.defineSlideMaster({
        title: 'TITLE_SLIDE',
        background: { color: COLORS.brandDark },
    });
    
    pptx.defineSlideMaster({
        title: 'SECTION_DIVIDER',
        background: { color: COLORS.brandLime },
    });
    
    pptx.defineSlideMaster({
        title: 'CONTENT_SLIDE',
        background: { color: COLORS.brandLight },
    });

    createTitleSlide(pptx, exportData);

    for (const section of exportData.sections) {
        switch (section.type) {
            case 'executive_summary':
            case 'intro':
            case 'synthesis_overview':
            case 'conclusion':
            case 'narrative':
                createTextSlide(pptx, section.title, section.content || '');
                break;
            case 'corpus_summary':
                createTextSlide(pptx, section.title, '', section.bullets);
                break;
            case 'section_header':
                createSectionDividerSlide(pptx, section.title);
                break;
            case 'detailed_finding':
            case 'generic_section':
                createDetailedFindingSlide(pptx, section);
                break;
            case 'archetype':
                createArchetypeSlide(pptx, section);
                break;
            case 'table_section':
                createTableSlide(pptx, section);
                break;
            case 'platform_table':
                createTableSlide(pptx, section);
                break;
        }
    }

    return pptx;
}

export async function generateWebSynthesisPPTX(exportData: WebSynthesisExportData): Promise<Buffer> {
    const pptx = createWebSynthesisPresentation(exportData);
    return await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
}
