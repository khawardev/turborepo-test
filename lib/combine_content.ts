export function combinePageContent(data: { pages: { url: string; content: string }[] }) {
    return data.pages.map(page => page.content).join(" ");
}