import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Edit, Trash2, FileText } from "lucide-react";
import Image from "next/image";
import { Button } from "../../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/dropdown-menu";
import { Textarea } from "../../../ui/textarea";
import { formatDistanceToNow } from 'date-fns';
import { facebookData } from "@/data/ayaz_socials/facebook";

interface FacebookLayoutProps {
    onGenerateReport: () => void;
    ownerName: string;
    isBrand: boolean;
}

export default function FacebookLayout({ onGenerateReport, ownerName, isBrand }: FacebookLayoutProps) {
    const entity = isBrand ? facebookData.brand : facebookData.competitors.find(c => c.name === ownerName);

    if (!entity || !entity.posts || entity.posts.length === 0) {
        return (
            <Card>
                <CardContent className="p-4">
                    <p>No Facebook data available for {ownerName}.</p>
                </CardContent>
            </Card>
        );
    }

    const { name, posts } = entity;

    const profile = {
        name: name,
        avatar: "/placeholder.svg",
        banner: "/placeholder.svg",
        category: "Company",
        likes: "N/A",
        followers: "N/A",
        about: `Official Facebook page for ${name}.`
    };

    return (
        <Card>
            <div className="relative h-48 md:h-80">
                <Image src={profile.banner} layout="fill" objectFit="cover" alt="Banner" className="rounded-t-lg" />
            </div>
            <div className="p-4 bg-card">
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-24 space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="w-32 h-32 border-4 border-background">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-sm text-muted-foreground">{profile.followers} followers · {profile.likes} likes</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button><ThumbsUp  /> Like</Button>
                        <Button variant="secondary">Follow</Button>
                        <Button onClick={onGenerateReport}><FileText  />Generate Report</Button>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold">About</h3>
                            <p className="text-sm mt-2">{profile.about}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex space-x-4">
                                <Avatar>
                                    <AvatarImage src={profile.avatar} />
                                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Textarea placeholder={`What's on your mind, ${profile.name}?`} className="flex-grow" />
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button>Post</Button>
                            </div>
                        </CardContent>
                    </Card>
                    {posts.map((post) => (
                        <Card key={post.post_id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={profile.avatar} />
                                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{profile.name}</p>
                                            <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(post.date_posted), { addSuffix: true })}</p>
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
                                <p className="mt-4">{post.content}</p>
                                {post.hashtags && post.hashtags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {post.hashtags.map(tag => <span key={tag} className="text-sm text-blue-500">#{tag}</span>)}
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-4 text-muted-foreground text-sm">
                                    <div className="flex items-center space-x-1">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{post.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>{post.num_comments} comments</span>
                                        <span>{post.num_shares} shares</span>
                                    </div>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid grid-cols-3 gap-1 text-center font-semibold text-muted-foreground">
                                    <Button variant="ghost" className="w-full"><ThumbsUp  /> Like</Button>
                                    <Button variant="ghost" className="w-full"><MessageSquare  /> Comment</Button>
                                    <Button variant="ghost" className="w-full"><Share2  /> Share</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </Card>
    );
}
