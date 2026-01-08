import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, MessageSquare, Share2, Users } from 'lucide-react';
import { formatNumber } from "../utils";


export function SocialStatsCards({ stats, platformCount }: any) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl ">{formatNumber(stats.posts)}</p>
                            <p className="text-xs text-muted-foreground">Posts</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Eye className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl ">{formatNumber(stats.views)}</p>
                            <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
                <CardContent >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                            <Heart className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-2xl ">{formatNumber(stats.likes)}</p>
                            <p className="text-xs text-muted-foreground">Likes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Share2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl ">{formatNumber(stats.shares)}</p>
                            <p className="text-xs text-muted-foreground">Shares</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                <CardContent >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl ">{platformCount}</p>
                            <p className="text-xs text-muted-foreground">Platforms</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
