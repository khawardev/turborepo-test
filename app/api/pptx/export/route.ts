import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

interface SlideSection {
    type: string;
    title: string;
    subtitle?: string;
    content?: string;
    contentSections?: { heading: string; content: string; bullets?: string[] }[];
    table_data?: {
        headers: string[];
        rows: string[][];
    };
    metrics?: { label: string; value: string; notes?: string }[];
    items?: { 
        title?: string; 
        description: string; 
        targetAudience?: string;
        action?: string;
        expectedEffect?: string;
        confidence?: string;
    }[];
    bullet_points?: string[];
}

interface ExportData {
    title: string;
    entity_name: string;
    analysis_window: string;
    channel: string;
    sections: SlideSection[];
    raw_markdown: string;
    total_posts?: number;
    total_comments?: number;
}

const COLORS = {
    brandLime: '76ff03',
    brandDark: '222222',
    brandBlue: '0088cc',
    brandLight: 'ffffff',
    textMain: '333333',
    textLight: 'ffffff',
    textMuted: '888888',
    textGrey: 'aaaaaa',
    greyBox: 'e8e8e8',
    blueBox: '0088cc',
    white: 'ffffff',
    black: '000000',
    tableHeaderBg: '76ff03',
    tableBorder: '333333',
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
    headerY: 0.15,
    headerHeight: 0.4,
    footerY: 5.3,
    titleY: 0.9,
    contentStartY: 1.5,
    lineX: 0.35,
    lineEndX: 9.65,
};

function cleanText(text: string): string {
    if (!text) return '';
    return text
        .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/\[e:\d+[a-zA-Z]*\]/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .trim();
}

function truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    const cleaned = cleanText(text);
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength - 3) + '...';
}

function addSlideHeader(slide: any, isDark: boolean = false) {
    const logoColor = isDark ? COLORS.textLight : COLORS.black;
    
    slide.addText('⬡', {
        x: 0.3,
        y: 0.12,
        w: 0.3,
        h: 0.35,
        fontSize: 20,
        color: logoColor,
        fontFace: FONTS.main,
    });
    
    slide.addText('Humanbrand AI', {
        x: 0.55,
        y: 0.18,
        w: 1.5,
        h: 0.25,
        fontSize: 12,
        bold: true,
        color: logoColor,
        fontFace: FONTS.main,
    });

    if (!isDark) {
        slide.addShape('line' as any, {
            x: 0.25,
            y: 0.5,
            w: 0,
            h: 4.8,
            line: { color: COLORS.headerLine, width: 0.5 },
        });

        slide.addShape('line' as any, {
            x: 9.75,
            y: 0.5,
            w: 0,
            h: 4.8,
            line: { color: COLORS.headerLine, width: 0.5 },
        });
    }
}

function addSlideFooter(slide: any, pageNumber?: number) {
    slide.addText('©2026 Humanbrand AI LLC', {
        x: 7.5,
        y: SLIDE.footerY,
        w: 2.2,
        h: 0.25,
        fontSize: 9,
        color: COLORS.textMuted,
        fontFace: FONTS.main,
        align: 'right',
    });
}

