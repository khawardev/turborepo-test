import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPathname } from '../utils';
import { WebsitePage } from '../types';

interface WebsitePageListProps {
    pages: WebsitePage[];
    selectedPage: WebsitePage | null;
    onSelect: (page: WebsitePage) => void;
}

export function WebsitePageList({ pages, selectedPage, onSelect }: WebsitePageListProps) {
    return (
        <ScrollArea className="h-[70vh] col-span-1 min-w-0 border rounded-lg p-2">
            <h5 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Captured Pages ({pages.length})
            </h5>
            <ul className="space-y-1">
                {pages.map((page, index) => (
                    <li key={index}>
                        <Button
                            variant={selectedPage?.url === page.url ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start font-normal h-9 text-left"
                            onClick={() => onSelect(page)}
                        >
                            <span className="truncate">{getPathname(page.url)}</span>
                        </Button>
                    </li>
                ))}
            </ul>
        </ScrollArea>
    );
}
