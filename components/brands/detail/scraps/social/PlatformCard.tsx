'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Instagram, Youtube } from 'lucide-react';
import PostItem from './PostItem';
import { FaFacebook, FaXTwitter } from 'react-icons/fa6';
import { BsLinkedin } from "react-icons/bs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case 'facebook':
            return <FaFacebook className="h-4 w-4" />;
        case 'instagram':
            return <Instagram className="h-4 w-4" />;
        case 'linkedin':
            return <BsLinkedin className="h-4 w-4" />;
        case 'x':
            return <FaXTwitter className="h-4 w-4" />;
        case 'youtube':
            return <Youtube className="h-4 w-4" />;
        default:
            return null;
    }
};

export default function PlatformCard({ platformData }: any) {
    const { platform, posts } = platformData;

    const uniquePosts = Array.from(new Map(posts.map((post: any) => [post.SK || post.post_id || post.youtube_post_id, post])).values());
    const hasError = uniquePosts.some((post: any) => post.error || post.warning)

    return (
        <div className=' flex flex-col space-y-6 px-0'>
            <CardHeader className='px-1'>
                <CardTitle>
                    <Badge>
                        {getPlatformIcon(platform)}
                        <span>{platform}</span>
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className='px-0'>
                {uniquePosts && uniquePosts.length > 0 ? (
                    <ScrollArea className={hasError ? "" : "h-[750px]"}>
                        <div className="flex flex-col space-y-4 w-full">
                            {uniquePosts.map((post: any, index: number) => (
                                <PostItem key={post.SK || index} post={post} />
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="p-4 border rounded-lg bg-border/50 space-y-2">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 mt-0.5 " />
                            <p>No posts were scraped for this platform during the specified period.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </div>
    );
}