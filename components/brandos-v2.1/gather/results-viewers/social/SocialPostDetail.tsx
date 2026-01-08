import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Copy, ExternalLink, Eye, Heart, MessageSquare, Share2, Youtube, ThumbsUp } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa6';
import NextLink from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatNumber, formatDuration } from '../utils';

interface SocialPostDetailProps {
    post: any | null;
    platformName: string;
    pageUsername?: string;
}

export function SocialPostDetail({ post, platformName, pageUsername }: SocialPostDetailProps) {
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        });
    };

    if (!post) {
        return (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a post to view details</p>
                </CardContent>
            </Card>
        );
    }

    // Normalizing content fields
    const contentText = post.description || post.text || post.message || post.full_text || post.caption || '';
    const images = post.image_urls || post.images || [];

    // Tag normalization helper
    const renderTags = (tags: any[]) => {
        return tags.map((tag: any, i: number) => {
            const label = typeof tag === 'string' ? tag : tag.hashtag || tag.tag;
            const href = typeof tag === 'object' && tag.link ? tag.link : null;

            const badge = (
                <Badge key={i} variant="outline" className="text-xs hover:bg-primary/10 cursor-pointer">
                    {href ? '' : '#'} {label}
                </Badge>
            );

            if (href) {
                return <NextLink key={i} href={href} target="_blank">{badge}</NextLink>;
            }
            return badge;
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-start justify-between gap-4">
                    <span>{post.title || 'Post Details'}</span>
                    {post.entity_type && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{post.entity_type}</Badge>
                    )}
                </CardTitle>
                {post.published_at && (
                    <p className="text-sm text-muted-foreground">
                        Published: {new Date(post.published_at).toLocaleString()}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">

                {/* 1. Media Section (Embeds / Images) */}
                {post.video_id && platformName === 'youtube' && (
                    <div className="rounded-lg overflow-hidden aspect-video bg-black/5">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${post.video_id}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {images && images.length > 0 && (
                    <div className={`grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {images.slice(0, 4).map((url: string, idx: number) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                <Image
                                    src={url}
                                    alt={`Post image ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. Engagement Stats */}
                {post.engagement && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Views */}
                        {(post.engagement.views !== undefined) && (
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xl font-bold">{formatNumber(post.engagement.views)}</p>
                                <p className="text-xs text-muted-foreground">Views</p>
                            </div>
                        )}

                        {/* Likes / Reactions */}
                        {(post.engagement.likes !== undefined || post.engagement.reactions !== undefined) && (
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                {post.engagement.reactions !== undefined ?
                                    <ThumbsUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" /> :
                                    <Heart className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                }
                                <p className="text-xl font-bold">{formatNumber(post.engagement.likes || post.engagement.reactions)}</p>
                                <p className="text-xs text-muted-foreground">{post.engagement.reactions !== undefined ? 'Reactions' : 'Likes'}</p>
                            </div>
                        )}

                        {/* Shares */}
                        {(post.engagement.shares !== undefined) && (
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <Share2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xl font-bold">{formatNumber(post.engagement.shares)}</p>
                                <p className="text-xs text-muted-foreground">Shares</p>
                            </div>
                        )}

                        {/* Comments */}
                        {(post.comments?.length !== undefined || post.engagement.comments !== undefined) && (
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <MessageSquare className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xl font-bold">{formatNumber(post.comments?.length || post.engagement.comments || 0)}</p>
                                <p className="text-xs text-muted-foreground">Comments</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Text Content */}
                {contentText && (
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium">Content</h5>
                        <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-sm refresh-text whitespace-pre-wrap wrap-break-word">{contentText}</p>
                        </div>
                    </div>
                )}

                {/* 4. Metadata (Duration, Type, Sound) */}
                {(post.video_id || post.duration_seconds || post.is_short !== undefined) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4">
                        {post.video_id && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Video ID</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs bg-muted px-2 py-1 rounded">{post.video_id}</code>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(post.video_id, 'Video ID')}>
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {post.duration_seconds !== undefined && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Duration</p>
                                <p className="font-medium">{formatDuration(post.duration_seconds)}</p>
                            </div>
                        )}
                        {post.is_short !== undefined && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Type</p>
                                <Badge variant={post.is_short ? "destructive" : "secondary"}>
                                    {post.is_short ? 'Short' : 'Video'}
                                </Badge>
                            </div>
                        )}
                    </div>
                )}

                {post.sound && (
                    <div className="space-y-2 pt-2 border-t">
                        <h5 className="text-sm font-medium flex items-center gap-2">🎵 Sound</h5>
                        <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <p className="font-medium">{post.sound.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {post.sound.is_original ? 'Original Sound' : 'Licensed Sound'}
                                </p>
                            </div>
                            <Badge variant={post.sound.is_original ? "default" : "secondary"}>
                                {post.sound.is_original ? 'Original' : 'Non-Original'}
                            </Badge>
                        </div>
                    </div>
                )}

                {/* 5. Tags & Hashtags */}
                {(post.hashtags?.length > 0 || post.tags?.length > 0) && (
                    <div className="space-y-3 pt-4 border-t">
                        {post.hashtags?.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Hashtags</p>
                                <div className="flex flex-wrap gap-2">
                                    {renderTags(post.hashtags)}
                                </div>
                            </div>
                        )}
                        {post.tags?.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {renderTags(post.tags)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. Collapsible Details (Transcript, Playlists, Comments) */}

                {/* Transcript */}
                {post.transcript && (
                    <Collapsible className="space-y-2">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
                                <span className="text-sm font-medium flex items-center gap-2">📝 Transcript</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <ScrollArea className="h-[200px] bg-muted/30 rounded-lg p-4">
                                <p className="text-sm whitespace-pre-wrap">{post.transcript}</p>
                            </ScrollArea>
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* Playlists */}
                {post.playlists && post.playlists.length > 0 && (
                    <Collapsible className="space-y-2">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
                                <span className="text-sm font-medium flex items-center gap-2">📁 Playlists ({post.playlists.length})</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-2 p-2">
                                    {post.playlists.map((pl: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                                            <div>
                                                <p className="text-sm font-medium">{pl.title}</p>
                                                <p className="text-xs text-muted-foreground">{pl.video_count} videos</p>
                                            </div>
                                            <code className="text-[10px] bg-muted px-1 rounded">{pl.playlist_id}</code>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                    <Collapsible className="space-y-2">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
                                <span className="text-sm font-medium flex items-center gap-2">💬 Recent Comments ({post.comments.length})</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-2 p-2">
                                    {post.comments.map((comment: string, i: number) => (
                                        <div key={i} className="bg-muted/30 rounded-lg p-3">
                                            <p className="text-sm">{comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* 7. Footer Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {post.scraped_profile_url && (
                        <Button variant="outline" size="sm" asChild>
                            <NextLink href={post.scraped_profile_url} target="_blank">
                                <ExternalLink className="w-3 h-3 " />
                                View Profile
                            </NextLink>
                        </Button>
                    )}
                    {post.scraped_channel_url && (
                        <Button variant="outline" size="sm" asChild>
                            <NextLink href={post.scraped_channel_url} target="_blank">
                                <ExternalLink className="w-3 h-3 " />
                                View Channel
                            </NextLink>
                        </Button>
                    )}
                    {post.scraped_company_url && (
                        <Button variant="outline" size="sm" asChild>
                            <NextLink href={post.scraped_company_url} target="_blank">
                                <ExternalLink className="w-3 h-3 " />
                                View Company
                            </NextLink>
                        </Button>
                    )}
                    {post.scraped_page_url && (
                        <Button variant="outline" size="sm" asChild>
                            <NextLink href={post.scraped_page_url} target="_blank">
                                <ExternalLink className="w-3 h-3 " />
                                View Page
                            </NextLink>
                        </Button>
                    )}
                    {post.video_id && platformName === 'youtube' && (
                        <Button variant="outline" size="sm" asChild>
                            <NextLink href={`https://www.youtube.com/watch?v=${post.video_id}`} target="_blank">
                                <Youtube className="w-3 h-3 " />
                                Watch on YouTube
                            </NextLink>
                        </Button>
                    )}
                    {post.video_id && platformName === 'tiktok' && pageUsername && (
                        <Button variant="outline" size="sm" asChild>
                            <NextLink href={`https://www.tiktok.com/@${pageUsername}/video/${post.video_id}`} target="_blank">
                                <FaTiktok className="w-3 h-3 " />
                                Watch on TikTok
                            </NextLink>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