function createTitleSlide(pptx: PptxGenJS, exportData: ExportData, entityName: string) {
    const slide = pptx.addSlide({ masterName: 'TITLE_SLIDE' });
    
    addSlideHeader(slide, true);
    
    // Auto-fit title text
    const titleSize = entityName.length > 20 ? 40 : 52;
    
    slide.addText(entityName.toUpperCase(), {
        x: SLIDE.marginLeft,
        y: 1.3,
        w: SLIDE.contentWidth,
        h: 0.9,
        fontSize: titleSize,
        bold: true,
        color: COLORS.textLight,
        fontFace: FONTS.main,
    });

    const subtitleLine1 = 'Outside-In Brand & Competitor Audit:';
    const subtitleLine2 = `${exportData.channel || 'Social Media'} Platforms`;
    
    slide.addText(`${subtitleLine1}\n${subtitleLine2}`, {
        x: SLIDE.marginLeft,
        y: 2.2,
        w: SLIDE.contentWidth,
        h: 0.9,
        fontSize: 28,
        color: COLORS.brandLime,
        fontFace: FONTS.main,
        lineSpacing: 36,
    });

    slide.addShape('line' as any, {
        x: SLIDE.marginLeft,
        y: 3.2,
        w: 3,
        h: 0,
        line: { color: COLORS.textMuted, width: 1 },
    });

    const dateText = exportData.analysis_window || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    slide.addText(dateText, {
        x: SLIDE.marginLeft,
        y: 3.35,
        w: SLIDE.contentWidth,
        h: 0.35,
        fontSize: 14,
        color: COLORS.textGrey,
        fontFace: FONTS.main,
    });

    slide.addShape('rect' as any, {
        x: 0,
        y: 4.4,
        w: SLIDE.width,
        h: 0.6,
        fill: { color: '1a1a1a' },
    });

    slide.addText('An Outside-In Analysis of publicly available digital content', {
        x: SLIDE.marginLeft,
        y: 4.5,
        w: SLIDE.contentWidth,
        h: 0.4,
        fontSize: 13,
        color: COLORS.textGrey,
        fontFace: FONTS.main,
    });

    addSlideFooter(slide);
}

function createSectionDivider(pptx: PptxGenJS, title: string) {
    const slide = pptx.addSlide({ masterName: 'SECTION_DIVIDER' });
    
    addSlideHeader(slide, false);
    
    const displayTitle = title.toUpperCase();
    const fontSize = displayTitle.length > 30 ? 36 : 48;
    
    slide.addText(displayTitle, {
        x: 0.5,
        y: 2.0,
        w: 9,
        h: 1.5,
        fontSize: fontSize,
        bold: true,
        color: COLORS.black,
        fontFace: FONTS.main,
        align: 'center',
        valign: 'middle',
    });
    
    addSlideFooter(slide);
}

function createContentSlideWithSections(
    pptx: PptxGenJS, 
    title: string, 
    contentSections: { heading: string; content: string; bullets?: string[] }[],
    entityName: string
) {
    const sectionsPerPage = 3;
    const totalPages = Math.ceil(contentSections.length / sectionsPerPage);

    for (let page = 0; page < totalPages; page++) {
        const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
        addSlideHeader(slide, false);

        const pageTitle = totalPages > 1 ? `${title.toUpperCase()} (${page + 1}/${totalPages})` : title.toUpperCase();

        slide.addText(pageTitle, {
            x: SLIDE.marginLeft + 0.2,
            y: 0.75,
            w: 8.6,
            h: 0.6,
            fontSize: 32,
            bold: true,
            color: COLORS.black,
            fontFace: FONTS.main,
            align: 'center',
        });

        let yPos = 1.5;
        const pageSections = contentSections.slice(page * sectionsPerPage, (page + 1) * sectionsPerPage);

        for (const section of pageSections) {
            slide.addText(section.heading, {
                x: SLIDE.marginLeft + 0.2,
                y: yPos,
                w: 8.6,
                h: 0.3,
                fontSize: 14,
                bold: true,
                color: COLORS.black,
                fontFace: FONTS.main,
            });
            yPos += 0.35;

            if (section.content && (!section.bullets || section.bullets.length === 0)) {
                // Approximate 90 chars per line, line height ~0.25
                const charCount = section.content.length;
                const lines = Math.ceil(charCount / 90);
                const height = Math.max(0.4, lines * 0.25);
                
                slide.addText(cleanText(section.content), {
                    x: SLIDE.marginLeft + 0.2,
                    y: yPos,
                    w: 8.6,
                    h: height,
                    fontSize: 12,
                    color: COLORS.textMain,
                    fontFace: FONTS.main,
                    breakLine: true,
                    autoFit: true, // Allow auto shrink if close to edge
                });
                yPos += height + 0.05;
            }

            if (section.bullets && section.bullets.length > 0) {
                for (const bullet of section.bullets) {
                    // Check if bullet fits
                    if (yPos > SLIDE.footerY - 0.5) break; // Simple safety check

                    slide.addText(`•  ${cleanText(bullet)}`, {
                        x: SLIDE.marginLeft + 0.5,
                        y: yPos,
                        w: 8.3,
                        h: 0.28,
                        fontSize: 11,
                        color: COLORS.textMain,
                        fontFace: FONTS.main,
                        autoFit: true,
                    });
                    yPos += 0.28;
                }
                yPos += 0.15;
            }
        }

        addSlideFooter(slide);
    }
}

