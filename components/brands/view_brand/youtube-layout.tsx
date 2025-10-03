"use client"
import { Card, CardContent } from "@/components/ui/card";
import youtubeData from "@/data/ayaz_socials/youtube.json";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { MoreVertical, Edit, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";

interface YouTubeLayoutProps {
    onGenerateReport: () => void;
    ownerName: string;
    isBrand: boolean;
}

export default function YouTubeLayout({ onGenerateReport, ownerName, isBrand }: YouTubeLayoutProps) {
    const { brand, competitors } = youtubeData;
    
    const posts = isBrand ? brand.posts : competitors.flatMap(c => c.posts.filter(p => !p.warning_code));

    if (!posts || posts.length === 0 || (Array.isArray(posts) && posts.some((p: any) => p.warning_code === 'no_posts'))) {
         return (
            <Card>
                <CardContent className="p-4">
                    <p>No YouTube data available for {ownerName}.</p>
                </CardContent>
            </Card>
        );
    }

    const [showTranscript, setShowTranscript] = useState<Record<string, boolean>>({});

    const toggleTranscript = (postId: string) => {
        setShowTranscript(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar>
                        <AvatarFallback>{ownerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{ownerName}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button onClick={onGenerateReport}><FileText className="mr-2 h-4 w-4" />Generate Report</Button>
                    </div>
                </div>
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Videos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posts.map((video:any) => (
                            <div key={video.youtube_post_id}>
                                <div className="relative aspect-video bg-muted rounded-lg">
                                    {/* Placeholder for video thumbnail */}
                                </div>
                                <div className="mt-2 flex justify-between">
                                    <div>
                                        <Link href={video.url} target="_blank" rel="noreferrer" className="font-semibold hover:underline inline-flex items-center gap-1">
                                            {video.title}
                                            <LinkIcon className="size-3" />
                                        </Link>
                                        <p className="text-sm text-muted-foreground mt-1">{video.views} views · {new Date(video.date_posted).toLocaleDateString()}</p>
                                        <p className="text-xs mt-2 line-clamp-2">{video.description}</p>
                                        {video.transcript && (
                                            <Button variant="link" size="sm" className="px-0" onClick={() => toggleTranscript(video.youtube_post_id)}>
                                                {showTranscript[video.youtube_post_id] ? "Hide" : "Show"} Transcript
                                            </Button>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                {showTranscript[video.youtube_post_id] && (
                                    <div className="mt-2 text-xs bg-muted p-2 rounded-lg max-h-28 overflow-y-auto">
                                        {video.transcript}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
