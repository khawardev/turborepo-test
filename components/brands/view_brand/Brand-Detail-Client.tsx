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
import TwitterLayout from "./twitter-layout";
import FacebookLayout from "./facebook-layout";
import InstagramLayout from "./instagram-layout";
import LinkedInLayout from "./linkedin-layout";
import YouTubeLayout from "./youtube-layout";
import ReportLayout from "./report-layout";

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

type SocialPlatform = "Twitter" | "Facebook" | "Instagram" | "LinkedIn" | "YouTube";
const socialPlatforms: SocialPlatform[] = ["Facebook", "Instagram", "LinkedIn", "Twitter", "YouTube"];

interface SelectedSocialState {
    ownerName: string;
    platform: SocialPlatform;
}

export default function BrandDetailClient({ brand, competitors, crawlData }: BrandDetailClientProps) {
    const [selectedContent, setSelectedContent] = useState<SelectedContentState | null>(null);
    const [selectedSocial, setSelectedSocial] = useState<SelectedSocialState | null>(null);
    const [currentView, setCurrentView] = useState<"website" | "social" | "report">("website");

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
        setCurrentView("website");
        setSelectedSocial(null);
    };

    const handleSelectSocial = (ownerName: string, platform: SocialPlatform) => {
        setSelectedSocial({ ownerName, platform });
        setCurrentView("social");
        setSelectedContent(null);
    };

    const handleGenerateReport = () => {
        setCurrentView("report");
    };

    const getCompetitorName = (competitorId: string) => {
        return competitors.find(c => c.competitor_id === competitorId)?.name || "Unknown Competitor";
    };

    const getPagePath = (url: string) => {
        try {
            return new URL(url).pathname;
        } catch (e) {
            return url;
        }
    }

    const renderSocialLayout = () => {
        if (!selectedSocial) return null;
        const isBrand = selectedSocial.ownerName === brand.name;
        const layoutProps = {
            onGenerateReport: handleGenerateReport,
            ownerName: selectedSocial.ownerName,
            isBrand: isBrand
        };
        switch (selectedSocial.platform) {
            case "Twitter":
                return <TwitterLayout {...layoutProps} />;
            case "Facebook":
                return <FacebookLayout {...layoutProps} />;
            case "Instagram":
                return <InstagramLayout {...layoutProps} />;
            case "LinkedIn":
                return <LinkedInLayout {...layoutProps} />;
            case "YouTube":
                return <YouTubeLayout {...layoutProps} />;
            default:
                return null;
        }
    };

    const SocialButtons = ({ ownerName }: { ownerName: string }) => (
        <div className="space-y-2">
            {socialPlatforms.map((platform) => (
                <Button
                    key={platform}
                    variant={selectedSocial?.platform === platform && selectedSocial?.ownerName === ownerName && currentView === "social" ? "outline" : "ghost"}
                    onClick={() => handleSelectSocial(ownerName, platform)}
                    className="w-full justify-start"
                >
                    {platform}
                </Button>
            ))}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <aside className="md:col-span-1 space-y-4 sticky top-24">
                <Card>
                    <CardHeader>
                        <CardTitle>{brand.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Website</h4>
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
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Social Media</h4>
                            <SocialButtons ownerName={brand.name} />
                        </div>
                    </CardContent>
                </Card>
                <CardTitle>Competitors</CardTitle>
                {crawlData.competitors.map((compData) => {
                    const competitorName = getCompetitorName(compData.competitor_id);
                    return (
                        <Card key={compData.competitor_id}>
                            <CardHeader>
                                <CardTitle>{competitorName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Website</h4>
                                    {compData.contents.map((content) => (
                                        <Button
                                            key={content.url}
                                            variant={selectedContent?.url === content.url ? "outline" : "ghost"}
                                            className="w-full justify-start text-left h-auto"
                                            onClick={() => handleSelectContent(competitorName, content)}
                                        >
                                            {getPagePath(content.url)}
                                        </Button>
                                    ))}
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Social Media</h4>
                                    <SocialButtons ownerName={competitorName} />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </aside>
            <main className="md:col-span-3">
                {currentView === "website" && (
                    <Card >
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
                                <CardContent >
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
                                            {selectedContent.content}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                            </>
                        ) : (
                            <CardContent className="h-96 flex items-center justify-center">
                                <p className="text-muted-foreground">Select a page from the left to view its content.</p>
                            </CardContent>
                        )}
                    </Card>
                )}
                {currentView === "social" && renderSocialLayout()}
                {currentView === "report" && selectedSocial && <ReportLayout platform={selectedSocial.platform} />}
            </main>
        </div>
    );
}