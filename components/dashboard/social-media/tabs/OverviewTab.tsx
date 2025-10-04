'use client'

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";
import { Activity, Award, Globe, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomChartTooltipContent from "@/components/dashboard/shared/CustomChartTooltipContent";
import KpiCard from "../charts-and-cards/KpiCard";
import CustomLegend from "../../shared/Legend";

export default function OverviewTab({ data }: any) {
    const { theme } = useTheme();
    console.log(data, `<-> data <->`);
    

    const { platforms, colors } = data;
    const { PLATFORM_COLORS } = colors;
    const platformKeys = Object.keys(platforms);

    const platformData = Object.values(platforms).map((platform: any) => ({
        name: platform.name,
        followers: platform.followers,
        posts: platform.posts,
        engagement: platform.avgEngagement,
        sentiment: platform.sentiment.positive,
    }));

    const totalReach = platformData.reduce((sum: any, p: any) => sum + p.followers, 0);
    const totalPosts = platformData.reduce((sum: any, p: any) => sum + p.posts, 0);
    const avgSentiment = Math.round(platformData.reduce((sum: any, p: any) => sum + p.sentiment, 0) / platformData.length);


    let platformName = '';
    let platformFollowersInK = '0k';

    if (platformData.length > 0) {
        const topPlatform = platformData.reduce((prev, current) =>
            prev.followers > current.followers ? prev : current
        );
        platformName = topPlatform.name;
        platformFollowersInK = `${Math.round(topPlatform.followers / 1000)}k`;
    }


    return (
        <Tabs defaultValue="total_overview">
            <div className="w-full">
                <TabsList>
                    <TabsTrigger value="total_overview">Total Overview</TabsTrigger>
                    {platformKeys.map(key => <TabsTrigger key={key} value={key}>{platforms[key].name}</TabsTrigger>)}
                </TabsList>
            </div>
            <div>
                <TabsContent value="total_overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KpiCard title="Total Reach" value={`${(totalReach / 1000).toFixed(0)}K+`} description="Combined followers" icon={Globe} />
                        <KpiCard title="Total Content" value={totalPosts} description="Posts across all platforms" icon={Activity} />
                        <KpiCard title="Avg Positive Sentiment" value={`${avgSentiment}%`} description="Average across platforms" icon={Heart} />
                        <KpiCard title="Top Platform" value={platformName} description={`${platformFollowersInK} followers of reach`} icon={Award} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader><CardTitle>Platform Performance Overview</CardTitle></CardHeader>
                            <CardContent className="h-[400px] w-full p-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={platformData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid horizontal={false} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => value}
                                        />
                                        <Tooltip content={<CustomChartTooltipContent />} />
                                        <Legend content={<CustomLegend />} />
                                        <Bar yAxisId="left" dataKey="followers" fill="#ef4444" name="Followers" radius={6} />
                                        <Bar yAxisId="right" dataKey="engagement" fill="#75E80B" name="Avg Engagement" radius={6} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3">
                            <CardHeader><CardTitle>Platform Reach Distribution</CardTitle></CardHeader>
                            <CardContent className="h-[400px] w-full p-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={platformData} dataKey="followers" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                                            {platformData.map((entry: any, index: any) => (
                                                <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name]} stroke={'none'} />
                                            ))}
                                        </Pie>
                                        <Legend content={<CustomLegend colors={Object.values(PLATFORM_COLORS)} />} />
                                        <Tooltip content={<CustomChartTooltipContent />} />
                                    </PieChart>
                                </ResponsiveContainer>
                             
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {platformKeys.map(key => (
                    <TabsContent key={key} value={key}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span style={{ color: PLATFORM_COLORS[platforms[key].name] }}>{platforms[key].name}</span> Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <KpiCard title="Followers" value={platforms[key].followers.toLocaleString()} />
                                <KpiCard title="Posts" value={platforms[key].posts} />
                                {/* <KpiCard title="Avg Engagement" value={platforms[key].avgEngagement.toFixed(1)} /> */}
                                <KpiCard title="Positive Sentiment" value={`${platforms[key].sentiment.positive}%`} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    );
}