function createFindingsSlide(
    pptx: PptxGenJS, 
    title: string, 
    mainHeading: string,
    content: string,
    bullets: string[],
) {
    const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    addSlideHeader(slide, false);
    
    slide.addText(title.toUpperCase(), {
        x: SLIDE.marginLeft + 0.2,
        y: 0.75,
        w: 8.6,
        h: 0.55,
        fontSize: 32,
        bold: true,
        color: COLORS.black,
        fontFace: FONTS.main,
    });

    let yPos = 1.45;

    slide.addText(mainHeading, {
        x: SLIDE.marginLeft + 0.2,
        y: yPos,
        w: 8.6,
        h: 0.3,
        fontSize: 14,
        bold: true,
        color: COLORS.black,
        fontFace: FONTS.main,
    });
    yPos += 0.35;

    if (content) {
         // Auto-calculate height roughly
         const lines = Math.ceil(content.length / 90);
         const height = Math.min(1.5, Math.max(0.5, lines * 0.25));

        slide.addText(cleanText(content), {
            x: SLIDE.marginLeft + 0.2,
            y: yPos,
            w: 8.6,
            h: height,
            fontSize: 11,
            color: COLORS.textMain,
            fontFace: FONTS.main,
            breakLine: true,
        });
        yPos += height + 0.1;
    }

    if (bullets.length > 0) {
        // Simple overflow handling: create new slide if too many bullets? 
        // For simplicity in this function, just print as many as possible with pagination logic being implicit or "max fit" for now.
        // But user asked for ALL content.
        
        let remainingBullets = [...bullets];
        while(remainingBullets.length > 0) {
             // If we filled the first slide, create a continuation
             if (yPos > SLIDE.footerY - 0.5) {
                 // Create new slide
                  const nextSlide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
                  addSlideHeader(nextSlide, false);
                  nextSlide.addText(`${title.toUpperCase()} (Cont.)`, {
                        x: SLIDE.marginLeft + 0.2,
                        y: 0.75,
                        w: 8.6,
                        h: 0.55,
                        fontSize: 32,
                        bold: true,
                        color: COLORS.black,
                        fontFace: FONTS.main,
                  });
                  yPos = 1.5;
                  
                  // Re-bind to current slide context if I could, but here I just loop.
                  // Refactoring loop slightly:
                  
                  for (const bullet of remainingBullets) {
                       if (yPos > SLIDE.footerY - 0.4) break; 
                       
                        nextSlide.addText(`•  ${cleanText(bullet)}`, {
                            x: SLIDE.marginLeft + 0.5,
                            y: yPos,
                            w: 8.3,
                            h: 0.25,
                            fontSize: 11,
                            bold: true,
                            color: COLORS.textMain,
                            fontFace: FONTS.main,
                        });
                        yPos += 0.28;
                        remainingBullets.shift(); // Remove processed
                  }
             } else {
                 // Print on current slide
                 const bullet = remainingBullets[0];
                 slide.addText(`•  ${cleanText(bullet)}`, {
                    x: SLIDE.marginLeft + 0.5,
                    y: yPos,
                    w: 8.3,
                    h: 0.25,
                    fontSize: 11,
                    bold: true,
                    color: COLORS.textMain,
                    fontFace: FONTS.main,
                });
                yPos += 0.28;
                remainingBullets.shift();
             }
        }
    }
    
    addSlideFooter(slide);
}

