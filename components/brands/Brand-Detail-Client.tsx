"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { Brand, Competitor } from "@/types";
import { BulkCrawlData, ScrapedContent } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LinkIcon } from "lucide-react";

interface BrandDetailClientProps {
    brand: Brand;
    competitors: Competitor[];
    crawlData: BulkCrawlData;
}

interface SelectedContentState {
    ownerName: string;
    url: string;
    content: string;
}

export default function BrandDetailClient({ brand, competitors, crawlData }: BrandDetailClientProps) {
    const [selectedContent, setSelectedContent] = useState<SelectedContentState | null>(null);

    useEffect(() => {
        if (crawlData?.contents?.length > 0) {
            const firstContent = crawlData.contents[0];
            setSelectedContent({
                ownerName: brand.name,
                url: firstContent.url,
                content: firstContent.content,
            });
        }
    }, [brand.name, crawlData]);

    const handleSelectContent = (ownerName: string, content: ScrapedContent) => {
        setSelectedContent({
            ownerName,
            url: content.url,
            content: content.content,
        });
    };

    const getCompetitorName = (competitorId: string) => {
        return competitors.find(c => c.competitor_id === competitorId)?.name || "Unknown Competitor";
    };

    const getPagePath = (url: string) => {
        try {
            const path = new URL(url).pathname;
            return path;
        } catch (e) {
            return url;
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <aside className="md:col-span-1 space-y-4 sticky top-24">
                <Card>
                    <CardHeader>
                        <CardTitle>{brand.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start space-y-1">
                        {crawlData.contents.map((content) => (
                            <Button
                                key={content.url}
                                variant={selectedContent?.url === content.url ? "outline" : "ghost"}
                                className="w-full justify-start text-left h-auto"
                                onClick={() => handleSelectContent(brand.name, content)}
                            >
                                {getPagePath(content.url)}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
                {crawlData.competitors.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Competitors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {crawlData.competitors.map((compData) => (
                                <div key={compData.competitor_id}>
                                    <h4 className="font-semibold text-sm mb-2">{getCompetitorName(compData.competitor_id)}</h4>
                                    <div className="flex flex-col items-start space-y-1">
                                        {compData.contents.map((content) => (
                                            <Button
                                                key={content.url}
                                                variant={selectedContent?.url === content.url ? "outline" : "ghost"}
                                                className="w-full justify-start text-left h-auto"
                                                onClick={() => handleSelectContent(getCompetitorName(compData.competitor_id), content)}
                                            >
                                                {getPagePath(content.url)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </aside>
            <main className="md:col-span-3">
                <Card>
                    {selectedContent ? (
                        <>
                            <CardHeader>
                                <CardTitle className="capitalize">{selectedContent.ownerName}</CardTitle>
                                <CardDescription>
                                    <Link href={selectedContent.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                                        {selectedContent.url}
                                        <LinkIcon className="size-3" />
                                    </Link>
                                </CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6">
                                <div className="prose prose-neutral max-w-none markdown-body space-y-3 dark:prose-invert">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedContent.content}</ReactMarkdown>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-muted-foreground">Select a page from the left to view its content.</p>
                        </CardContent>
                    )}
                </Card>
            </main>
        </div>
    );
}