import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import twitterData from "@/data/dummy/social-media/twitter.json";
import { MessageCircle, Repeat, Heart, MoreHorizontal, Link, MapPin, Edit, Trash2, FileText } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";

interface TwitterLayoutProps {
    onGenerateReport: () => void;
}

export default function TwitterLayout({ onGenerateReport }: TwitterLayoutProps) {
    const { profile, posts } = twitterData;

    return (
        <Card>
            <div className="relative h-48 md:h-64">
                <Image src={profile.banner} layout="fill" objectFit="cover" alt="Banner" />
            </div>
            <div >
                <div className="flex justify-between items-start">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 -mt-12 md:-mt-16 border-4 border-background">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">Follow</Button>
                        <Button onClick={onGenerateReport}><FileText  />Generate Report</Button>
                    </div>
                </div>
                <div className="mt-4">
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <p className="text-sm text-muted-foreground">{profile.handle}</p>
                </div>
                <p className="mt-2">{profile.bio}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Link className="w-4 h-4" />
                        <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="hover:underline">{profile.website}</a>
                    </div>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                    <p><span className="font-bold">{profile.following}</span> <span className="text-muted-foreground">Following</span></p>
                    <p><span className="font-bold">{profile.followers}</span> <span className="text-muted-foreground">Followers</span></p>
                </div>
            </div>
            <Separator />
            <CardContent>
                <div className="py-4">
                    <div className="flex space-x-4">
                        <Avatar>
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                            <Textarea placeholder="What's happening?" />
                            <div className="flex justify-end mt-2">
                                <Button>Tweet</Button>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />
                {posts.map((tweet, index) => (
                    <div key={tweet.id}>
                        <div className="flex space-x-4 py-4">
                            <Avatar>
                                <AvatarImage src={tweet.avatar} />
                                <AvatarFallback>{tweet.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <div className="flex justify-between">
                                    <div className="flex items-center space-x-2">
                                        <p className="font-semibold">{tweet.author}</p>
                                        <p className="text-sm text-muted-foreground">{tweet.handle}</p>
                                        <p className="text-sm text-muted-foreground">· {tweet.timestamp}</p>
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
                                <p className="mt-1">{tweet.content}</p>
                                <div className="flex justify-between items-center mt-4 text-muted-foreground max-w-xs">
                                    <div className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer">
                                        <MessageCircle className="w-5 h-5" />
                                        <span>{tweet.comments}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 hover:text-green-500 cursor-pointer">
                                        <Repeat className="w-5 h-5" />
                                        <span>{tweet.retweets}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 hover:text-pink-500 cursor-pointer">
                                        <Heart className="w-5 h-5" />
                                        <span>{tweet.likes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {index < posts.length - 1 && <Separator />}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}