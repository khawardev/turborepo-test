'use client'

import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from 'sonner';
import { cleanAndFlattenBulletsGoogle } from '@/lib/cleanMarkdown';
export default function WebsiteDataView({ data }: any) {
    const [selectedPage, setSelectedPage] = useState(data?.brand?.pages?.[0]);
    const [isCopied, setIsCopied] = useState(false);

    if (!data || !data.brand?.pages || data.brand.pages.length === 0) {
        return (
            <Card className="mt-6 border-dashed border-2 text-center p-8 text-muted-foreground h-[70vh] flex items-center justify-center">
                No website data available.
            </Card>
        );
    }

    const handleCopy = () => {
        if (selectedPage?.content) {
            navigator.clipboard.writeText(selectedPage.content).then(() => {
                setIsCopied(true);
                toast.success('Content Copied to Clipboard')
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    };

    return (
        <div className="flex h-[70vh]">
            <ScrollArea className="h-screen w-1/4 border-r">
                <div className="py-3">
                    <h5 className="px-3 py-2 text-xs font-semibold text-muted-foreground">BRAND</h5>
                    <ul className="space-y-1">
                        {data.brand.pages.map((page: any) => (
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
                    {data.competitors?.map((competitor: any) => (
                        competitor.pages && competitor.pages.length > 0 && (
                            <div key={competitor.competitor_id} className="mt-4">
                                <h5 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                    {competitor.name}
                                </h5>
                                <ul className="space-y-1">
                                    {competitor.pages.map((page: any) => (
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
                        )
                    ))}
                </div>
            </ScrollArea>

            <CardContent className=" space-y-4">
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
                <ScrollArea className="h-full w-full">
                    <div className="prose prose-neutral max-w-none markdown-body space-y-3 dark:prose-invert">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                img: ({ node, ...props }) => {
                                    if (!props.src) return null
                                    return <img {...props} alt={props.alt || ""} />
                                },
                            }}
                        >
                            {cleanAndFlattenBulletsGoogle(selectedPage?.content)}
                        </ReactMarkdown>
                    </div>
                </ScrollArea>
            </CardContent>
        </div>
    );
}