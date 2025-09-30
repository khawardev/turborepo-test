import { Card, CardContent } from "@/components/ui/card";
import youtubeData from "@/data/dummy/social-media/youtube.json";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { MoreVertical, Edit, Trash2, Upload, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface YouTubeLayoutProps {
    onGenerateReport: () => void;
}

export default function YouTubeLayout({ onGenerateReport }: YouTubeLayoutProps) {
    const { profile, videos } = youtubeData;

    return (
        <Card>
            <div className="relative h-32 md:h-48">
                <Image src={profile.banner} layout="fill" objectFit="cover" alt="Banner" className="rounded-t-lg" />
            </div>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-sm text-muted-foreground">{profile.handle} · {profile.subscribers} subscribers · {profile.videos} videos</p>
                        <p className="text-sm mt-2 max-w-lg">{profile.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button>Subscribe</Button>
                        <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Upload Video</Button>
                        <Button onClick={onGenerateReport}><FileText className="w-4 h-4 mr-2" />Generate Report</Button>
                    </div>
                </div>
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Videos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map((video) => (
                            <div key={video.id}>
                                <div className="relative aspect-video">
                                    <Image src={video.thumbnail} alt={video.title} layout="fill" objectFit="cover" className="rounded-lg" />
                                </div>
                                <div className="mt-2 flex justify-between">
                                    <div>
                                        <h4 className="font-semibold">{video.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{video.views} views · {video.timestamp}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}