function createTableSlide(pptx: PptxGenJS, section: SlideSection, entityName: string) {
    if (!section.table_data) return;
    
    const { headers, rows } = section.table_data;
    const maxCols = 6; // Limit cols per slide to ensure readability
    const maxRowsPerSlide = 7; // As requested, maybe 7-8 rows fits well.
    
    const totalPages = Math.ceil(rows.length / maxRowsPerSlide);
    const tableWidth = 8.6;
    
    // Naively handle column overflow? User asked for rows mainly. 
    // If too many columns, maybe shrink font or simple truncation (tables are hard to wrap slides horizontally).
    // I will prioritize fitting columns by splitting width.
    const fitHeaders = headers.length > maxCols ? headers.slice(0, maxCols) : headers;
    const colW = tableWidth / fitHeaders.length;

    for (let page = 0; page < totalPages; page++) {
        const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
        addSlideHeader(slide, false);
        
        const titleText = totalPages > 1 
            ? `${section.title.toUpperCase()} (${page + 1}/${totalPages})` 
            : section.title.toUpperCase();

        slide.addText(titleText, {
            x: SLIDE.marginLeft + 0.2,
            y: 0.75,
            w: 8.6,
            h: 0.5,
            fontSize: 26,
            bold: true,
            color: COLORS.black,
            fontFace: FONTS.main,
        });

        const pageRows = rows.slice(page * maxRowsPerSlide, (page + 1) * maxRowsPerSlide);
        const tableData: any[][] = [];
        
        // Header
        tableData.push(fitHeaders.map(h => ({
            text: h, // No truncate
            options: { 
                bold: true, 
                fill: { color: COLORS.tableHeaderBg }, 
                color: COLORS.black,
                fontSize: 10,
                fontFace: FONTS.main,
                align: 'left',
                valign: 'middle',
            }
        })));

        // Rows
        for (let i = 0; i < pageRows.length; i++) {
            const row = pageRows[i];
            tableData.push(row.slice(0, fitHeaders.length).map((cell, idx) => ({
                text: cleanText(cell), // No truncate
                options: { 
                    fontSize: 9,
                    color: COLORS.textMain,
                    fontFace: FONTS.main,
                    fill: { color: idx === 0 ? COLORS.greyBox : COLORS.white },
                    bold: idx === 0,
                    align: 'left',
                    valign: 'top',
                }
            })));
        }

        slide.addTable(tableData, {
            x: SLIDE.marginLeft + 0.2,
            y: 1.35,
            w: tableWidth,
            colW: colW,
            border: { type: 'solid', pt: 0.75, color: COLORS.tableBorder },
            fontFace: FONTS.main,
            valign: 'middle',
            rowH: 0.5,
            autoPage: false // Handling manually
        });

        addSlideFooter(slide);
    }
}

function createRecommendationsSlide(pptx: PptxGenJS, section: SlideSection) {
    const items = section.items || [];
    const maxItemsPerSlide = 4; // Ensure full visibility
    const totalPages = Math.ceil(items.length / maxItemsPerSlide);

    for (let page = 0; page < totalPages; page++) {
        const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
        addSlideHeader(slide, false);
        
        const titleText = totalPages > 1 
            ? `STRATEGIC RECOMMENDATIONS (${page + 1}/${totalPages})`
            : 'STRATEGIC RECOMMENDATIONS';

        slide.addText(titleText, {
            x: SLIDE.marginLeft + 0.2,
            y: 0.75,
            w: 8.6,
            h: 0.5,
            fontSize: 28,
            bold: true,
            color: COLORS.black,
            fontFace: FONTS.main,
        });

        const pageItems = items.slice(page * maxItemsPerSlide, (page + 1) * maxItemsPerSlide);
        let yPos = 1.4;
        const cardHeight = 0.85; // slightly taller to fit content
        const gap = 0.15;

        for (let i = 0; i < pageItems.length; i++) {
            const item = pageItems[i];
            const itemIndex = (page * maxItemsPerSlide) + i + 1;
            
            slide.addShape('roundRect' as any, {
                x: SLIDE.marginLeft + 0.2,
                y: yPos,
                w: 8.6,
                h: cardHeight,
                fill: { color: COLORS.blueBox },
                rectRadius: 0.05,
            });

            const recTitle = item.title || item.description;
            slide.addText(`${itemIndex}. ${cleanText(recTitle)}`, {
                x: SLIDE.marginLeft + 0.35,
                y: yPos + 0.1,
                w: 8.3,
                h: 0.35,
                fontSize: 12,
                bold: true,
                color: COLORS.textLight,
                fontFace: FONTS.main,
                // autoFit: true
            });

            if (item.targetAudience || item.action) {
                const subText = item.targetAudience 
                    ? `Target: ${cleanText(item.targetAudience)}` 
                    : cleanText(item.action || '');
                
                slide.addText(subText, {
                    x: SLIDE.marginLeft + 0.35,
                    y: yPos + 0.45,
                    w: 6,
                    h: 0.3,
                    fontSize: 10,
                    color: 'cccccc',
                    fontFace: FONTS.main,
                });
            }

            if (item.confidence) {
                slide.addText(`Confidence: ${item.confidence}`, {
                    x: 7,
                    y: yPos + 0.45,
                    w: 2,
                    h: 0.3,
                    fontSize: 10,
                    color: 'cccccc',
                    fontFace: FONTS.main,
                    align: 'right',
                });
            }

            yPos += cardHeight + gap;
        }
        addSlideFooter(slide);
    }
}

