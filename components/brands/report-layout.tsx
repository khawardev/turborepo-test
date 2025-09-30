import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import reportData from "@/data/dummy/social-media/report.json";
import { ThumbsUp, MessageSquare, Share2, ArrowUp, Users, BarChart2, PieChart, CheckCircle } from "lucide-react";

interface ReportLayoutProps {
    platform: string;
}

export default function ReportLayout({ platform }: ReportLayoutProps) {
    const { summary, audience, performance, recommendations } = reportData;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{platform} Performance Report</CardTitle>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalPosts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalLikes}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalComments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.engagementRate}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Audience</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Users className="h-8 w-8 mr-4" />
                            <div>
                                <p className="text-2xl font-bold">{audience.followers}</p>
                                <p className="text-sm text-muted-foreground">Followers</p>
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-green-500">
                            <ArrowUp className="h-4 w-4 mr-2" />
                            <span>{audience.growth} growth</span>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold">Demographics</h4>
                            {audience.demographics.map(d => (
                                <div key={d.group} className="flex justify-between items-center mt-2">
                                    <span className="text-sm">{d.group}</span>
                                    <div className="w-2/3 bg-muted rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${d.percentage}%` }}></div>
                                    </div>
                                    <span className="text-sm font-semibold">{d.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold">Top Posts</h4>
                        <div className="space-y-4 mt-2">
                            {performance.topPosts.map(post => (
                                <div key={post.id} className="p-2 border rounded-lg">
                                    <p className="text-sm truncate">{post.content}</p>
                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                        <span>{post.likes} Likes</span>
                                        <span>{post.comments} Comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <h4 className="font-semibold mt-6">Sentiment Analysis</h4>
                        <div className="flex justify-around items-center mt-2 p-4 rounded-lg bg-muted">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-500">{performance.sentiment.positive}%</p>
                                <p className="text-sm">Positive</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-500">{performance.sentiment.neutral}%</p>
                                <p className="text-sm">Neutral</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-500">{performance.sentiment.negative}%</p>
                                <p className="text-sm">Negative</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 mr-2 mt-1 text-green-500" />
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
