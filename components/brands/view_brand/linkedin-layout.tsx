"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import linkedinData from "@/data/ayaz_socials/linkedin";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Edit, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";

interface LinkedInLayoutProps {
    onGenerateReport: () => void;
    ownerName: string;
    isBrand: boolean;
}

export default function LinkedInLayout({ onGenerateReport, ownerName, isBrand }: LinkedInLayoutProps) {
    const { brand, competitors } = linkedinData;
    const entity = isBrand ? brand : competitors.find((c: any) => c.name === ownerName);

    if (!entity || !entity.posts || entity.posts.length === 0 || entity.posts.some((p: any) => p.warning_code === 'no_posts')) {
        return (
            <Card>
                <CardContent className="p-4">
                    <p>No LinkedIn data available for {ownerName}.</p>
                </CardContent>
            </Card>
        );
    }

    const posts = entity.posts.filter((p: any) => !p.warning_code);
    const [showComments, setShowComments] = useState<Record<string, boolean>>({});

    const toggleComments = (postId: string) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    return (
        <div>
            <div className="pb-4">
                <div className="mt-4 flex justify-between items-start">
                    <h2 className="text-2xl font-bold">{entity.name}</h2>
                    <Button onClick={onGenerateReport}><FileText  />Generate Report</Button>
                </div>
            </div>
            <Separator />
            <div className="pt-4">
                <div className="space-y-4">
                    {posts.map((post: any) => (
                        <Card key={post.linkedin_post_id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarFallback>{entity.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{entity.name}</p>
                                            <Link href={post.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
                                                {new Date(post.date_posted).toLocaleDateString()}
                                                <LinkIcon className="size-3" />
                                            </Link>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem><Edit  />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500"><Trash2  />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <p className="mt-4 text-sm">{post.post_text}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {post.hashtags?.map((tag: any) => <span key={tag} className="text-xs text-blue-500 hover:underline cursor-pointer">#{tag}</span>)}
                                </div>
                                <div className="flex items-center space-x-2 mt-4 text-muted-foreground text-xs">
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{post.num_likes}</span>
                                    <span>·</span>
                                    <button onClick={() => toggleComments(post.linkedin_post_id)} className="hover:underline">
                                        {post.num_comments} comments
                                    </button>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid grid-cols-3 gap-1 text-center font-semibold text-muted-foreground text-sm">
                                    <Button variant="ghost" className="w-full"><ThumbsUp  /> Like</Button>
                                    <Button variant="ghost" className="w-full" onClick={() => toggleComments(post.linkedin_post_id)}><MessageSquare  /> Comment</Button>
                                    <Button variant="ghost" className="w-full"><Share2  /> Share</Button>
                                </div>
                                {showComments[post.linkedin_post_id] && (
                                    <div className="mt-4 space-y-3">
                                        {post.comments?.map((comment: any, index: any) => (
                                            <div key={index} className="text-xs bg-muted p-2 rounded-lg">
                                                {comment}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