function createMetricsSlide(pptx: PptxGenJS, section: SlideSection) {
    const metrics = section.metrics || [];
    const metricsPerSlide = 9; // 3x3 grid
    const totalPages = Math.ceil(metrics.length / metricsPerSlide);

    for (let page = 0; page < totalPages; page++) {
        const slide = pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
        addSlideHeader(slide, false);
        
        const titleText = totalPages > 1 
            ? `${section.title.toUpperCase()} (${page + 1}/${totalPages})`
            : section.title.toUpperCase();

        slide.addText(titleText, {
            x: SLIDE.marginLeft + 0.2,
            y: 0.75,
            w: 8.6,
            h: 0.5,
            fontSize: 26,
            bold: true,
            color: COLORS.black,
            fontFace: FONTS.main,
        });

        const pageMetrics = metrics.slice(page * metricsPerSlide, (page + 1) * metricsPerSlide);
        const metricsPerRow = 3;
        const cardWidth = 2.75;
        const cardHeight = 0.85;
        const gap = 0.15;
        
        let yPos = 1.4;
        
        for (let i = 0; i < pageMetrics.length; i++) {
            const metric = pageMetrics[i];
            const col = i % metricsPerRow;
            const row = Math.floor(i / metricsPerRow);
            const xPos = SLIDE.marginLeft + 0.2 + (col * (cardWidth + gap));
            const yOffset = yPos + (row * (cardHeight + gap));

            slide.addShape('rect' as any, {
                x: xPos,
                y: yOffset,
                w: cardWidth,
                h: cardHeight,
                fill: { color: COLORS.greyBox },
                line: { color: 'cccccc', width: 0.5 },
            });

            slide.addText(metric.value, {
                x: xPos,
                y: yOffset + 0.1,
                w: cardWidth,
                h: 0.4,
                fontSize: 16,
                bold: true,
                color: COLORS.brandDark,
                align: 'center',
                fontFace: FONTS.main,
            });

            slide.addText(metric.label, {
                x: xPos + 0.08,
                y: yOffset + 0.5,
                w: cardWidth - 0.16,
                h: 0.3,
                fontSize: 9,
                color: COLORS.textMuted,
                align: 'center',
                fontFace: FONTS.main,
            });
        }
        addSlideFooter(slide);
    }
}

function createThankYouSlide(pptx: PptxGenJS) {
    const slide = pptx.addSlide({ masterName: 'TITLE_SLIDE' });
    
    addSlideHeader(slide, true);
    
    slide.addText('THANK YOU\nFOR YOUR\nATTENTION.', {
        x: SLIDE.marginLeft,
        y: 1.4,
        w: SLIDE.contentWidth,
        h: 2.5,
        fontSize: 52,
        bold: true,
        color: COLORS.textLight,
        fontFace: FONTS.main,
        align: 'left',
        lineSpacing: 62,
    });

    slide.addShape('rect' as any, {
        x: 0,
        y: 4.4,
        w: SLIDE.width,
        h: 0.6,
        fill: { color: '1a1a1a' },
    });

    slide.addText(`Generated by BrandOS | ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })}`, {
        x: SLIDE.marginLeft,
        y: 4.5,
        w: SLIDE.contentWidth,
        h: 0.4,
        fontSize: 13,
        color: COLORS.textGrey,
        fontFace: FONTS.main,
    });

    addSlideFooter(slide);
}

