

export function analyzeToken(content: string): number {
    return content.length;
}

export function splitContentByTokens(content: string, maxTokens: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += maxTokens) {
        const slice = content.slice(i, i + maxTokens);
        chunks.push(slice);
    }
    return chunks;
}