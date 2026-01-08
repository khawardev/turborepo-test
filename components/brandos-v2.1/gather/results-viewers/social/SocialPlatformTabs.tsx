import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Share2 } from 'lucide-react';
import { getPlatformIcon } from '../shared/PlatformIcon';
import { SocialPlatformProfile } from './SocialPlatformProfile';
import { SocialPostsList } from './SocialPostsList';
import { SocialPostDetail } from './SocialPostDetail';

interface SocialPlatformTabsProps {
    platforms: any[];
    selectedPlatform: string | null;
    onPlatformSelect: (platform: string) => void;
    selectedPost: any | null;
    onPostSelect: (post: any) => void;
    rawData?: any;
}

export function SocialPlatformTabs({
    platforms,
    selectedPlatform,
    onPlatformSelect,
    selectedPost,
    onPostSelect,
    rawData
}: SocialPlatformTabsProps) {
    if (!platforms || platforms.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No social platforms data available for this source.</p>
                {rawData?.social_platforms?.length > 0 && (
                    <p className="text-sm mt-2">
                        ({rawData.social_platforms.length} platform(s) available but filtered out based on brand configuration)
                    </p>
                )}
            </div>
        );
    }

    return (
        <Tabs value={selectedPlatform || ''} onValueChange={onPlatformSelect} className="w-full">
            <TabsList className="gap-2 bg-transparent p-0">
                {platforms.map((platform: any) => (
                    <TabsTrigger 
                        key={platform.platform} 
                        value={platform.platform}
                    >
                        {getPlatformIcon(platform.platform)}
                        <span className="ml-2 capitalize">{platform.platform}</span>
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                            {platform.posts?.length || 0}
                        </Badge>
                    </TabsTrigger>
                ))}
            </TabsList>

            {platforms.map((platform: any) => (
                <TabsContent key={platform.platform} value={platform.platform} className="mt-6 space-y-6">
                    <SocialPlatformProfile platform={platform} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <SocialPostsList 
                            posts={platform.posts} 
                            selectedPost={selectedPost} 
                            onSelect={onPostSelect} 
                        />

                        <div className="lg:col-span-2">
                            <SocialPostDetail 
                                post={selectedPost} 
                                platformName={platform.platform}
                                pageUsername={platform.page_info?.username}
                            />
                        </div>
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
}