function createPresentation(exportData: ExportData, entityName: string): PptxGenJS {
    const pptx = new PptxGenJS();

    pptx.author = 'BrandOS by Humanbrand AI';
    pptx.title = `${entityName} - ${exportData.channel || 'Social'} Audit Report`;
    pptx.subject = 'Social Media Audit Report';
    pptx.company = 'Humanbrand AI';
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

    createTitleSlide(pptx, exportData, entityName);

    // Standard Opening Slide
    createContentSlideWithSections(pptx, 'BRAND PERCEPTION & MARKET INTELLIGENCE', [
        { heading: 'Objective', content: 'Establish an outside-in perspective and a performance baseline of the brand and key competitors as it exists today.' },
        { heading: 'Key Questions Answered', content: '', bullets: [
            'How is the brand currently perceived in the market?',
            'Where does the brand sit in relation to key competitors?',
            'What meaning is being projected through existing content, for each brand?'
        ]},
        { heading: 'Scope of Analysis', content: '', bullets: [
            `All ${exportData.channel || 'social media'} content and 12-months of social media channels' content.`,
            'Equivalent web and social content for the selected key competitors.'
        ]},
        { heading: 'Core Outputs', content: '', bullets: [
            `Emergent brand identity for ${entityName} and selected key competitors.`,
            'Perception analysis: Whitespace, Gaps and Opportunities.'
        ]},
        { heading: 'Why it Matters', content: 'This phase replaces assumptions with evidence, creating a data-informed foundation for alignment.' }
    ], entityName);

    for (const section of exportData.sections) {
        if (section.type === 'title') continue;

        switch (section.type) {
            case 'section_header':
                createSectionDivider(pptx, section.title);
                break;
            case 'content_with_sections':
                if (section.contentSections) {
                    createContentSlideWithSections(pptx, section.title, section.contentSections, entityName);
                }
                break;
            case 'metrics':
                createMetricsSlide(pptx, section);
                break;
            case 'table':
                createTableSlide(pptx, section, entityName);
                break;
            case 'recommendations':
                createRecommendationsSlide(pptx, section);
                break;
            case 'content':
                if (section.bullet_points && section.bullet_points.length > 0) {
                    createFindingsSlide(
                        pptx,
                        section.title,
                        'Key Insights',
                        section.content || '',
                        section.bullet_points,
                    );
                } else if (section.content) {
                    createContentSlideWithSections(pptx, section.title, [
                        { heading: 'Overview', content: section.content }
                    ], entityName);
                }
                break;
            default:
                if (section.table_data) {
                    createTableSlide(pptx, section, entityName);
                } else if (section.metrics) {
                    createMetricsSlide(pptx, section);
                } else if (section.contentSections) {
                    createContentSlideWithSections(pptx, section.title, section.contentSections, entityName);
                } else if (section.content || section.bullet_points) {
                     if (section.bullet_points && section.bullet_points.length > 0) {
                        createFindingsSlide(
                            pptx,
                            section.title,
                            'Key Insights',
                            section.content || '',
                            section.bullet_points,
                        );
                    } else if (section.content) {
                        createContentSlideWithSections(pptx, section.title, [
                            { heading: 'Overview', content: section.content }
                        ], entityName);
                    }
                }
        }
    }

    createThankYouSlide(pptx);

    return pptx;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { entity_name, export_data } = body;

        if (!export_data || !entity_name) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: entity_name, export_data' },
                { status: 400 }
            );
        }

        const pptx = createPresentation(export_data, entity_name);
        
        const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
        const uint8Array = new Uint8Array(buffer);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const sanitizedName = entity_name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const channel = export_data.channel ? `_${export_data.channel}` : '';
        const filename = `${sanitizedName}${channel}_Audit_Report_${timestamp}.pptx`;

        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error('PPTX export error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create PowerPoint presentation' },
            { status: 500 }
        );
    }
}
