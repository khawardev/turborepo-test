// src/lib/parse-markdown.ts

export interface ContentBlock {
    type: 'mainTitle' | 'sectionHeader' | 'paragraph' | 'question' | 'bulletedList' | 'footerLine';
    content: any;
}

interface QuestionContent {
    number: string;
    text: string;
    context: string;
}

export function parseQuestionnaireMarkdown(markdown: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    if (!markdown) return blocks;

    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i]?.trim() || '';

        // Skip horizontal rules and empty lines
        if (line === '---' || line === '') {
            i++;
            continue;
        }

        // Section Headers (###)
        if (line.startsWith('### ')) {
            // The first '###' is the main title
            const type = blocks.length === 0 ? 'mainTitle' : 'sectionHeader';
            blocks.push({ type, content: line.substring(4) });
            i++;
            continue;
        }

        // Questions (e.g., "1. Some question text...")
        const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (questionMatch) {
            const number = questionMatch[1];
            let text = questionMatch[2];
            let context = '';

            // Look ahead to the next line for multi-line text or context
            i++;
            while (i < lines.length && lines[i] && !lines[i].match(/^\d+\.\s/) && !lines[i].startsWith('###')) {
                const nextLine = lines[i].trim();
                if (nextLine.startsWith('**Context:**')) {
                    context = nextLine.replace(/\*\*Context:\*\*/, '').trim();
                } else if (nextLine) {
                    text += ` ${nextLine}`; // Append multi-line question text
                }
                i++;
            }

            blocks.push({ type: 'question', content: { number, text, context } as QuestionContent });
            continue;
        }

        // Bulleted Lists (-)
        if (line.startsWith('- ')) {
            const items = [];
            while (i < lines.length && lines[i]?.trim().startsWith('- ')) {
                items.push(lines[i].trim().substring(2));
                i++;
            }
            blocks.push({ type: 'bulletedList', content: items });
            continue;
        }

        // Footer Lines (**Label:** Value)
        const footerMatch = line.match(/^\*\*(.*?):\*\*\s*(.*)/);
        if (footerMatch) {
            blocks.push({ type: 'footerLine', content: { label: footerMatch[1], value: footerMatch[2] } });
            i++;
            continue;
        }

        // Paragraphs (anything else)
        blocks.push({ type: 'paragraph', content: line });
        i++;
    }

    return blocks;
}