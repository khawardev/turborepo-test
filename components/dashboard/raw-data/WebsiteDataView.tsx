'use client'

import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from 'sonner';
import { cleanAndFlattenBullets } from '@/lib/cleanMarkdown';

export default function WebsiteDataView({ scrapedData }: any) {
    const pages = scrapedData?.pages || [];
    const [selectedPage, setSelectedPage] = useState<any>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (pages.length > 0) {
            setSelectedPage(pages[0]);
        } else {
            setSelectedPage(null);
        }
    }, [scrapedData]);

    if (pages.length === 0) {
        return (
            <Card className=" text-center p-8 text-muted-foreground h-[70vh] flex items-center justify-center">
                No website data available.
            </Card>
        );
    }

    const handleCopy = () => {
        if (selectedPage?.content) {
            navigator.clipboard.writeText(selectedPage.content).then(() => {
                setIsCopied(true);
                toast.success('Content copied to clipboard');
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    };

    if (!selectedPage) {
        return (
            <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
                    Loading page content...
            </div>
        );
    }

    return (
        <div className="flex h-[70vh] ">
            <ScrollArea className="h-screen w-1/4 border-r">
                <div className="p-2">
                    <h5 className="px-2 py-2 text-xs font-semibold text-muted-foreground tracking-tight">RAW DATA</h5>
                    <ul className="space-y-1">
                        {pages.map((page: any) => (
                            <li key={page.url}>
                                <Button
                                    variant={selectedPage.url === page.url ? 'outline' : 'ghost'}
                                    className="w-full justify-start font-normal h-9 text-left"
                                    onClick={() => setSelectedPage(page)}
                                >
                                    <span className="truncate">{new URL(page.url).pathname}</span>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </ScrollArea>

            <CardContent className=" space-y-4 w-full">
                <div className='w-full flex items-center justify-between'>
                    <Link href={selectedPage?.url} target='_blank' className="text-sm text-muted-foreground truncate max-w-[500px]">
                        {selectedPage?.url ? selectedPage.url : 'No URL available'}
                    </Link>
                    <Button variant={'outline'} onClick={handleCopy}>
                        <Copy />
                        {isCopied ? "Copied!" : "Copy"}
                    </Button>
                </div>
                <Separator />
                
                <ScrollArea className="h-[65vh] w-full">
                    <div className="prose prose-neutral max-w-none markdown-body space-y-3 dark:prose-invert">
                     
                        <div className="prose prose-neutral max-w-none markdown-body  dark:prose-invert">
                            <ReactMarkdown components={{
                                img: ({ node, ...props }) => {
                                    if (!props.src) return null
                                    return <img {...props} alt={props.alt || ""} />
                                },
                            }} remarkPlugins={[remarkGfm]}>
                                {cleanAndFlattenBullets(selectedPage?.content)}
                            </ReactMarkdown>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </div>
    );
}