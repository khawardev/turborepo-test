import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { formatNumber, formatDuration } from '../utils';

interface SocialPostsListProps {
    posts: any[];
    selectedPost: any | null;
    onSelect: (post: any) => void;
}

export function SocialPostsList({ posts, selectedPost, onSelect }: SocialPostsListProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="lg:col-span-1">
            <div className="sticky top-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Posts ({posts.length})
                </h4>
                <ScrollArea className="h-[60vh] border rounded-lg">
                    <div className="p-2 space-y-2">
                        {posts.map((post: any, idx: number) => {
                            const displayText = post.title || post.description || post.message || post.text || post.full_text || post.caption || 'Untitled Post';
                            const hasImages = (post.image_urls && post.image_urls.length > 0) || (post.images && post.images.length > 0);
                            const thumbnail = post.video_id 
                                ? `https://img.youtube.com/vi/${post.video_id}/default.jpg` 
                                : hasImages ? (post.image_urls?.[0] || post.images?.[0]) : null;
                            
                            const likes = post.engagement?.likes ?? post.engagement?.reactions ?? 0;
                            const views = post.engagement?.views;
                            const comments = post.comments?.length ?? post.engagement?.comments ?? 0;

                            return (
                                <Button
                                    key={post.SK || post.video_id || idx}
                                    variant={selectedPost?.SK === post.SK || selectedPost?.video_id === post.video_id ? "secondary" : "ghost"}
                                    className="w-full justify-start h-auto py-3 px-3 text-left items-start gap-3 whitespace-normal"
                                    onClick={() => onSelect(post)}
                                >
                                    <div className="flex items-center gap-2 absolute top-2 right-2">
                                         <Badge variant="outline" className="text-[9px] h-4 px-1">
                                            #{idx + 1}
                                        </Badge>
                                    </div>

                                    {thumbnail && (
                                        <div className="w-16 h-12 shrink-0 rounded overflow-hidden bg-muted mt-1">
                                            <img src={thumbnail} alt="thumb" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="w-full min-w-0 space-y-1.5">
                                        <div className="pr-8">
                                            <p className="text-xs font-medium line-clamp-2 leading-snug">
                                                {displayText}
                                            </p>
                                        </div>
                                        
                                        {post.published_at && (
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(post.published_at).toLocaleDateString()}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                                            {views !== undefined && (
                                                <span className="flex items-center gap-1" title="Views">
                                                    <Eye className="w-3 h-3" />
                                                    {formatNumber(views)}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1" title="Likes/Reactions">
                                                <Heart className="w-3 h-3" />
                                                {formatNumber(likes)}
                                            </span>
                                            {comments > 0 && (
                                                <span className="flex items-center gap-1" title="Comments">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {formatNumber(comments)}
                                                </span>
                                            )}
                                            {post.is_short && (
                                                <Badge variant="destructive" className="text-[8px] h-3 px-1 py-0" style={{ fontSize: '8px' }}>Short</Badge>
                                            )}
                                        </div>
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
