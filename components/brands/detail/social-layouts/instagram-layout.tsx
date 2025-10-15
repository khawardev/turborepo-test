import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import instagramData from "@/data/dummy/social-media/instagram.json";
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark, Edit, Trash2, PlusSquare, FileText } from "lucide-react";
import Image from "next/image";
import { Button } from "../../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/dropdown-menu";

interface InstagramLayoutProps {
    onGenerateReport: () => void;
}

export default function InstagramLayout({ onGenerateReport }: InstagramLayoutProps) {
    const { profile, posts } = instagramData;

    return (
        <Card>
            <CardContent className="p-4 md:p-8">
                <header className="flex items-center space-x-8">
                    <Avatar className="w-24 h-24 md:w-36 md:h-36">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-2xl">{profile.username}</h2>
                            <Button variant="secondary">Follow</Button>
                            <Button variant="ghost" size="icon"><PlusSquare /></Button>
                            <Button onClick={onGenerateReport} size="sm"><FileText  />Report</Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreHorizontal className="w-5 h-5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Settings</DropdownMenuItem>
                                    <DropdownMenuItem>Logout</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center space-x-8">
                            <p><span className="font-semibold">{profile.posts}</span> posts</p>
                            <p><span className="font-semibold">{profile.followers}</span> followers</p>
                            <p><span className="font-semibold">{profile.following}</span> following</p>
                        </div>
                        <div>
                            <p className="font-semibold">{profile.name}</p>
                            <p className="whitespace-pre-line">{profile.bio}</p>
                            <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="text-blue-500 font-semibold">{profile.website}</a>
                        </div>
                    </div>
                </header>
                <main className="mt-12">
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {posts.map((post) => (
                            <div key={post.id} className="relative aspect-square group">
                                <Image src={post.image} alt="Instagram Post" layout="fill" objectFit="cover" />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-white">
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem><Edit  />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500"><Trash2  />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-4 text-white transition-opacity">
                                    <div className="flex items-center space-x-1">
                                        <Heart className="w-6 h-6" />
                                        <span>{post.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <MessageCircle className="w-6 h-6" />
                                        <span>{post.comments}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </CardContent>
        </Card>
    );
}